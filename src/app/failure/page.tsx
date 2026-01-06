"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

function FailureContent() {
    const searchParams = useSearchParams();
    const status = searchParams.get('status');

    return (
        <div className="max-w-2xl mx-auto text-center py-12">
            <div className="text-8xl mb-8">❌</div>
            <h1 className="text-4xl font-bold text-red-700 mb-4 font-merriweather">
                Pago no procesado
            </h1>
            <p className="text-xl text-gray-600 mb-8">
                Lo sentimos, hubo un problema al procesar tu pago.
            </p>

            <div className="bg-white rounded-xl p-8 shadow-sm mb-8 text-left border border-red-100">
                <h2 className="font-bold text-red-700 mb-4 text-lg">¿Qué pudo haber pasado?</h2>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                    <li>Fondos insuficientes en tu tarjeta.</li>
                    <li>La transacción fue rechazada por tu banco.</li>
                    <li>Hubo un problema de conexión con Mercado Pago.</li>
                </ul>
                <p className="mt-6 text-sm italic text-gray-500">
                    Estado: {status || 'rejected'}
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/checkout">
                    <Button>Intentar Nuevamente</Button>
                </Link>
                <Link href="/cart">
                    <Button variant="outline">Volver al Carrito</Button>
                </Link>
            </div>

            <p className="mt-12 text-gray-500 text-sm">
                Si el problema persiste, por favor contáctanos por WhatsApp.
            </p>
        </div>
    );
}

export default function FailurePage() {
    return (
        <main className="min-h-screen pt-24 pb-12 bg-[#F4F1EA]">
            <Navbar />
            <div className="container mx-auto px-4">
                <Suspense fallback={<div>Cargando...</div>}>
                    <FailureContent />
                </Suspense>
            </div>
        </main>
    );
}
