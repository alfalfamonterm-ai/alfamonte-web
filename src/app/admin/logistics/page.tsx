"use client";

import React, { useEffect, useState } from 'react';
import { getOrdersLogistics, updateOrderStatus, getLogisticsStats } from '@/features/logistics/lib/logistics.db';
import { OrderLogistics, LogisticsStatus, LOGISTICS_STATUS_LABELS } from '@/features/logistics/types';
import Link from 'next/link';

export default function LogisticsDashboard() {
    const [orders, setOrders] = useState<OrderLogistics[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [filterStatus, setFilterStatus] = useState<LogisticsStatus | 'all'>('all');
    const [editingOrder, setEditingOrder] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, [filterStatus]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await getOrdersLogistics(filterStatus === 'all' ? undefined : filterStatus);
            setOrders(data);
            const s = await getLogisticsStats();
            setStats(s);
        } catch (error) {
            console.error("Error loading logistics data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId: string, newStatus: LogisticsStatus) => {
        try {
            await updateOrderStatus(orderId, { logistics_status: newStatus });
            alert('Estado actualizado correctamente.');
            fetchData();
        } catch (error) {
            alert('Error al actualizar estado.');
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-CL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="pb-12">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-[#2D4A3E] font-merriweather">Gestión de Logística</h1>
                    <p className="text-gray-600 font-medium">Control de envíos y estados de pedido</p>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                {Object.entries(LOGISTICS_STATUS_LABELS).map(([key, value]) => (
                    <button
                        key={key}
                        onClick={() => setFilterStatus(key as any)}
                        className={`p-4 rounded-xl border transition-all text-left ${filterStatus === key ? 'border-[#2D4A3E] ring-2 ring-[#2D4A3E]/10 bg-white' : 'border-gray-100 bg-white hover:border-gray-200'
                            }`}
                    >
                        <div className="text-2xl mb-1">{value.icon}</div>
                        <div className="text-xs font-bold text-gray-500 uppercase">{value.label}</div>
                        <div className="text-xl font-bold text-gray-800">{stats ? stats[key] : '...'}</div>
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filterStatus === 'all' ? 'bg-[#2D4A3E] text-white' : 'bg-white text-gray-600 border'
                                }`}
                        >
                            Todos
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-gray-400 font-medium italic">Cargando pedidos...</div>
                ) : orders.length === 0 ? (
                    <div className="p-12 text-center text-gray-400 font-medium italic">No hay pedidos en esta categoría.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Orden / Cliente</th>
                                    <th className="px-6 py-4">Fecha</th>
                                    <th className="px-6 py-4">Monto</th>
                                    <th className="px-6 py-4">Dirección</th>
                                    <th className="px-6 py-4">Estado Logística</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {orders.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 border-b border-gray-100 pb-1 mb-1">
                                                #{order.id.slice(0, 8).toUpperCase()}
                                            </div>
                                            <div className="text-gray-600 font-medium">
                                                {order.guest_info?.firstName} {order.guest_info?.lastName}
                                            </div>
                                            <div className="text-xs text-gray-400 italic font-medium">{order.guest_info?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 font-medium">
                                            {formatDate(order.created_at)}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-800">
                                            ${Number(order.total_amount).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 max-w-xs truncate text-gray-600 font-medium" title={order.shipping_address}>
                                            {order.shipping_address || 'Retiro en Local'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={order.logistics_status}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value as LogisticsStatus)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-bold border-0 cursor-pointer ${LOGISTICS_STATUS_LABELS[order.logistics_status].color
                                                    }`}
                                            >
                                                {Object.entries(LOGISTICS_STATUS_LABELS).map(([k, v]) => (
                                                    <option key={k} value={k} className="bg-white text-gray-800">
                                                        {v.icon} {v.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/admin/logistics/edit/${order.id}`}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Editar Detalle de Envío"
                                                >
                                                    📦
                                                </Link>
                                                <Link
                                                    href={`/admin/crm?email=${order.guest_info?.email}`}
                                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                    title="Ver Cliente en CRM"
                                                >
                                                    👤
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
