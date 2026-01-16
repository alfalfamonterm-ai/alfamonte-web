
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env locally manually since dotenv might not parse .env.local automatically in all setups
// Or just read variables we know exist
const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = require('dotenv').parse(fs.readFileSync(envPath));

// Fallback or use loaded config
const SUPABASE_URL = envConfig.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = envConfig.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing credentials');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function syncCustomerTotals() {
    console.log("--- Starting Financial Sync ---");

    // 1. Get all customers
    const { data: customers, error: cError } = await supabase
        .from('customers')
        .select('id, email, name');

    if (cError) throw cError;
    console.log(`Found ${customers.length} customers to sync.`);

    let updatedCount = 0;

    for (const c of customers) {
        if (!c.email) continue;

        // 2. Sum orders (Using JSONB filter for guest_info or linking by customer_id if available)
        // Since getting direct column didn't work, we try JSONB filter
        const { data: orders, error: oError } = await supabase
            .from('orders')
            .select('total_amount')
            .filter('guest_info->>email', 'eq', c.email);
        // Optionally filter by status: .neq('status', 'rejected')

        if (oError) {
            console.error(`Error fetching orders for ${c.email}:`, oError);
            continue;
        }

        const realTotal = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
        // Points logic: 1 point per $1000 spent (standard rule)
        const realPoints = Math.floor(realTotal / 1000);

        // 3. Update Customer
        console.log(`[${c.name}] Total: $${realTotal} | Points: ${realPoints}`);

        const { error: uError } = await supabase
            .from('customers')
            .update({
                total_spent: realTotal,
                reward_points: realPoints,
                updated_at: new Date().toISOString()
            })
            .eq('id', c.id);

        if (uError) {
            console.error(`Failed to update ${c.name}:`, uError);
        } else {
            updatedCount++;
        }
    }

    console.log(`\nSync Complete. Updated ${updatedCount} customers.`);
}

syncCustomerTotals().catch(console.error);
