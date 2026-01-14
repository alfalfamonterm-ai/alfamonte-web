"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';

// Wrap with Suspense for useSearchParams
function PaymentContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const preferenceId = searchParams.get('preference_id');
    const [isMPLoaded, setIsMPLoaded] = useState(false);

    useEffect(() => {
        const publicKey = process.env.MP_FRONTEND_KEY;
        if (publicKey) {
            initMercadoPago(publicKey, { locale: 'es-CL' });
            setIsMPLoaded(true);
        }
    }, []);

    if (!preferenceId) {
        return (
            <div className="text-center py-20">
                <p className="text-red-500">Error: No se encontró la preferencia de pago.</p>
                <button
                    onClick={() => router.push('/checkout')}
                    className="mt-4 text-[#2D4A3E] underline"
                >
                    Volver al checkout
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto bg-white rounded-xl p-8 shadow-sm text-center">
            <h1 className="text-2xl font-bold text-[#2D4A3E] mb-6 font-merriweather">
                Preparando el Pago
            </h1>
            <p className="text-gray-600 mb-8">
                Haz click en el botón de abajo para pagar de forma segura con Mercado Pago.
            </p>

            {isMPLoaded ? (
                <div className="flex justify-center">
                    <Wallet
                        initialization={{ preferenceId: preferenceId }}
                    // customization={{ texts: { valueProp: 'smart_option' } }} // <-- ELIMINADO: Estaba causando el error de tipo.
                    />
                </div>
            ) : (
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-full bg-gray-200 rounded-lg mb-4"></div>
                </div>
            )}

            <p className="mt-8 text-sm text-gray-500">
                Aceptarás los términos y condiciones al proceder con el pago.
            </p>
        </div>
    );
}

export default function PaymentPage() {
    return (
        <main className="min-h-screen pt-24 pb-12 bg-[#F4F1EA]">
            <Navbar />
            <div className="container mx-auto px-4">
                <Suspense fallback={<div className="text-center py-20">Cargando...</div>}>
                    <PaymentContent />
                </Suspense>
            </div>
        </main>
    );
}