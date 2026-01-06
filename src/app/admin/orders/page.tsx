"use client";

import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchOrders() {
            setLoading(true);
            const { data, error } = await supabase
                .from('orders')
                .select('*, order_items(*)')
                .order('created_at', { ascending: false });

            if (data) setOrders(data);
            setLoading(false);
        }
        fetchOrders();
    }, []);

    const updateStatus = async (orderId: string, status: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: status })
            .eq('id', orderId);
        
        if (!error) {
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: status } : o));
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <h1 className="text-3xl font-bold text-[#2D4A3E] mb-8">Gestión de Pedidos</h1>
            
            {loading ? (
                <div className="text-center py-12">Cargando pedidos...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b text-sm font-bold text-gray-600">
                                <th className="px-6 py-4">ID / Fecha</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Pago</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-sm">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold">#{order.id.slice(0, 8)}</div>
                                        <div className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {order.guest_info?.email || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 font-bold">
                                        ${order.total_amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                            order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {order.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select 
                                            value={order.status}
                                            onChange={(e) => updateStatus(order.id, e.target.value)}
                                            className="bg-transparent border rounded px-2 py-1"
                                        >
                                            <option value="pending">Pendiente</option>
                                            <option value="processing">Procesando</option>
                                            <option value="shipped">Enviado</option>
                                            <option value="delivered">Entregado</option>
                                            <option value="cancelled">Cancelado</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-blue-600 hover:underline">Ver Detalle</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
