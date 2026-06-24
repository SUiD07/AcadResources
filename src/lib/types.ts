// ============================================
// TYPE DEFINITIONS
// ============================================
// This file contains all shared TypeScript types and interfaces
// DO NOT EDIT IN GITHUB unless you're adding new types
// SAFE TO EDIT IN FIGMA MAKE if adding new UI features

export interface PeerSupportItem {
  id: string;
  block_name: string;
  block_code?: string;
  thumbnail: string;
  drive_link: string;
  generation: string;
  block: string;
  category: string;
  board_exam?: string;
  folder_path?: string;
}

export interface StudentDocument {
  id: number;
  title: string;
  file_url: string;
  folder_path: string;
  student_year?: number;
  block: string;
  doc_type: string;
  generation: number;
  description?: string;
  uploaded_by: string;
  upload_date: string;
  thumbnail_url?: string;
  board_exam?: string;
  drive_id?: string;
  is_overridden?: boolean; 
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  status: "Upcoming" | "Ongoing" | "Completed";
  icon: string;
}

export interface ResourceCategory {
  id: string;
  title: string;
  description: string;
  icon: string; // Icon name as string for Supabase storage
  items: ResourceItem[];
  link: string;
}

export interface ResourceItem {
  name: string;
  type: string;
}

export type Section = 'peer-support' | 'academic-activities' | 'academic-resources' | 'career-navigation' | 'board' | 'keyword-management';

// ใช้สำหรับBoard
export interface Generation {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  order_index: number;
  created_at: string;
}

export interface Board {
  id: string;
  generation_id: string;
  title: string;
  icon: string | null;
  cover_url: string | null;
  order_index: number;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface BoardContent {
  id: string;
  board_id: string;
  content: object;        // TipTap JSON
  updated_at: string;
  updated_by: string | null;
}

export interface KeywordConfig {
  id: string;
  config_type: 'doc_type' | 'block_mapping' | 'board_exam';
  label: string;
  keys: string[];
  year?: string;
  created_at?: string;
  updated_at?: string;
}
export interface DriveSyncRecord {
  drive_id: string;
  title: string;
  file_url: string;
  folder_path: string;
  thumbnail_url?: string;
  generation: number;
  student_year: number;
  is_folder:boolean;
  modified_time?: string;
  synced_at?: string;
}