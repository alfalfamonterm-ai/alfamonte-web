"use client";

import { useState } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';

// Initialize with Public Key - Supports standard and custom user env names
initMercadoPago(process.env.N_P_MP_PUBLIC_KEY || process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY || process.env.NEXT_PUBLIC_MP_FRONTEND_KEY || process.env.MP_FRONTEND_KEY!);

interface MercadoPagoButtonProps {
    product: {
        id: string;
        title: string;
        price: number;
        description: string;
        imageSrc: string;
    }
}

export default function MercadoPagoButton({ product }: MercadoPagoButtonProps) {
    const [preferenceId, setPreferenceId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleBuy = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product }),
            });
            const data = await response.json();
            if (data.id) {
                setPreferenceId(data.id);
            }
        } catch (error) {
            console.error(error);
            alert('Error al iniciar el pago');
        } finally {
            setLoading(false);
        }
    };

    if (preferenceId) {
        return (
            <Wallet 
                initialization={{ preferenceId: preferenceId }} 
                customization={{ texts: { valueProp: 'smart_option' } }} 
            />
        );
    }

    return (
        <button
            onClick={handleBuy}
            disabled={loading}
            className="w-full bg-[#009EE3] text-white font-bold py-3 rounded-lg hover:bg-[#008ED6] transition-colors disabled:opacity-50"
        >
            {loading ? 'Procesando...' : 'Pagar con Mercado Pago'}
        </button>
    );
}
