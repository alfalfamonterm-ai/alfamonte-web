"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { getCustomerSubscriptions } from '@/features/account/lib/account.db';
import supabase from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function MySubscriptionsPage() {
    const router = useRouter();
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            try {
                const data = await getCustomerSubscriptions(user.email!);
                setSubscriptions(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [router]);

    return (
        <main className="min-h-screen pt-24 pb-12 bg-[#F4F1EA]">
            <Navbar />
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-[#2D4A3E] mb-2 font-merriweather">
                        Mis Suscripciones
                    </h1>
                    <p className="text-gray-600">
                        Gestiona tus planes de alimentación recurrente y asegura el stock para tus mascotas.
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-400 italic">Cargando tus planes...</div>
                ) : (
                    <>
                        <div className="grid gap-6">
                            {subscriptions.length > 0 ? (
                                subscriptions.map((sub) => (
                                    <div key={sub.id} className="bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden flex flex-col md:flex-row">
                                        <div className="p-6 flex-1">
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${sub.status === 'authorized' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {sub.status === 'authorized' ? 'Activa' : sub.status}
                                                </span>
                                                <span className="text-sm text-gray-400">#{sub.mp_preapproval_id?.slice(0, 8)}</span>
                                            </div>
                                            <h3 className="text-xl font-bold text-[#2D4A3E] mb-2">{sub.products?.title || 'Suscripción Especial'}</h3>
                                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                                <div>
                                                    <p className="font-medium text-gray-400 uppercase text-[10px] tracking-widest mb-1">Día de Cobro</p>
                                                    <p className="text-base text-[#2D4A3E]">Cada {sub.billing_day || '---'} del mes</p>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-400 uppercase text-[10px] tracking-widest mb-1">Monto Mensual</p>
                                                    <p className="text-base text-[#2D4A3E]">${sub.price?.toLocaleString('es-CL') || '---'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 p-6 flex items-center justify-center border-t md:border-t-0 md:border-l border-green-50 min-w-[200px]">
                                            <div className="flex flex-col gap-2 w-full">
                                                <Button variant="primary" fullWidth onClick={() => window.open('https://www.mercadopago.cl/subscriptions', '_blank')}>
                                                    Gestionar en MP
                                                </Button>
                                                <Link href="/account" className="w-full">
                                                    <Button variant="outline" fullWidth>
                                                        Ver Pedidos
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                                    <div className="text-5xl mb-4">🌾</div>
                                    <h2 className="text-xl font-bold text-[#2D4A3E] mb-2">No tienes suscripciones activas</h2>
                                    <p className="text-gray-600 mb-8">¡Suscríbete a nuestros planes mensuales y ahorra un 18%!</p>
                                    <Link href="/shop">
                                        <Button>Ver Planes Disponibles</Button>
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div className="mt-12 bg-white rounded-2xl p-8 shadow-sm border border-green-100">
                            <h2 className="text-2xl font-bold text-[#2D4A3E] mb-4 font-merriweather">¿Cómo funcionan las suscripciones?</h2>
                            <div className="grid md:grid-cols-3 gap-8 text-sm">
                                <div className="space-y-2">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl mb-4">💳</div>
                                    <h4 className="font-bold text-[#2D4A3E]">Cobro Automático</h4>
                                    <p className="text-gray-600 leading-relaxed">Cargamos tu tarjeta cada 30 días de forma segura a través de Mercado Pago.</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl mb-4">🚚</div>
                                    <h4 className="font-bold text-[#2D4A3E]">Envío Prioritario</h4>
                                    <p className="text-gray-600 leading-relaxed">Los suscriptores tienen prioridad en el despacho y envío incluido siempre.</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl mb-4">⚙️</div>
                                    <h4 className="font-bold text-[#2D4A3E]">Flexibilidad Total</h4>
                                    <p className="text-gray-600 leading-relaxed">Puedes pausar o cancelar tu suscripción en cualquier momento desde tu panel de Mercado Pago.</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
