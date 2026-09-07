import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hfxnbypigvcyapfgljmd.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_zNZ5rYreGVkOwtp7M2XMLg_KD8dVcVZ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
