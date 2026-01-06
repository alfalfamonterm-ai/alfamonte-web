import supabase from '@/lib/supabase';

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
    return data as any[];
};

export const updateOrderStatus = async (id: string, status: string, payment_status?: string) => {
    const updatePayload: any = { status };
    if (payment_status) updatePayload.payment_status = payment_status;

    const { error } = await supabase
        .from('orders')
        .update(updatePayload)
        .eq('id', id);

    if (error) throw new Error(error.message);

    if (status === 'shipped') {
        const { error: rpcError } = await supabase.rpc('deduct_order_stock', { target_order_id: id });
        if (rpcError) console.error("Stock Deduction Error:", rpcError);
    }
};
