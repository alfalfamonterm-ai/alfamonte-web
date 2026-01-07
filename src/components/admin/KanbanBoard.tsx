"use client";

import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';

type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered';

interface Order {
    id: string;
    customer_name: string;
    total: number;
    status: OrderStatus;
    created_at: string;
    items: any;
}

const columns: { id: OrderStatus; title: string; color: string }[] = [
    { id: 'new', title: 'Nuevos Pedidos', color: 'bg-blue-100 border-blue-200' },
    { id: 'processing', title: 'En Preparación', color: 'bg-yellow-100 border-yellow-200' },
    { id: 'shipped', title: 'En Camino', color: 'bg-purple-100 border-purple-200' },
    { id: 'delivered', title: 'Entregados', color: 'bg-green-100 border-green-200' },
];

export default function KanbanBoard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching orders:', error);
        else setOrders(data as Order[] || []);
        setLoading(false);
    };

    const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
        // Optimistic update
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);

        if (error) {
            console.error('Error updating status:', error);
            fetchOrders(); // Revert on error
        }
    };

    if (loading) return <div className="text-center py-8">Cargando tablero...</div>;

    return (
        <div className="flex gap-6 overflow-x-auto pb-8">
            {columns.map((col) => (
                <div key={col.id} className={`flex-shrink-0 w-80 rounded-xl border-2 p-4 ${col.color}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-700">{col.title}</h3>
                        <span className="bg-white px-2 py-1 rounded-full text-xs font-bold text-gray-500 shadow-sm">
                            {orders.filter(o => o.status === col.id).length}
                        </span>
                    </div>

                    <div className="space-y-3">
                        {orders.filter(o => o.status === col.id).map((order) => (
                            <div key={order.id} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing border border-gray-100">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-mono text-gray-400">#{order.id.slice(0, 8)}</span>
                                    <span className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</span>
                                </div>
                                <h4 className="font-bold text-[#2D4A3E] mb-1">{order.customer_name}</h4>
                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                                    <span className="text-sm text-gray-600">Total</span>
                                    <span className="font-bold text-[#2D4A3E]">${order.total.toLocaleString('es-CL')}</span>
                                </div>

                                {/* Movement Controls (Simple for now) */}
                                <div className="flex justify-end gap-2 mt-2">
                                    {col.id !== 'delivered' && (
                                        <button
                                            onClick={() => updateStatus(order.id, getNextStatus(col.id))}
                                            className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-600"
                                        >
                                            Avance →
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {orders.filter(o => o.status === col.id).length === 0 && (
                            <div className="text-center py-8 text-gray-400 text-sm italic">
                                Sin pedidos
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

function getNextStatus(current: OrderStatus): OrderStatus {
    if (current === 'new') return 'processing';
    if (current === 'processing') return 'shipped';
    return 'delivered';
}
