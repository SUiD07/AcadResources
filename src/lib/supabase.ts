import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from './config';
import type { PeerSupportItem, Activity, ResourceCategory, StudentDocument } from './types';
import type { Generation, Board, BoardContent } from './types'

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

export async function fetchPeerSupportData(): Promise<PeerSupportItem[]> {
  const PAGE_SIZE = 1000;
  let from = 0;
  let allDocuments: PeerSupportItem[] = [];

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
// 1.1 STUDENT DOCUMENTS ADMIN FUNCTIONS
// ============================================

export async function updateStudentDocument(id: number, updates: Partial<StudentDocument>): Promise<StudentDocument> {
  const { data, error } = await supabase
    .from('student_documents')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteStudentDocument(id: number): Promise<void> {
  const { error } = await supabase
    .from('student_documents')
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
    .from('resources')
    .select('*')
    .order('title', { ascending: true });

  if (error) {
    console.error('Fetch Error (Resources):', error.message);
    return [];
  }
  console.log(`Fetched ${data?.length || 0} resource categories`);
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
    .maybeSingle();

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

// ============================================
// GENERATIONS
// ============================================

export async function fetchGenerations(): Promise<Generation[]> {
  const { data, error } = await supabase
    .from('generations')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Fetch Error (Generations):', error.message);
    return [];
  }
  return data ?? [];
}

export async function createGeneration(
  gen: Omit<Generation, 'id' | 'created_at'>
): Promise<Generation> {
  const { data, error } = await supabase
    .from('generations')
    .insert(gen)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateGeneration(
  id: string,
  updates: Partial<Generation>
): Promise<Generation> {
  const { data, error } = await supabase
    .from('generations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteGeneration(id: string): Promise<void> {
  const { error } = await supabase
    .from('generations')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================
// BOARDS
// ============================================

export async function fetchBoardsByGeneration(
  generationId: string
): Promise<Board[]> {
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('generation_id', generationId)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Fetch Error (Boards):', error.message);
    return [];
  }
  return data ?? [];
}

export async function createBoard(
  board: Omit<Board, 'id' | 'created_at' | 'updated_at'>
): Promise<Board> {
  const { data, error } = await supabase
    .from('boards')
    .insert(board)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBoard(
  id: string,
  updates: Partial<Board>
): Promise<Board> {
  const { data, error } = await supabase
    .from('boards')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBoard(id: string): Promise<void> {
  const { error } = await supabase
    .from('boards')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================
// BOARD CONTENT
// ============================================

export async function fetchBoardContent(
  boardId: string
): Promise<BoardContent | null> {
  const { data, error } = await supabase
    .from('board_content')
    .select('*')
    .eq('board_id', boardId)
    .maybeSingle();

  if (error) {
    console.error('Fetch Error (Board Content):', error.message);
    return null;
  }
  return data;
}

export async function saveBoardContent(
  boardId: string,
  content: object
): Promise<void> {
  const { error } = await supabase
    .from('board_content')
    .upsert(
      {
        board_id: boardId,
        content,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'board_id' }
    );

  if (error) throw error;
}