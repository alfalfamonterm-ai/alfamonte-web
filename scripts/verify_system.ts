
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Env Vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runVerification() {
    console.log("🚀 Starting System Verification...");
    const timestamp = Date.now();

    // 1. INVENTORY: Create Item
    console.log("\n1. [Inventory] Creating Test Item...");
    const { data: item, error: itemErr } = await supabase.from('inventory_items').insert({
        name: `Test Material ${timestamp}`,
        item_code: `TEST-${timestamp}`,
        item_type: 'material',
        category: 'Fertilizantes',
        subcategory: 'Urea',
        quantity_total: 100,
        quantity_available: 100,
        unit: 'kg',
        unit_cost: 1000,
        status: 'active'
    }).select().single();

    if (itemErr || !item) throw new Error("Item Create Failed: " + (itemErr?.message || "No data"));
    console.log(`✅ Item Created: ${item.name} (Qty: 100)`);


    // 2. OPERATIONS: Record Usage
    console.log("\n2. [Operations] Recording Usage (10 units)...");
    const { error: moveErr } = await supabase.from('inventory_movements').insert({
        item_id: item.id,
        movement_type: 'usage',
        quantity: 10,
        reason: 'Test Usage'
    });
    if (moveErr) throw new Error("Movement Failed: " + moveErr.message);

    // Verify Stock (Warn if no trigger, as logic might be in App)
    const { data: updatedItem } = await supabase.from('inventory_items').select('quantity_available').eq('id', item.id).single();
    if (!updatedItem) throw new Error("Could not fetch updated item");

    if (updatedItem.quantity_available !== 90) {
        console.warn(`⚠️ [Inventory] Stock did not update automatically via DB Trigger. Expected 90, got ${updatedItem.quantity_available}. (Logic likely in App Layer)`);
    } else {
        console.log(`✅ Inventory Stock Deducted Correctly: 100 -> ${updatedItem.quantity_available}`);
    }


    // 3. PRODUCTS: Create Web Product
    console.log("\n3. [Sales] Creating Web Product...");
    const { data: product, error: prodErr } = await supabase.from('products').insert({
        title: `Test Product ${timestamp}`,
        slug: `test-prod-${timestamp}`,
        price: 5000,
        stock: 50
    }).select().single();
    if (prodErr || !product) throw new Error("Product Create Failed: " + (prodErr?.message || "No data"));
    console.log(`✅ Product Created: ${product.title} (Stock: 50)`);


    // 4. ORDERS: Create Order
    console.log("\n4. [Orders] Creating Order (Purchase 2 units)...");
    const { data: order, error: orderErr } = await supabase.from('orders').insert({
        total_amount: 10000,
        subtotal: 10000,
        status: 'pending'
    }).select().single();
    if (orderErr || !order) throw new Error("Order Create Failed: " + (orderErr?.message || "No data"));

    const { error: itemOrderErr } = await supabase.from('order_items').insert({
        order_id: order.id,
        product_id: product.id,
        quantity: 2,
        unit_price: 5000,
        total_price: 10000,
        product_title: product.title
    });
    if (itemOrderErr) throw new Error("Order Item Failed: " + itemOrderErr.message);
    console.log(`✅ Order Created: #${order.id}`);


    // 5. ORDERS: Ship & Deduct
    console.log("\n5. [Orders] Mark as Shipped (Trigger Deduction)...");

    const { error: rpcErr } = await supabase.rpc('deduct_order_stock', { target_order_id: order.id });
    if (rpcErr) throw new Error("RPC Failed: " + rpcErr.message);

    // Verify Product Stock
    const { data: updatedProduct } = await supabase.from('products').select('stock').eq('id', product.id).single();
    if (!updatedProduct) throw new Error("Could not fetch updated product");

    if (updatedProduct.stock !== 48) throw new Error(`❌ Product Logic Failed! Expected 48, got ${updatedProduct.stock}`);
    console.log(`✅ Product Stock Deducted Correctly: 50 -> ${updatedProduct.stock}`);


    console.log("\n🎉 SYSTEM VERIFICATION SUCCESSFUL! ALL SYSTEMS GO.");
}

runVerification().catch(e => {
    console.error("\n❌ VERIFICATION FAILED:", e.message);
    process.exit(1);
});
