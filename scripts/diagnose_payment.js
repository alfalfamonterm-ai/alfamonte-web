const { MercadoPagoConfig, Payment } = require('mercadopago');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function diagnose() {
    console.log('--- DIAGNOSTIC START ---');

    // 1. Check Mercado Pago Payment
    if (!process.env.MP_ACCESS_TOKEN) {
        console.error('❌ Missing MP_ACCESS_TOKEN');
        return;
    }

    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
    const paymentClient = new Payment(client);
    const paymentId = '141473822743';

    try {
        console.log(`Checking MP Payment: ${paymentId}...`);
        const payment = await paymentClient.get({ id: paymentId });
        console.log('✅ Payment Found in API:');
        console.log(`- Status: ${payment.status}`);
        console.log(`- Status Detail: ${payment.status_detail}`);
        console.log(`- Date Created: ${payment.date_created}`);
        console.log(`- Payer Email: ${payment.payer.email}`);
        console.log(`- External Reference: ${payment.external_reference}`);

        // Check if it looks like a self-payment
        if (payment.payer.email === 'max.b.quirovem@gmail.com' || payment.payer.email?.includes('alfa')) {
            console.log('⚠️ WARNING: Payer email looks suspicious (Self-payment?)');
        }

    } catch (error) {
        console.error('❌ Error fetching payment from MP:', error.message);
    }

    // 2. Check Supabase Order
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('❌ Missing Supabase Credentials');
        return;
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    try {
        console.log('\nChecking Supabase Order...');
        // Try searching by the payment ID in notes or external_reference logic
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .ilike('notes', `%${paymentId}%`); // Searching within notes

        if (error) throw error;

        if (orders && orders.length > 0) {
            console.log('✅ Order Found in DB (via Notes match):');
            console.log(orders);
        } else {
            // Fallback: Check pending orders created recently
            const { data: recent, error: recentError } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(3);

            console.log('⚠️ Order not found directly linked to Payment ID.');
            console.log('Recent 3 orders in DB:', recent);
        }

    } catch (error) {
        console.error('❌ Error fetching orders from Supabase:', error.message);
    }
}

diagnose();
