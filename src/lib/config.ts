// // ============================================
// // DATA SOURCE CONFIGURATION
// // ============================================
// // EDIT THIS FILE IN GITHUB to switch between mock data and Supabase
// // DO NOT EDIT IN FIGMA MAKE

// /**
//  * Set this to true when you've completed Supabase integration
//  * Set to false to use mock data for development/testing
//  */
// export const USE_SUPABASE = false;

// /**
//  * Supabase configuration
//  * These will be set up when you integrate Supabase
//  * In production, replace these with your actual values or use environment variables
//  */
// export const SUPABASE_CONFIG = {
//   url: '',
//   anonKey: '',
// };
// lib/config.ts

// lib/config.ts

// Use import.meta.env for Vite/modern bundlers
// lib/config.ts

// Cast to 'any' to bypass the "Property env does not exist" error
const meta = (import.meta as any).env;

export const USE_SUPABASE = meta?.VITE_USE_SUPABASE === 'true' || 
                           meta?.NEXT_PUBLIC_USE_SUPABASE === 'true';

export const SUPABASE_CONFIG = {
  url: meta?.VITE_SUPABASE_URL || meta?.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: meta?.VITE_SUPABASE_ANON_KEY || meta?.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
};

export const GOOGLE_DRIVE_CONFIG = {
  clientId: meta?.VITE_GOOGLE_CLIENT_ID || meta?.GOOGLE_CLIENT_ID || '',
  folderId: meta?.VITE_GDRIVE_FOLDER_ID || meta?.GDRIVE_FOLDER_ID || '',
  apiKey: meta?.VITE_GDRIVE_API_KEY || meta?.GDRIVE_API_KEY || '',
};