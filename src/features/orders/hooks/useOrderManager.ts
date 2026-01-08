import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { Order } from '../types';
// Asumo que tienes una función similar para actualizar el pago en orders.db
import { getOrders, updateOrderStatus, updateOrderPaymentStatus } from '@/lib/database/orders.db'; 

// Definición de tipos para el retorno del hook (implícita, pero útil)
export interface OrderManagerReturnType {
    orders: Order[];
    loading: boolean;
    selectedOrder: Order | null;
    setSelectedOrder: Dispatch<SetStateAction<Order | null>>;
    updateStatus: (id: string, newStatus: string) => Promise<void>;
    updatePaymentStatus: (id: string, newPaymentStatus: string) => Promise<void>; // <-- ¡NUEVO!
    refresh: () => Promise<void>;
}

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
            // Optimistic update del estado de envío
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus as any } : o));
            if (selectedOrder?.id === id) {
                setSelectedOrder(prev => prev ? { ...prev, status: newStatus as any } : null);
            }
        } catch (err: any) {
            alert('Error updating status: ' + err.message);
        }
    };

    // VAMOS A AGREGAR LA FUNCIÓN FALTANTE PARA ACTUALIZAR EL ESTADO DE PAGO
    const updatePaymentStatus = async (id: string, newPaymentStatus: string) => {
        try {
            // Se asume que esta función existe en orders.db
            await updateOrderPaymentStatus(id, newPaymentStatus); 
            
            // Optimistic update del estado de pago
            setOrders(prev => prev.map(o => o.id === id ? { ...o, payment_status: newPaymentStatus as any } : o));
            if (selectedOrder?.id === id) {
                setSelectedOrder(prev => prev ? { ...prev, payment_status: newPaymentStatus as any } : null);
            }
        } catch (err: any) {
            alert('Error updating payment status: ' + err.message);
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
        updatePaymentStatus, // <-- ¡LO AGREGAMOS AL RETORNO!
        refresh: fetchOrders
    } as OrderManagerReturnType; // Aplicamos el tipo de retorno explícito para ayudar a TS.
};