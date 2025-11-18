import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your_fallback_url';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your_fallback_key';

export const supabase = createClient(supabaseUrl, supabaseKey);