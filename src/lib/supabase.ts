// // ============================================
// // SUPABASE CLIENT & API FUNCTIONS
// // ============================================
// // EDIT THIS FILE IN GITHUB when implementing Supabase integration
// // DO NOT EDIT IN FIGMA MAKE

// import { SUPABASE_CONFIG } from './config';
// import type { PeerSupportItem, Activity, ResourceCategory } from './types';

// // TODO: Uncomment when you install Supabase client
// // import { createClient } from '@supabase/supabase-js';
// // 
// // export const supabase = createClient(
// //   SUPABASE_CONFIG.url,
// //   SUPABASE_CONFIG.anonKey
// // );

// // ============================================
// // PEER SUPPORT DATA FUNCTIONS
// // ============================================

// export async function fetchPeerSupportData(): Promise<PeerSupportItem[]> {
//   // TODO: Implement Supabase query
//   // Example:
//   // const { data, error } = await supabase
//   //   .from('peer_support')
//   //   .select('*')
//   //   .order('created_at', { ascending: false });
//   // 
//   // if (error) throw error;
//   // return data || [];
  
//   throw new Error('Supabase not yet implemented');
// }

// export async function createPeerSupportItem(item: Omit<PeerSupportItem, 'id'>): Promise<PeerSupportItem> {
//   // TODO: Implement Supabase insert
//   throw new Error('Supabase not yet implemented');
// }

// export async function updatePeerSupportItem(id: string, updates: Partial<PeerSupportItem>): Promise<PeerSupportItem> {
//   // TODO: Implement Supabase update
//   throw new Error('Supabase not yet implemented');
// }

// export async function deletePeerSupportItem(id: string): Promise<void> {
//   // TODO: Implement Supabase delete
//   throw new Error('Supabase not yet implemented');
// }

// // ============================================
// // ACADEMIC ACTIVITIES FUNCTIONS
// // ============================================

// export async function fetchActivities(): Promise<Activity[]> {
//   // TODO: Implement Supabase query
//   throw new Error('Supabase not yet implemented');
// }

// export async function createActivity(activity: Omit<Activity, 'id'>): Promise<Activity> {
//   // TODO: Implement Supabase insert
//   throw new Error('Supabase not yet implemented');
// }

// export async function updateActivity(id: string, updates: Partial<Activity>): Promise<Activity> {
//   // TODO: Implement Supabase update
//   throw new Error('Supabase not yet implemented');
// }

// export async function deleteActivity(id: string): Promise<void> {
//   // TODO: Implement Supabase delete
//   throw new Error('Supabase not yet implemented');
// }

// // ============================================
// // ACADEMIC RESOURCES FUNCTIONS
// // ============================================

// export async function fetchResourceCategories(): Promise<ResourceCategory[]> {
//   // TODO: Implement Supabase query
//   throw new Error('Supabase not yet implemented');
// }

// export async function createResourceCategory(category: Omit<ResourceCategory, 'id'>): Promise<ResourceCategory> {
//   // TODO: Implement Supabase insert
//   throw new Error('Supabase not yet implemented');
// }

// export async function updateResourceCategory(id: string, updates: Partial<ResourceCategory>): Promise<ResourceCategory> {
//   // TODO: Implement Supabase update
//   throw new Error('Supabase not yet implemented');
// }

// export async function deleteResourceCategory(id: string): Promise<void> {
//   // TODO: Implement Supabase delete
//   throw new Error('Supabase not yet implemented');
// }
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from './config';
import type { PeerSupportItem, Activity, ResourceCategory } from './types';

// ============================================
// SUPABASE CLIENT INITIALIZATION
// ============================================
export const supabase = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey
);

// ============================================
// 1. PEER SUPPORT DATA FUNCTIONS
// ============================================

export async function fetchPeerSupportData(): Promise<PeerSupportItem[]> {
  const { data, error } = await supabase
    .from('peer_support')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Fetch Error (Peer Support):', error.message);
    return [];
  }
  return data || [];
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