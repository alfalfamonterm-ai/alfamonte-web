"use client";

import { Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

function PendingContent() {
    return (
        <div className="max-w-2xl mx-auto text-center py-12">
            <div className="text-8xl mb-8">⏳</div>
            <h1 className="text-4xl font-bold text-[#8B5E3C] mb-4 font-merriweather">
                Pago Pendiente
            </h1>
            <p className="text-xl text-gray-600 mb-8">
                Estamos esperando la confirmación de tu pago.
            </p>

            <div className="bg-white rounded-xl p-8 shadow-sm mb-8 text-left border border-yellow-100">
                <h2 className="font-bold text-[#8B5E3C] mb-4 text-lg">¿Qué sigue?</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Algunos métodos de pago (como transferencias o pagos en efectivo) pueden tardar un poco en procesarse.
                </p>
                <p className="text-sm text-gray-600">
                    Te enviaremos un correo electrónico una vez que el pago sea aprobado y comencemos con el envío.
                </p>
            </div>

            <Link href="/shop">
                <Button>Volver a la Tienda</Button>
            </Link>
        </div>
    );
}

export default function PendingPage() {
    return (
        <main className="min-h-screen pt-24 pb-12 bg-[#F4F1EA]">
            <Navbar />
            <div className="container mx-auto px-4">
                <Suspense fallback={<div>Cargando...</div>}>
                    <PendingContent />
                </Suspense>
            </div>
        </main>
    );
}
