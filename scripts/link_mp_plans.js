const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function updateProducts() {
    try {
        const mappingPath = path.join(__dirname, '../mp_plans_mapping.json');
        if (!fs.existsSync(mappingPath)) {
            console.error('Mapping file not found!');
            return;
        }

        const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
        console.log(`Found ${Object.keys(mapping).length} plans to link.`);

        for (const [productId, planId] of Object.entries(mapping)) {
            console.log(`Linking product ${productId} to plan ${planId}...`);

            // Note: Since SERVICE_ROLE is missing, we hope the user either disabled RLS 
            // or we might need another approach if this fails.
            // However, usually for these scripts we need the service key.
            // I will try with the ANON key first as a last resort, but it likely fails RLS.
            const { error } = await supabase
                .from('products')
                .update({ mp_plan_id: planId })
                .eq('id', productId);

            if (error) {
                console.error(`Error linking ${productId}:`, error.message);
            } else {
                console.log(`Successfully linked ${productId}`);
            }
        }

        console.log('Update process finished.');

    } catch (error) {
        console.error('Critical Error:', error);
    }
}

updateProducts();
