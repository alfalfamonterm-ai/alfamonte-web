import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function applyMigration() {
    console.log('🚀 Starting customer_number migration...\n');

    try {
        // Read the SQL migration file
        const sqlPath = path.join(__dirname, 'migrations', 'add_customer_number.sql');
        const sql = fs.readFileSync(sqlPath, 'utf-8');

        // Split by semicolons and execute each statement
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

        for (let i = 0; i < statements.length; i++) {
            const stmt = statements[i];
            console.log(`[${i + 1}/${statements.length}] Executing...`);

            const { error } = await supabase.rpc('exec_sql', { sql_query: stmt });

            if (error) {
                console.error(`❌ Error on statement ${i + 1}:`, error.message);
                console.error('Statement:', stmt.substring(0, 100) + '...');
                throw error;
            }

            console.log(`✅ Success\n`);
        }

        console.log('🎉 Migration completed successfully!\n');

        // Verify results
        console.log('📊 Verification:');
        const { data: customers, error: verifyError } = await supabase
            .from('customers')
            .select('customer_number, name, phone, data_complete')
            .order('customer_number')
            .limit(10);

        if (verifyError) {
            console.error('Verification error:', verifyError);
        } else {
            console.log('\nFirst 10 customers:');
            console.table(customers);
        }

        // Check purchase history view
        const { data: history, error: historyError } = await supabase
            .from('customer_purchase_history')
            .select('*')
            .order('total_spent', { ascending: false })
            .limit(5);

        if (historyError) {
            console.error('Purchase history view error:', historyError);
        } else {
            console.log('\nTop 5 customers by spending:');
            console.table(history);
        }

    } catch (error) {
        console.error('💥 Migration failed:', error);
        process.exit(1);
    }
}

applyMigration();
