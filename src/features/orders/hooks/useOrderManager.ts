import { useState, useEffect } from 'react';
import { Order } from '../types';
import { getOrders, updateOrderStatus } from '@/lib/database/orders.db';

export const useOrderManager = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await getOrders();
            setOrders(data);
        } catch (err: any) {
            console.error("Failed to fetch orders", err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            await updateOrderStatus(id, newStatus);
            // Optimistic update
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus as any } : o));
            if (selectedOrder?.id === id) {
                setSelectedOrder(prev => prev ? { ...prev, status: newStatus as any } : null);
            }
        } catch (err: any) {
            alert('Error updating status: ' + err.message);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return {
        orders,
        loading,
        selectedOrder,
        setSelectedOrder,
        updateStatus,
        refresh: fetchOrders
    };
};
