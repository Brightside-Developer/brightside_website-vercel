import { createClient } from '@supabase/supabase-js';

// Fallback values prevent createClient from throwing during Next.js static
// prerendering when env vars aren't available (e.g. CI build without secrets).
// All actual API calls happen client-side at runtime where real values are set.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
