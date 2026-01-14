"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';

interface PaymentClientProps {
    mpPublicKey: string | undefined;
}

export default function PaymentClient({ mpPublicKey }: PaymentClientProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const preferenceId = searchParams.get('preference_id');
    const [isMPLoaded, setIsMPLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (mpPublicKey) {
            try {
                initMercadoPago(mpPublicKey, { locale: 'es-CL' });
                setIsMPLoaded(true);
                console.log('Mercado Pago Initialized');
            } catch (err) {
                console.error('Error initializing Mercado Pago:', err);
                setError('Error al inicializar la pasarela de pago.');
            }
        } else {
            console.error('Missing Mercado Pago Public Key');
            setError('Falta configuración de pago (Public Key).');
        }
    }, [mpPublicKey]);

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

    if (error) {
        return (
            <div className="max-w-md mx-auto bg-white rounded-xl p-8 shadow-sm text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <p className="text-sm text-gray-500">
                    Por favor, contacta a soporte o intenta más tarde.
                </p>
                <button
                    onClick={() => router.push('/checkout')}
                    className="mt-6 bg-[#2D4A3E] text-white px-6 py-2 rounded-lg"
                >
                    Volver
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
                <div className="flex justify-center min-h-[70px]">
                    <Wallet
                        initialization={{ preferenceId: preferenceId }}
                        customization={{
                            texts: {
                                valueProp: 'smart_option'
                            }
                        }}
                    />
                </div>
            ) : (
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-full bg-gray-200 rounded-lg mb-4"></div>
                    <p className="text-xs text-gray-400">Cargando pasarela...</p>
                </div>
            )}

            <p className="mt-8 text-sm text-gray-500">
                Aceptarás los términos y condiciones al proceder con el pago.
            </p>
        </div>
    );
}
