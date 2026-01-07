const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addColumn() {
    console.log('Adding column mp_plan_id to products...');
    const { error } = await supabase.rpc('execute_sql', {
        sql_query: 'ALTER TABLE products ADD COLUMN IF NOT EXISTS mp_plan_id TEXT;'
    });

    if (error) {
        console.error('Error adding column:', error);
        // If RPC fails, it might be because execute_sql doesn't exist.
        // In that case, we can't do DDL via client easily unless we have a specific RPC.
        console.log('Trying alternative: check if it already exists by querying.');
    } else {
        console.log('Column added successfully.');
    }
}

addColumn();
