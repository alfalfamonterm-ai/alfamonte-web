"use client";

import { useCart, calculatePrice } from '@/contexts/CartContext';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface BuyButtonsProps {
    product: any;
}

export default function BuyButtons({ product }: BuyButtonsProps) {
    const { addToCart } = useCart();
    const router = useRouter();
    const [showSuccess, setShowSuccess] = useState(false);

    const subscriptionPrice = product.price;
    const oneTimePrice = calculatePrice(product.price, false);

    const handleAddToCart = (isSubscription: boolean) => {
        addToCart(product, 1, isSubscription);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    const handleSubscribe = () => {
        router.push(`/checkout?mode=subscription&product_id=${product.id}`);
    };

    return (
        <div className="space-y-4 relative">
            {showSuccess && (
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold z-10 shadow-lg animate-bounce">
                    ✓ Agregado al carrito
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                    fullWidth
                    variant="primary"
                    onClick={() => handleAddToCart(false)}
                    className="py-4 text-lg"
                >
                    <div className="flex flex-col items-center">
                        <span>Agregar al Carrito</span>
                        <span className="text-xs opacity-80">${oneTimePrice.toLocaleString('es-CL')} (una vez)</span>
                    </div>
                </Button>
                <Button
                    fullWidth
                    variant="outline"
                    onClick={handleSubscribe}
                    className="py-4 text-lg border-2 border-[#2D4A3E]"
                >
                    <div className="flex flex-col items-center">
                        <span>Suscribirme Mensual</span>
                        <span className="text-xs opacity-80">${subscriptionPrice.toLocaleString('es-CL')} (-18%)</span>
                    </div>
                </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
                * Las suscripciones incluyen cobro automático mensual y envío priorizado.
            </p>
        </div>
    );
}
