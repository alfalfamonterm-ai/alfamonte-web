"use client";

import React, { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';
import { LOGISTICS_STATUS_LABELS, LogisticsStatus } from '@/features/logistics/types';
import Link from 'next/link';

export default function OrderTrackingPage({ params }: { params: { id: string } }) {
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Reviews State
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewSuccess, setReviewSuccess] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            // Try by ID first (UUID)
            let { data, error } = await supabase
                .from('orders')
                .select('*, order_items(*)')
                .eq('id', params.id)
                .maybeSingle();

            // If not found, try by external_reference
            if (!data) {
                const { data: extData, error: extError } = await supabase
                    .from('orders')
                    .select('*, order_items(*)')
                    .eq('external_reference', params.id)
                    .maybeSingle();

                if (extData) data = extData;
            }

            if (!data) {
                setError(true);
            } else {
                setOrder(data);
                // Check if already reviewed (optional optimization)
            }
            setLoading(false);
        };

        fetchOrder();
    }, [params.id]);

    const handleSubmitReview = async () => {
        if (rating === 0) return;
        setReviewSubmitting(true);

        try {
            await supabase.from('reviews').insert({
                order_id: order.id,
                rating,
                comment: reviewText,
                customer_email: order.guest_info?.email,
                customer_name: `${order.guest_info?.firstName} ${order.guest_info?.lastName}`
            });
            setReviewSuccess(true);
        } catch (err) {
            console.error('Error submitting review:', err);
            alert('Hubo un error al enviar tu reseña. Inténtalo de nuevo.');
        } finally {
            setReviewSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400 italic">Buscando tu pedido...</div>;
    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Pedido no encontrado 📦</h1>
            <p className="text-gray-500 mb-6">Verifica el número de orden en tu correo o comprobante.</p>
            <Link href="/" className="bg-[#2D4A3E] text-white px-6 py-3 rounded-xl font-bold">Volver a la Tienda</Link>
        </div>
    );

    const statusInfo = LOGISTICS_STATUS_LABELS[order.logistics_status as LogisticsStatus] || LOGISTICS_STATUS_LABELS.processing;

    const timeline = [
        { key: 'processing', label: 'Recibido', icon: '📝' },
        { key: 'warehouse', label: 'En Preparación', icon: '📦' },
        { key: 'dispatched', label: 'Despachado', icon: '🚚' },
        { key: 'delivered', label: 'Entregado', icon: '🏠' },
    ];

    const currentStepIndex = timeline.findIndex(t => t.key === order.logistics_status);
    const effectiveStepIndex = order.logistics_status === 'in_transit' ? 2 : currentStepIndex;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="bg-[#2D4A3E] p-8 text-white text-center">
                    <h1 className="text-3xl font-bold mb-2 font-merriweather">Seguimiento de Pedido</h1>
                    <p className="opacity-80 font-medium">Orden #{order.id.slice(0, 8).toUpperCase()}</p>
                </div>

                <div className="p-8">
                    {/* Status Card */}
                    <div className={`p-6 rounded-2xl mb-8 flex items-center gap-4 ${statusInfo.color}`}>
                        <span className="text-4xl">{statusInfo.icon}</span>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider opacity-70">Estado Actual</p>
                            <h2 className="text-2xl font-bold">{statusInfo.label}</h2>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="relative mb-12 px-4">
                        <div className="absolute left-1/2 left-4 md:left-1/2 top-0 bottom-0 w-1 bg-gray-100 -translate-x-1/2 hidden md:block"></div>
                        <div className="space-y-8 relative">
                            {timeline.map((step, idx) => {
                                const isPast = idx <= effectiveStepIndex;
                                const isCurrent = idx === effectiveStepIndex;

                                return (
                                    <div key={step.key} className="flex flex-col md:flex-row items-center gap-4 relative">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl z-10 transition-all ${isPast ? 'bg-[#2D4A3E] text-white' : 'bg-gray-100 text-gray-400'
                                            }`}>
                                            {isCurrent ? step.icon : isPast ? '✓' : idx + 1}
                                        </div>
                                        <div className={`md:flex-1 text-center md:text-left ${isPast ? 'text-[#2D4A3E]' : 'text-gray-400'}`}>
                                            <p className="font-bold text-lg">{step.label}</p>
                                            {isCurrent && <p className="text-sm opacity-80 font-medium">Estamos trabajando en esto</p>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Order Details */}
                    <div className="border-t pt-8 space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-bold uppercase">Dirección de Envío</span>
                            <span className="text-gray-800 font-medium text-right max-w-[200px]">{order.shipping_address || 'Retiro en Fundo'}</span>
                        </div>
                        {order.tracking_number && (
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-bold uppercase">Número de Seguimiento</span>
                                <span className="text-blue-600 font-mono font-bold">{order.tracking_number}</span>
                            </div>
                        )}
                        {order.shipping_provider && (
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-bold uppercase">Transporte</span>
                                <span className="text-gray-800 font-bold">{order.shipping_provider}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-8 border-t bg-gray-50/50" id="review">
                    <h3 className="text-xl font-bold mb-4 font-merriweather text-[#2D4A3E]">¿Cómo fue tu experiencia?</h3>
                    <p className="text-sm text-gray-500 mb-6 font-medium">Tu opinión nos ayuda a seguir llevando lo mejor del campo a más hogares.</p>

                    {reviewSuccess ? (
                        <div className="bg-green-50 p-6 rounded-2xl border border-green-100 text-center animate-fade-in">
                            <div className="text-4xl mb-2">🎉</div>
                            <h4 className="text-lg font-bold text-[#2D4A3E] mb-1">¡Gracias por tu opinión!</h4>
                            <p className="text-sm text-gray-600">Nos ayuda mucho a mejorar.</p>
                        </div>
                    ) : (
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex gap-2 mb-4 text-2xl justify-center sm:justify-start">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className={`transition-all hover:scale-125 ${rating >= star ? 'scale-110' : 'grayscale opacity-40 hover:grayscale-0 hover:opacity-100'}`}
                                    >
                                        ⭐
                                    </button>
                                ))}
                            </div>
                            <textarea
                                className="w-full p-4 bg-gray-50 border-0 rounded-xl text-sm italic focus:ring-1 focus:ring-[#2D4A3E]/10 outline-none resize-none"
                                placeholder="Cuéntanos qué te pareció el producto o el envío..."
                                rows={3}
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                            ></textarea>
                            <button
                                onClick={handleSubmitReview}
                                disabled={rating === 0 || reviewSubmitting}
                                className="mt-4 w-full bg-[#2D4A3E] text-white py-3 rounded-xl font-bold hover:bg-[#3E6052] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {reviewSubmitting ? 'Enviando...' : 'Enviar Reseña (+25 puntos)'}
                            </button>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gray-50 text-center">
                    <p className="text-xs text-gray-400 font-medium italic">¿Tienes dudas? Contáctanos por WhatsApp (+569 ...)</p>
                </div>
            </div>
        </div>
    );
}
