const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function findLostOrder() {
    console.log('--- BUSCANDO ORDEN PERDIDA ---');

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('❌ Faltan credenciales de Supabase');
        return;
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // 1. Buscar por email (aproximado)
    const possibleEmails = ['alin', 'magdalena', 'bazan'];

    console.log('Buscando en últimos 10 pedidos...');
    const { data: recentOrders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error DB:', error);
        return;
    }

    console.log(`Encontradas ${recentOrders.length} órdenes recientes.`);

    recentOrders.forEach(o => {
        console.log(`[${o.created_at}] ID: ${o.id} | Ref: ${o.external_reference} | Email: ${o.guest_info?.email} | Status: ${o.status} | MP_Pref: ${o.mp_preference_id}`);
    });

    console.log('\n--- BÚSQUEDA ESPECÍFICA (Alin) ---');
    const targetOrder = recentOrders.find(o =>
        JSON.stringify(o.guest_info).toLowerCase().includes('alin') ||
        JSON.stringify(o.guest_info).toLowerCase().includes('magdalena')
    );

    if (targetOrder) {
        console.log('✅ ¡ORDEN ENCONTRADA!');
        console.log(targetOrder);
    } else {
        console.log('❌ No se encontró ninguna orden reciente con nombre "Alin" o "Magdalena".');
        console.log('Posibles causas:');
        console.log('1. El checkout falló ANTES de crear la orden en Supabase.');
        console.log('2. Se usó otro email.');
    }
}

findLostOrder();
