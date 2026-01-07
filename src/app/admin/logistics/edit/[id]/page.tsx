"use client";

import React, { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';
import { updateOrderStatus } from '@/features/logistics/lib/logistics.db';
import { LogisticsStatus, LOGISTICS_STATUS_LABELS } from '@/features/logistics/types';
import { useRouter } from 'next/navigation';
import { sendShippingUpdateEmail, sendReviewRequestEmail } from '@/lib/resend';

export default function EditLogisticsPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        logistics_status: 'processing' as LogisticsStatus,
        tracking_number: '',
        shipping_provider: '',
        estimated_delivery_date: '',
        logistics_notes: ''
    });

    useEffect(() => {
        const fetchOrder = async () => {
            const { data } = await supabase.from('orders').select('*').eq('id', params.id).single();
            if (data) {
                setOrder(data);
                setForm({
                    logistics_status: data.logistics_status || 'processing',
                    tracking_number: data.tracking_number || '',
                    shipping_provider: data.shipping_provider || '',
                    estimated_delivery_date: data.estimated_delivery_date ? data.estimated_delivery_date.split('T')[0] : '',
                    logistics_notes: data.logistics_notes || ''
                });
            }
            setLoading(false);
        };
        fetchOrder();
    }, [params.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateOrderStatus(params.id, form);

            // Send shipping update email if status changed or tracking added
            if (order.guest_info?.email) {
                const statusLabel = LOGISTICS_STATUS_LABELS[form.logistics_status].label;
                await sendShippingUpdateEmail(
                    order.guest_info.email,
                    params.id,
                    statusLabel,
                    form.shipping_provider,
                    form.tracking_number
                );
            }

            alert('Datos guardados y notificación enviada.');
            router.push('/admin/logistics');
        } catch (error) {
            alert('Error al guardar.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-12 text-center text-gray-400">Cargando datos...</div>;

    return (
        <div className="max-w-2xl mx-auto pb-12">
            <header className="mb-8">
                <button onClick={() => router.back()} className="text-sm font-bold text-[#2D4A3E] mb-2 block">← Volver</button>
                <h1 className="text-3xl font-bold text-[#2D4A3E] font-merriweather">Editar Envío #{order.id.slice(0, 8).toUpperCase()}</h1>
                <p className="text-gray-500 font-medium">Actualiza la información de despacho para el cliente.</p>
            </header>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl space-y-6">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Estado Logístico</label>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.entries(LOGISTICS_STATUS_LABELS).map(([key, value]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setForm({ ...form, logistics_status: key as any })}
                                className={`p-3 rounded-xl border text-sm font-bold flex items-center gap-2 transition-all ${form.logistics_status === key ? 'border-[#2D4A3E] bg-[#2D4A3E]/5 text-[#2D4A3E]' : 'border-gray-100 text-gray-400 grayscale'
                                    }`}
                            >
                                <span>{value.icon}</span> {value.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Proveedor de Transporte</label>
                        <input
                            type="text"
                            value={form.shipping_provider}
                            onChange={(e) => setForm({ ...form, shipping_provider: e.target.value })}
                            placeholder="Ej: Starken, ChilePost"
                            className="w-full p-3 bg-gray-50 border-0 rounded-xl font-medium focus:ring-2 focus:ring-[#2D4A3E]/20 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Número de Seguimiento</label>
                        <input
                            type="text"
                            value={form.tracking_number}
                            onChange={(e) => setForm({ ...form, tracking_number: e.target.value })}
                            placeholder="Ej: SX9283741"
                            className="w-full p-3 bg-gray-50 border-0 rounded-xl font-mono font-bold focus:ring-2 focus:ring-[#2D4A3E]/20 outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Fecha Estimada de Entrega</label>
                    <input
                        type="date"
                        value={form.estimated_delivery_date}
                        onChange={(e) => setForm({ ...form, estimated_delivery_date: e.target.value })}
                        className="w-full p-3 bg-gray-50 border-0 rounded-xl font-medium focus:ring-2 focus:ring-[#2D4A3E]/20 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Notas Internas / Logística</label>
                    <textarea
                        value={form.logistics_notes}
                        onChange={(e) => setForm({ ...form, logistics_notes: e.target.value })}
                        rows={3}
                        className="w-full p-3 bg-gray-50 border-0 rounded-xl font-medium focus:ring-2 focus:ring-[#2D4A3E]/20 outline-none"
                        placeholder="Usa esto para detalles de entrega especiales..."
                    ></textarea>
                </div>

                <div className="flex justify-between items-center gap-4">
                    <button
                        type="button"
                        onClick={async () => {
                            if (order.guest_info?.email) {
                                await sendReviewRequestEmail(order.guest_info.email, params.id);
                                alert('Solicitud de reseña enviada.');
                            }
                        }}
                        className="bg-yellow-50 text-yellow-800 px-6 py-3 rounded-2xl font-bold border border-yellow-100 hover:bg-yellow-100 transition-all"
                    >
                        💌 Solicitar Reseña
                    </button>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => router.push('/admin/logistics')}
                            className="px-6 py-3 border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all text-[#2D4A3E]"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-[#2D4A3E] text-white px-8 py-3 rounded-2xl font-bold hover:bg-[#3E6052] transition-all disabled:opacity-50"
                        >
                            {saving ? 'Guardando...' : 'Guardar y Notificar'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
