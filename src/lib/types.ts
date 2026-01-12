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

export interface Activity {
  id: string;
  title: string;
  description: string;
  icon: string; // Icon name as string for Supabase storage
  date: string;
  status: string;
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
