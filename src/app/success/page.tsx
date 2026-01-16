"use client";

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import confetti from 'canvas-confetti';

function SuccessContent() {
    const { clearCart } = useCart();
    const searchParams = useSearchParams();
    const paymentId = searchParams.get('payment_id');
    const externalReference = searchParams.get('external_reference');

    useEffect(() => {
        // 1. Clear cart and storage
        clearCart();
        localStorage.removeItem('checkout-data');
        localStorage.removeItem('alfa-monte-cart');

        // 2. Clean URL (Remove query params for cleaner UI)
        if (window.history.replaceState) {
            const url = new URL(window.location.href);
            url.search = ''; // Remove query params
            window.history.replaceState({}, '', url.toString());
        }

        // 3. Fire Confetti (Non-blocking)
        const duration = 3000;
        const animationEnd = Date.now() + duration;

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            // Start from both sides
            confetti({
                particleCount,
                startVelocity: 30,
                spread: 360,
                ticks: 60,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                colors: ['#2D4A3E', '#8B5E3C', '#E8F5E9'],
                disableForReducedMotion: true,
                zIndex: 10 // Ensure it's not too high covering buttons
            });
            confetti({
                particleCount,
                startVelocity: 30,
                spread: 360,
                ticks: 60,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                colors: ['#2D4A3E', '#8B5E3C', '#E8F5E9'],
                disableForReducedMotion: true,
                zIndex: 10
            });
        }, 250);

        return () => clearInterval(interval);
    }, [clearCart]);

    return (
        <div className="max-w-2xl mx-auto text-center py-12">
            <div className="text-8xl mb-8">🌿</div>
            <h1 className="text-4xl font-bold text-[#2D4A3E] mb-4 font-merriweather">
                ¡Gracias por tu compra!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
                Tu pedido ha sido recibido y está siendo procesado.
            </p>

            <div className="bg-white rounded-xl p-8 shadow-sm mb-8 text-left border border-green-100">
                <h2 className="font-bold text-[#2D4A3E] mb-4 text-lg">Resumen de la Transacción</h2>
                <div className="space-y-2 text-sm text-gray-600">
                    <p><span className="font-medium text-gray-800">ID de Pago:</span> {paymentId}</p>
                    <p><span className="font-medium text-gray-800">N° de Orden:</span> {externalReference}</p>

                    <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-100 flex items-center justify-between">
                        <div>
                            <p className="font-bold text-[#2D4A3E]">¡Listo para el envío!</p>
                            <p className="text-xs">Sigue tu pedido en tiempo real.</p>
                        </div>
                        <Link href={`/track/${externalReference}`}>
                            <Button>Hacer Seguimiento</Button>
                        </Link>
                    </div>

                    <p className="mt-4 pt-4 border-t italic">
                        Hemos enviado un correo electrónico con los detalles de tu pedido.
                    </p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/shop">
                    <Button>Seguir Comprando</Button>
                </Link>
                <Link href="/blog">
                    <Button variant="outline">Ver Consejos de Cuidado</Button>
                </Link>
            </div>

            <p className="mt-12 text-gray-500 text-sm">
                ¿Tienes dudas? Contáctanos a <a href="mailto:hola@alfamonte.cl" className="underline">hola@alfamonte.cl</a>
            </p>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <main className="min-h-screen pt-24 pb-12 bg-[#F4F1EA]">
            <Navbar />
            <div className="container mx-auto px-4">
                <Suspense fallback={<div>Cargando...</div>}>
                    <SuccessContent />
                </Suspense>
            </div>
        </main>
    );
}
