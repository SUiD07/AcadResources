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
  is_precourse: boolean;
  description?: string;
  uploaded_by: string;
  upload_date: string;
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

export type Section = 'peer-support' | 'academic-activities' | 'academic-resources';
