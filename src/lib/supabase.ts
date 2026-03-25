import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Warn in dev if env vars are missing, but don't crash
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[HukukAI] VITE_SUPABASE_URL veya VITE_SUPABASE_ANON_KEY eksik. ' +
    '.env dosyanızı kontrol edin.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
