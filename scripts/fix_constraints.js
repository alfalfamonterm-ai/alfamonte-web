const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const envPath = path.join(__dirname, '..', '.env.local');
    if (!fs.existsSync(envPath)) {
        console.error('❌ .env.local not found');
        process.exit(1);
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    envContent.split('\n').forEach(line => {
        const [key, val] = line.split('=');
        if (key && val) envVars[key.trim()] = val.trim().replace(/"/g, '');
    });

    const supabase = createClient(
        envVars['NEXT_PUBLIC_SUPABASE_URL'],
        envVars['SUPABASE_SERVICE_ROLE_KEY'] || envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY']
    );

    console.log('🧹 Cleaning up test order items to allow product deletion...');

    // Fix: ID is UUID, so 0 might not work. Use created_at filter or a valid UUID check.
    const { error, count } = await supabase
        .from('order_items')
        .delete({ count: 'exact' })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Valid UUID format to match all

    if (error) {
        console.error('❌ Error cleaning order_items:', error.message);
    } else {
        console.log(`✅ Order items cleared. Count: ${count}`);
    }
}

main();
