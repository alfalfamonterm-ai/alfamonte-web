require('dotenv').config({ path: '.env.local' });
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
