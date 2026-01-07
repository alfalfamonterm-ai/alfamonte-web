require('dotenv').config({ path: '.env.local' });
console.log('SERVICE_ROLE_KEY_EXISTS:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
