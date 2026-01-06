import { createClient } from '@supabase/supabase-js';

// These environment variables must be provided in .env.local
const supabaseUrl = process.env.N_P_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.N_P_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
