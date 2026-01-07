const { MercadoPagoConfig, PreApprovalPlan } = require('mercadopago');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || process.env.NEXT_PUBLIC_MP_FRONTEND_KEY || process.env.MP_FRONTEND_KEY
});

// Using ANON key since SERVICE_ROLE is missing
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function createPlans() {
    try {
        console.log('Fetching products using ANON key...');
        const { data: products, error } = await supabase
            .from('products')
            .select('*');

        if (error) {
            console.error('Supabase Error:', error);
            process.exit(1);
        }

        const planResource = new PreApprovalPlan(client);
        const planMapping = {};

        for (const product of products) {
            console.log(`Creating plan for: ${product.title} (Price: ${product.price})`);

            try {
                const planData = {
                    reason: `Suscripción Mensual: ${product.title}`,
                    auto_recurring: {
                        frequency: 1,
                        frequency_type: 'months',
                        transaction_amount: Number(product.price),
                        currency_id: 'CLP',
                    },
                    back_url: 'https://alfamonte.cl/success_subscription',
                };

                const result = await planResource.create({ body: planData });
                console.log(`Plan created for ${product.title}: ${result.id}`);
                planMapping[product.id] = result.id;
            } catch (planError) {
                console.error(`Failed to create plan for ${product.title}:`, planError.message || planError);
            }
        }

        fs.writeFileSync(path.join(__dirname, '../mp_plans_mapping.json'), JSON.stringify(planMapping, null, 2));
        console.log('Mapping saved to mp_plans_mapping.json');
        console.log('IMPORTANT: Database updates skipped due to limited permissions.');

    } catch (error) {
        console.error('Critical Error:', error);
    }
}

createPlans();
