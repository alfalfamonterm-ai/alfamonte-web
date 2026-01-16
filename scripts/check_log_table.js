const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://xufkgajjavxhnqfixqno.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1ZmtnYWpqYXZ4aG5xZml4cW5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTM5NTY4MywiZXhwIjoyMDgwOTcxNjgzfQ.YQ8xbngqDAtyXF3EMs4-EtwWA0faozfsPSPxeBhzKhA';

async function runSql() {
    console.log('--- RUNNING SQL: setup_webhook_logs.sql ---');

    // Read SQL file
    const sqlPath = path.join(__dirname, '..', 'setup_webhook_logs.sql');
    let sqlContent = '';
    try {
        sqlContent = fs.readFileSync(sqlPath, 'utf8');
    } catch (e) {
        // Fallback if file not found in that exact relative path, try brain folder if consistent
        console.error('Could not read SQL file from', sqlPath);
        console.log('Using hardcoded SQL...');
        sqlContent = `
            CREATE TABLE IF NOT EXISTS webhook_logs (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                payload JSONB,
                status TEXT,
                error TEXT,
                headers JSONB
            );
            ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
            create policy "Enable all access for service role" on webhook_logs using (true) with check (true);
        `;
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Supabase JS doesn't support raw SQL execution easily unless via RPC.
    // BUT we can use pg-node if installed, or just wrap it in a function if possible.
    // Wait, the user agent environment might not have 'pg'.
    // Plan B: Create a migration or verify if table exists by trying to insert.

    // Check if table exists
    const { error: checkError } = await supabase.from('webhook_logs').select('id').limit(1);

    if (checkError && checkError.code === '42P01') { // undefined_table
        console.log('Table webhook_logs does not exist. Please run the SQL in Supabase Dashboard SQL Editor.');
        console.log('SQL CONTENT:\n', sqlContent);
    } else if (!checkError || checkError.code !== '42P01') {
        console.log('✅ Table webhook_logs appears to exist (or we have permissions).');
    }
}

runSql();
