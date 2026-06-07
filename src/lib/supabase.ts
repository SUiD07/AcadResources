import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from './config';
import type { PeerSupportItem, Activity, ResourceCategory, StudentDocument } from './types';

// ============================================
// SUPABASE CLIENT INITIALIZATION
// ============================================
export const supabase = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey
);

// ============================================
// 1. PEER SUPPORT & STUDENT DOCUMENTS DATA FUNCTIONS
// ============================================

export async function fetchPeerSupportData(): Promise<StudentDocument[]> {
  const PAGE_SIZE = 1000;
  let from = 0;
  let allDocuments: StudentDocument[] = [];

  while (true) {
    const { data, error } = await supabase
      .from('peer_support')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      console.error('Fetch Error (Peer Support):', error.message);
      return [];
    }

    if (!data || data.length === 0) {
      break;
    }

    allDocuments.push(...data);

    console.log(
      `Fetched ${data.length} rows (total: ${allDocuments.length})`
    );

    if (data.length < PAGE_SIZE) {
      break;
    }

    from += PAGE_SIZE;
  }

  return allDocuments;
}

export async function fetchStudentDocuments(): Promise<StudentDocument[]> {
  const PAGE_SIZE = 1000;
  let from = 0;
  let allDocuments: StudentDocument[] = [];

  while (true) {
    const { data, error } = await supabase
      .from('student_documents')
      .select('*')
      .order('upload_date', { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      console.error('Fetch Error (Student Documents):', error.message);
      return [];
    }

    if (!data || data.length === 0) {
      break;
    }

    allDocuments.push(...data);

    console.log(
      `Fetched ${data.length} rows (total: ${allDocuments.length})`
    );

    if (data.length < PAGE_SIZE) {
      break;
    }

    from += PAGE_SIZE;
  }

  return allDocuments;
}

export async function createPeerSupportItem(item: Omit<PeerSupportItem, 'id'>): Promise<PeerSupportItem> {
  const { data, error } = await supabase
    .from('peer_support')
    .insert(item)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePeerSupportItem(id: string, updates: Partial<PeerSupportItem>): Promise<PeerSupportItem> {
  const { data, error } = await supabase
    .from('peer_support')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePeerSupportItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('peer_support')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================
// 2. ACADEMIC ACTIVITIES FUNCTIONS
// ============================================

export async function fetchActivities(): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('date', { ascending: true });

  if (error) {
    console.error('Fetch Error (Activities):', error.message);
    return [];
  }
  return data || [];
}

export async function createActivity(activity: Omit<Activity, 'id'>): Promise<Activity> {
  const { data, error } = await supabase
    .from('activities')
    .insert(activity)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateActivity(id: string, updates: Partial<Activity>): Promise<Activity> {
  const { data, error } = await supabase
    .from('activities')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteActivity(id: string): Promise<void> {
  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================
// 3. ACADEMIC RESOURCES FUNCTIONS
// ============================================

export async function fetchResourceCategories(): Promise<ResourceCategory[]> {
  const { data, error } = await supabase
    .from('resource_categories')
    .select('*')
    .order('title', { ascending: true });

  if (error) {
    console.error('Fetch Error (Resources):', error.message);
    return [];
  }
  return data || [];
}

export async function createResourceCategory(category: Omit<ResourceCategory, 'id'>): Promise<ResourceCategory> {
  const { data, error } = await supabase
    .from('resource_categories')
    .insert(category)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateResourceCategory(id: string, updates: Partial<ResourceCategory>): Promise<ResourceCategory> {
  const { data, error } = await supabase
    .from('resource_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteResourceCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('resource_categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
