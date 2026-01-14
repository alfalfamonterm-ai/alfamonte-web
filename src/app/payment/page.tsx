import { Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import PaymentClient from '@/components/checkout/PaymentClient';

export default function PaymentPage() {
    // Get keys from server-side environment
    const mpPublicKey = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY ||
        process.env.MP_FRONTEND_KEY ||
        process.env.MP_PUBLIC_KEY;

    return (
        <main className="min-h-screen pt-24 pb-12 bg-[#F4F1EA]">
            <Navbar />
            <div className="container mx-auto px-4">
                <Suspense fallback={<div className="text-center py-20">Cargando...</div>}>
                    <PaymentClient mpPublicKey={mpPublicKey} />
                </Suspense>
            </div>
        </main>
    );
}
