import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function debugOperations() {
    console.log('=== DEBUGGING OPERATIONS DATA ===\n');

    // 1. Check Fardos Cosechados
    const { data: produced } = await supabase
        .from('operations')
        .select('*')
        .eq('subcategory', 'Fardos Cosechados');

    console.log('📦 FARDOS COSECHADOS:');
    console.log(`Total entries: ${produced?.length || 0}`);
    const totalProduced = produced?.reduce((sum, op) => sum + Number(op.quantity), 0) || 0;
    console.log(`Total quantity: ${totalProduced}`);
    produced?.forEach(op => {
        console.log(`  - ID ${op.id}: ${op.quantity} fardos (Paño ${op.pano_id}) on ${op.date}`);
    });

    // 2. Check Ventas
    const { data: sales } = await supabase
        .from('operations')
        .select('*')
        .eq('category', 'Venta');

    console.log('\n💰 VENTAS:');
    console.log(`Total entries: ${sales?.length || 0}`);
    const totalSold = sales?.reduce((sum, op) => sum + Number(op.quantity), 0) || 0;
    console.log(`Total quantity sold: ${totalSold}`);
    sales?.forEach(op => {
        console.log(`  - ID ${op.id}: ${op.quantity} units, subcategory: "${op.subcategory}", cost: $${op.total_cost}`);
    });

    // 3. Check Riego
    const { data: irrigation } = await supabase
        .from('operations')
        .select('*')
        .ilike('subcategory', '%Riego%');

    console.log('\n💧 RIEGO:');
    console.log(`Total entries: ${irrigation?.length || 0}`);
    irrigation?.forEach(op => {
        console.log(`  - ID ${op.id}: $${op.total_cost} (${op.quantity} días) on ${op.date} - Paño ${op.pano_id}`);
    });

    console.log('\n=== CALCULATED STOCK ===');
    console.log(`Produced: ${totalProduced}`);
    console.log(`Sold: ${totalSold}`);
    console.log(`Stock: ${totalProduced - totalSold}`);
}

debugOperations().catch(console.error);
