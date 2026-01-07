const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testUpdate() {
    console.log('Testing update with ANON key...');
    try {
        const mapping = JSON.parse(fs.readFileSync(path.join(__dirname, '../mp_plans_mapping.json'), 'utf8'));
        const firstProductId = Object.keys(mapping)[0];
        const firstPlanId = mapping[firstProductId];

        if (!firstProductId || !firstPlanId) {
            console.error('Mapping is empty or invalid.');
            return;
        }

        console.log(`Trying to update product ${firstProductId} with plan ${firstPlanId}...`);

        const { error } = await supabase
            .from('products')
            .update({ mp_plan_id: firstPlanId })
            .eq('id', firstProductId);

        if (error) {
            console.error('Update FAILED:', error.message);
        } else {
            console.log('Update SUCCESSFUL! RLS might be off or policy allows it.');
        }
    } catch (e) {
        console.error('Crash:', e);
    }
}

testUpdate();
