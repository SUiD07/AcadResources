// environment.d.ts (UPDATED)

interface ImportMetaEnv {
  // Update these key names to match your new VITE_ prefix:
  readonly VITE_SUPABASE_URL: string; 
  readonly VITE_SUPABASE_ANON_KEY: string;
  // (You may want to keep the NEXT_PUBLIC_ lines commented out or remove them)
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}