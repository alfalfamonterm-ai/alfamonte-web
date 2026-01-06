"use client";

import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';
import Link from 'next/link';

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'acknowledged'>('pending');

    useEffect(() => {
        fetchAlerts();
    }, [filter]);

    const fetchAlerts = async () => {
        let query = supabase
            .from('pending_alerts')
            .select('*, operations(*), inventory_items(*)')
            .order('due_date', { ascending: true });

        if (filter !== 'all') {
            query = query.eq('status', filter);
        }

        const { data, error } = await query;
        if (data) setAlerts(data);
        setLoading(false);
    };

    const acknowledgeAlert = async (id: string) => {
        const { error } = await supabase
            .from('pending_alerts')
            .update({
                status: 'acknowledged',
                acknowledged_at: new Date().toISOString(),
                acknowledged_by: 'Admin'
            })
            .eq('id', id);

        if (!error) fetchAlerts();
    };

    const dismissAlert = async (id: string) => {
        const { error } = await supabase
            .from('pending_alerts')
            .update({ status: 'dismissed' })
            .eq('id', id);

        if (!error) fetchAlerts();
    };

    if (loading) return <div className="p-12 text-center">Cargando alertas...</div>;

    const pendingCount = alerts.filter(a => a.status === 'pending').length;
    const urgentCount = alerts.filter(a => a.priority === 'urgent' && a.status === 'pending').length;

    return (
        <div className="pb-12">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#2D4A3E] font-merriweather">Centro de Alertas</h1>
                    <p className="text-gray-600">Notificaciones de Riego, Cosecha y Mantención</p>
                </div>
                <Link
                    href="/admin/settings"
                    className="text-gray-600 hover:text-[#2D4A3E] font-bold"
                >
                    ⚙️ Configurar Alertas
                </Link>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-orange-500 text-white p-6 rounded-xl shadow-lg">
                    <p className="text-sm opacity-90 uppercase font-bold mb-1">Alertas Pendientes</p>
                    <p className="text-4xl font-bold">{pendingCount}</p>
                </div>
                <div className="bg-red-500 text-white p-6 rounded-xl shadow-lg">
                    <p className="text-sm opacity-90 uppercase font-bold mb-1">Urgentes</p>
                    <p className="text-4xl font-bold">{urgentCount}</p>
                </div>
                <div className="bg-green-500 text-white p-6 rounded-xl shadow-lg">
                    <p className="text-sm opacity-90 uppercase font-bold mb-1">Completadas Hoy</p>
                    <p className="text-4xl font-bold">
                        {alerts.filter(a =>
                            a.status === 'acknowledged' &&
                            new Date(a.acknowledged_at).toDateString() === new Date().toDateString()
                        ).length}
                    </p>
                </div>
            </div>

            {/* FILTERS */}
            <div className="flex gap-2 mb-6">
                {['pending', 'acknowledged', 'all'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`px-4 py-2 rounded-lg font-bold transition-colors ${filter === f
                                ? 'bg-[#2D4A3E] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {f === 'pending' ? '⏳ Pendientes' :
                            f === 'acknowledged' ? '✓ Reconocidas' :
                                '📋 Todas'}
                    </button>
                ))}
            </div>

            {/* ALERTS LIST */}
            <div className="space-y-4">
                {alerts.map(alert => {
                    const isOverdue = new Date(alert.due_date) < new Date();
                    const daysUntil = Math.ceil((new Date(alert.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

                    return (
                        <div
                            key={alert.id}
                            className={`bg-white rounded-xl shadow-lg border-l-4 p-6 ${alert.priority === 'urgent' ? 'border-red-500' :
                                    alert.priority === 'high' ? 'border-orange-500' :
                                        'border-blue-500'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-gray-900">{alert.title}</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${alert.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                                alert.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-blue-100 text-blue-700'
                                            }`}>
                                            {alert.priority === 'urgent' ? '🚨 Urgente' :
                                                alert.priority === 'high' ? '⚠️ Alta' :
                                                    'ℹ️ Normal'}
                                        </span>
                                    </div>

                                    <p className="text-gray-700 mb-3">{alert.message}</p>

                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span>📅 Fecha: {new Date(alert.due_date).toLocaleDateString('es-CL')}</span>
                                        <span className={isOverdue ? 'text-red-600 font-bold' : ''}>
                                            {isOverdue ? '⏰ Vencida' : `⏳ En ${daysUntil} días`}
                                        </span>
                                        <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">
                                            {alert.alert_type}
                                        </span>
                                    </div>
                                </div>

                                {alert.status === 'pending' && (
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => acknowledgeAlert(alert.id)}
                                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold text-sm"
                                        >
                                            ✓ Reconocer
                                        </button>
                                        <button
                                            onClick={() => dismissAlert(alert.id)}
                                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold text-sm"
                                        >
                                            ✕ Descartar
                                        </button>
                                    </div>
                                )}

                                {alert.status === 'acknowledged' && (
                                    <div className="ml-4 text-sm text-green-600 font-bold">
                                        ✓ Reconocida
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {alerts.length === 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center text-gray-400">
                        <p className="text-2xl mb-2">🎉</p>
                        <p className="font-bold">No hay alertas {filter === 'pending' ? 'pendientes' : filter === 'acknowledged' ? 'reconocidas' : ''}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
