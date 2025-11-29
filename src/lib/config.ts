// ============================================
// DATA SOURCE CONFIGURATION
// ============================================

/**
 * Set this to true when you've completed Supabase integration
 * Set to false to use mock data for development/testing
 */
// 3. START WITH FALSE TO TEST MOCK DATA
export const USE_SUPABASE = true;

/**
 * Supabase configuration
 */
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // This error check ensures your .env.local is working
  throw new Error("Missing Supabase environment variables! Check your .env.local file.");
}

export const SUPABASE_CONFIG = {
  // It MUST read the value from environment variables
  url: url,
  anonKey: anonKey,
};