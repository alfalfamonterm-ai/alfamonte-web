import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function migrateCustomersFromOperations() {
    console.log('🔄 Migrating customers from operations to CRM...\n');

    try {
        // 1. Get all unique customer names from sales operations
        const { data: operations, error: opsError } = await supabase
            .from('operations')
            .select('description')
            .eq('category', 'Venta')
            .not('description', 'is', null);

        if (opsError) throw opsError;

        // Extract customer names from "Venta a [Name]" format
        const uniqueNames = [...new Set(
            operations
                ?.map(o => {
                    const desc = o.description?.trim() || '';
                    // Match "Venta a [Name]" pattern
                    const match = desc.match(/Venta a (.+)/i);
                    return match ? match[1].trim() : null;
                })
                .filter(Boolean)
        )] as string[];

        console.log(`📊 Found ${uniqueNames.length} unique customer names in operations\n`);

        // 2. Get existing customers
        const { data: existingCustomers, error: custError } = await supabase
            .from('customers')
            .select('name');

        if (custError) throw custError;

        const existingNames = new Set(existingCustomers?.map(c => c.name.toLowerCase().trim()));
        console.log(`✅ ${existingNames.size} customers already in CRM\n`);

        // 3. Find customers that need to be created
        const newCustomers = uniqueNames.filter(name =>
            !existingNames.has(name.toLowerCase())
        );

        console.log(`➕ ${newCustomers.length} new customers to create:\n`);
        newCustomers.forEach((name, i) => {
            console.log(`  ${i + 1}. ${name}`);
        });

        if (newCustomers.length === 0) {
            console.log('\n✨ All customers are already in CRM!');
            return;
        }

        // 4. Create new customer records
        console.log('\n🚀 Creating customer records...\n');

        const customersToInsert = newCustomers.map(name => ({
            name: name,
            type: 'particular',
            status: 'active',
            total_purchased: 0,
            data_complete: false // Mark as incomplete since we only have name
        }));

        const { data: inserted, error: insertError } = await supabase
            .from('customers')
            .insert(customersToInsert)
            .select();

        if (insertError) {
            console.error('❌ Error creating customers:', insertError);
            throw insertError;
        }

        console.log(`✅ Successfully created ${inserted?.length} customer records\n`);

        // 5. Summary
        console.log('📋 Migration Summary:');
        console.log(`  - Total unique names in operations: ${uniqueNames.length}`);
        console.log(`  - Already in CRM: ${existingNames.size}`);
        console.log(`  - Newly created: ${inserted?.length}`);
        console.log(`  - Marked as incomplete: ${inserted?.length} (missing phone/email)\n`);

        console.log('⚠️  Next steps:');
        console.log('  1. Review incomplete customers in /admin/crm');
        console.log('  2. Complete customer data when processing their next sale');
        console.log('  3. Run the SQL migration to assign customer_number if not done yet\n');

    } catch (error) {
        console.error('💥 Migration failed:', error);
        process.exit(1);
    }
}

migrateCustomersFromOperations();
