"use client";

import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function SubscriptionSuccessPage() {
    useEffect(() => {
        // Trigger confetti
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#2D4A3E', '#8BA888', '#F4F1EA']
        });
    }, []);

    return (
        <main className="min-h-screen pt-24 pb-12 bg-[#F4F1EA]">
            <Navbar />
            <div className="container mx-auto px-4">
                <div className="max-w-2xl mx-auto text-center py-20 bg-white rounded-2xl shadow-sm p-12 border border-green-100">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">🌿</span>
                    </div>

                    <h1 className="text-4xl font-bold text-[#2D4A3E] mb-4 font-merriweather">
                        ¡Bienvenido al Club Alfa Monte!
                    </h1>

                    <p className="text-xl text-gray-600 mb-8">
                        Tu suscripción ha sido activada con éxito. Ahora recibirás tu alimento de forma automática cada mes, con envío priorizado y el mejor precio garantizado.
                    </p>

                    <div className="bg-green-50 rounded-xl p-6 text-left mb-8 space-y-4 border border-green-100">
                        <h2 className="font-bold text-[#2D4A3E] flex items-center gap-2">
                            <span>📋</span> ¿Qué sigue ahora?
                        </h2>
                        <ul className="space-y-2 text-gray-700 text-sm">
                            <li className="flex gap-2">
                                <span className="text-green-500 font-bold">✓</span>
                                Te enviaremos un correo de confirmación con los detalles de tu plan.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-green-500 font-bold">✓</span>
                                Tu primer despacho se procesará en las próximas 24-48 horas hábiles.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-green-500 font-bold">✓</span>
                                El próximo cobro se realizará automáticamente en 30 días.
                            </li>
                        </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/shop">
                            <Button variant="outline" className="w-full sm:w-auto">Seguir Explorando</Button>
                        </Link>
                        <Link href="/">
                            <Button variant="primary" className="w-full sm:w-auto">Volver al Inicio</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
