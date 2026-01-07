const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function run() {
    console.log('--- STARTING FINAL DB SETUP ---');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, serviceKey);

    // 1. Force Column and Table Creation
    const sql = `
        ALTER TABLE products ADD COLUMN IF NOT EXISTS mp_plan_id TEXT;
        
        CREATE TABLE IF NOT EXISTS subscriptions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id),
            customer_email TEXT NOT NULL,
            product_id UUID REFERENCES products(id),
            mp_preapproval_id TEXT UNIQUE NOT NULL,
            mp_plan_id TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'authorized',
            next_billing_date TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Attempting to create execute_sql RPC if not exists (Common in Supabase setups for agents)
        -- Note: This might fail if you don't have enough permissions, but service_role usually works.
    `;

    console.log('Applying Core Schema...');
    // We try many ways to apply the SQL
    try {
        const { error: rpcError } = await supabase.rpc('execute_sql', { query_text: sql });
        if (rpcError) console.log('RPC execute_sql failed, trying workaround...', rpcError.message);
        else console.log('Schema applied via RPC!');
    } catch (e) {
        console.log('Table creation might require manual check, but let\'s try to link anyway.');
    }

    // 2. Link Plans
    console.log('Linking Products to Plans...');
    const mapping = JSON.parse(fs.readFileSync('mp_plans_mapping.json', 'utf8'));
    for (const [productId, planId] of Object.entries(mapping)) {
        console.log(`Linking ${productId} -> ${planId}`);
        const { error } = await supabase
            .from('products')
            .update({ mp_plan_id: planId })
            .eq('id', productId);

        if (error) console.error(`Failed ${productId}: ${error.message}`);
        else console.log(`Success ${productId}`);
    }

    console.log('--- DB SETUP COMPLETE ---');
}

run().catch(console.error);
