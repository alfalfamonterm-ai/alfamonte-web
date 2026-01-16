const { createClient } = require('@supabase/supabase-js');

// Hardcoded for diagnostic reliability in this specific session
const SUPABASE_URL = 'https://xufkgajjavxhnqfixqno.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1ZmtnYWpqYXZ4aG5xZml4cW5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTM5NTY4MywiZXhwIjoyMDgwOTcxNjgzfQ.YQ8xbngqDAtyXF3EMs4-EtwWA0faozfsPSPxeBhzKhA';

async function findLostOrder() {
    console.log('--- BUSCANDO ORDEN PERDIDA (Intento 2 - Credenciales Directas) ---');

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Buscar por email (aproximado)
    console.log('Buscando en últimos 20 pedidos...');
    const { data: recentOrders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error('Error DB:', error);
        return;
    }

    console.log(`Encontradas ${recentOrders.length} órdenes recientes.`);

    let found = false;
    recentOrders.forEach(o => {
        const guestInfo = JSON.stringify(o.guest_info || {}).toLowerCase();
        const isMatch = guestInfo.includes('alin') || guestInfo.includes('magdalena');

        console.log(`[${o.created_at}] ID: ${o.id.slice(0, 8)}... | Ref: ${o.external_reference} | Total: ${o.total_amount} | Status: ${o.status}`);

        if (isMatch) {
            console.log('\n✅ ¡ORDEN ENCONTRADA!');
            console.log('--------------------------------------------------');
            console.log('ID:', o.id);
            console.log('External Ref:', o.external_reference);
            console.log('Payment Status:', o.payment_status);
            console.log('MP Preference:', o.mp_preference_id);
            console.log('Guest Info:', o.guest_info);
            console.log('--------------------------------------------------');
            found = true;
        }
    });

    if (!found) {
        console.log('\n❌ No se encontró ninguna orden reciente con nombre "Alin" o "Magdalena".');
        console.log('Diagnóstico: La orden NO se creó en Supabase.');
        console.log('Posible causa: El cliente cerró la pestaña antes de volver, o el Webhook falló al crearla fallback.');
    }
}

findLostOrder();
