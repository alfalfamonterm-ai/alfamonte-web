const { MercadoPagoConfig, Payment } = require('mercadopago');

// Load env vars strictly for this script execution context if needed, 
// but since we are running via node we might need to load them or hardcode them from the known env file.
// I will read them from process.env if available, or fallback to the ones I read earlier.

const ACCESS_TOKEN = 'APP_USR-934988159626722-120919-7edcd3f9c03c3aaccf76e9d93e26eefd-751417588';

const client = new MercadoPagoConfig({ accessToken: ACCESS_TOKEN });
const payment = new Payment(client);

async function auditPayments() {
    console.log('--- AUDITORÍA FORENSE DE MERCADO PAGO ---');
    console.log('Buscando últimos 30 pagos (Aprobados, Pendientes, Rechazados)...');
    console.log('-------------------------------------------------------------');

    try {
        const searchRequest = {
            limit: 30,
            offset: 0,
            sort: 'date_created',
            criteria: 'desc'
        };

        const result = await payment.search({ options: searchRequest });

        if (!result.results || result.results.length === 0) {
            console.log('❌ No se encontraron pagos recientes en esta cuenta.');
            return;
        }

        const payments = result.results;
        let foundLost = false;

        for (const p of payments) {
            const date = new Date(p.date_created).toLocaleString('es-CL', { timeZone: 'America/Santiago' });
            const amount = p.transaction_amount;
            const status = p.status;
            const detail = p.status_detail; // accredited, pending_contingency, cc_rejected_...
            const ref = p.external_reference || 'SIN_REF';
            const email = p.payer?.email || 'N/A';
            const desc = p.description || 'Sin descripción';

            // Highlight suspicious or target payments
            const isMatch = desc.toLowerCase().includes('conejo') || ref.includes('ORDER') || amount > 1000;
            const icon = status === 'approved' ? '✅' : (status === 'rejected' ? '❌' : '⚠️');

            console.log(`${icon} [${date}] ID: ${p.id}`);
            console.log(`   Monto: $${amount} | Estado: ${status} (${detail})`);
            console.log(`   Ref: ${ref}`);
            console.log(`   Email Cliente: ${email}`);
            console.log(`   Desc: ${desc}`);

            if (p.additional_info && p.additional_info.items) {
                console.log(`   Items: ${p.additional_info.items.map(i => i.title).join(', ')}`);
            }
            console.log('-------------------------------------------------------------');
        }

    } catch (error) {
        console.error('❌ ERROR FATAL CONECTANDO A MERCADO PAGO:', error);
    }
}

auditPayments();
