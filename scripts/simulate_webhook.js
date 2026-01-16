const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// Hardcoded for diagnostic reliability
const SUPABASE_URL = 'https://xufkgajjavxhnqfixqno.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1ZmtnYWpqYXZ4aG5xZml4cW5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTM5NTY4MywiZXhwIjoyMDgwOTcxNjgzfQ.YQ8xbngqDAtyXF3EMs4-EtwWA0faozfsPSPxeBhzKhA';
const WEBHOOK_URL = 'http://localhost:3000/api/webhooks/mercadopago'; // Localhost test

async function simulateWebhook() {
    console.log('--- SIMULATING WEBHOOK FOR ORDER TEST 3 ---');

    // 1. Get the target order to mock the payload
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: order } = await supabase.from('orders')
        .select('*')
        .ilike('external_reference', '%516')
        .single();

    if (!order) {
        console.error('❌ Could not find order ending in 516 to simulate.');
        return;
    }

    console.log(`Found Order: ${order.external_reference} (ID: ${order.id})`);

    // 2. Construct Mock Webhook Payload
    // Note: In real life, MP sends only { action, type, data: { id } }
    // We need a valid payment ID. User provided: 141663820213
    const payload = {
        action: 'payment.created',
        type: 'payment',
        data: {
            id: '141663820213' // Real Payment ID from User Screenshot
        }
    };

    console.log('Sending Payload:', payload);

    // 3. Send POST to local webhook (Note: This requires the local server to be running)
    // If local server is not running, we can't test "logic" deeply, but we can inspect the route code.
    // Wait, I cannot force the local server to run if user hasn't started it.
    // I am an agent, I can check if port 3000 is open?
    // Assume user might have it open or I better DRY RUN the logic script.

    console.log('⚠️ WARNING: This script assumes you have "npm run dev" running on port 3000.');

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const text = await response.text();
        console.log(`Response [${response.status}]:`, text);
    } catch (err) {
        console.error('❌ Failed to hit local webhook:', err.message);
        console.log('Recommendation: Manually trigger the logic or debug why production webhook failed.');
    }
}

simulateWebhook();
