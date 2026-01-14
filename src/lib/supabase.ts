import { createClient } from '@supabase/supabase-js';

// Safe initialization for Build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'dummy-key';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
