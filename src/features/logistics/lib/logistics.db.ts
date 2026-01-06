import supabase from '@/lib/supabase';
import { LogisticsStatus, OrderLogistics } from '../types';

export const getOrdersLogistics = async (status?: LogisticsStatus): Promise<OrderLogistics[]> => {
    let query = supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

    if (status) {
        query = query.eq('logistics_status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
};

export const updateOrderStatus = async (
    orderId: string,
    updates: Partial<OrderLogistics>
): Promise<void> => {
    const { error } = await supabase
        .from('orders')
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

    if (error) throw error;
};

export const getLogisticsStats = async () => {
    const { data, error } = await supabase
        .from('orders')
        .select('logistics_status');

    if (error) throw error;

    const stats = {
        total: data.length,
        processing: 0,
        warehouse: 0,
        dispatched: 0,
        in_transit: 0,
        delivered: 0,
        cancelled: 0
    };

    data.forEach(o => {
        if (o.logistics_status in stats) {
            (stats as any)[o.logistics_status]++;
        }
    });

    return stats;
};
