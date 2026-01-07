import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function runMigration() {
    const filePath = process.argv[2];
    if (!filePath) {
        console.error('Usage: tsx run_migration.ts <path_to_sql>');
        process.exit(1);
    }

    console.log(`🚀 Running migration: ${filePath}`);

    try {
        const sql = fs.readFileSync(filePath, 'utf-8');

        console.log(`Executing full SQL script...`);
        const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

        if (error) {
            console.error('Migration error detail:', error);
            throw error;
        }

        console.log('✅ Migration successful!');
    } catch (err) {
        console.error('💥 Migration failed:', err);
        process.exit(1);
    }
}

runMigration();
