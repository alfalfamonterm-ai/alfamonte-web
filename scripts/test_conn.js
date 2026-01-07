const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
    console.log('Testing connectivity...');
    try {
        const { data, error } = await supabase.from('products').select('id, title').limit(1);
        if (error) {
            console.error('Error:', error);
        } else {
            console.log('Connection successful. Product found:', data[0]?.title);
        }
    } catch (e) {
        console.error('Crash:', e);
    }
}

test();
