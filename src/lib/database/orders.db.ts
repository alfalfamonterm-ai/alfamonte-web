import supabase from '@/lib/supabase';
<<<<<<< HEAD
=======
import { CreateOrderDTO, Order } from '../../features/orders/types';
>>>>>>> 4af7fc6 (Fix: Aplicado downgrade de Next.js y React a versiones estables)

export const getOrders = async () => {
    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            items:order_items(*),
            customer:customers(name, email)
        `)
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
<<<<<<< HEAD
    return data as any[];
=======
    return data as Order[];
};

export const createOrder = async (payload: CreateOrderDTO) => {
    // Transaction-like manually
    // 1. Calculate totals
    const subtotal = payload.items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
    const total_amount = subtotal + (payload.shipping_cost || 0);

    // 2. Insert Order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            customer_id: payload.customer_id,
            guest_info: payload.guest_info,
            subtotal,
            total_amount,
            shipping_cost: payload.shipping_cost,
            shipping_method: payload.shipping_method,
            shipping_address: payload.shipping_address,
            notes: payload.notes,
            status: 'pending',
            payment_status: 'pending'
        })
        .select()
        .single();

    if (orderError) throw new Error(orderError.message);

    // 3. Insert Items
    const itemsToInsert = payload.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
        product_title: item.product_title
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);
    if (itemsError) throw new Error(itemsError.message);

    return order;
>>>>>>> 4af7fc6 (Fix: Aplicado downgrade de Next.js y React a versiones estables)
};

export const updateOrderStatus = async (id: string, status: string, payment_status?: string) => {
    const updatePayload: any = { status };
    if (payment_status) updatePayload.payment_status = payment_status;

    const { error } = await supabase
        .from('orders')
        .update(updatePayload)
        .eq('id', id);

    if (error) throw new Error(error.message);

<<<<<<< HEAD
=======
    // Trigger Stock Deduction if status is 'shipped' (Physically leaving)
>>>>>>> 4af7fc6 (Fix: Aplicado downgrade de Next.js y React a versiones estables)
    if (status === 'shipped') {
        const { error: rpcError } = await supabase.rpc('deduct_order_stock', { target_order_id: id });
        if (rpcError) console.error("Stock Deduction Error:", rpcError);
    }
};
