"use client";

import { useCart, calculatePrice } from '@/contexts/CartContext';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface BuyButtonsProps {
    product: any;
}

// Fallback mapping in case DB isn't synced yet (Importado de 4af7fc6)
const PLAN_MAPPING: Record<string, string> = {
    "efc17835-c06c-4b87-8aeb-8a2e1f53dc6e": "519be37caa104dd097de1723f9719b94",
    "1a234bd9-c01f-4c1e-a926-b86c5b67b0cb": "18899ffcb40d43d1b78ee363451e2467",
    "4e29d6d3-0d28-417c-914d-ea66395a7711": "32b6546308d84e97bfaeb9982a6bcc8b",
    "49442fe6-a146-47b1-8b94-50258b9add27": "a59b3550c09442438af7360c58962f5f",
    "b800946d-cdda-47d5-95a2-b1f242021aa3": "328fc8c0c0f344119941c0b295f84d08",
    "6a8ea573-069e-416f-906f-40682453cc43": "3bd69acbb720456a9c19f8bfee51d2ab",
    "727393e5-ea23-4bb1-9b96-7e19d398cfd6": "33b5a0bf28eb4346ad897d8f1b9c27d2",
    "44441850-fb85-41cf-a58b-3768ff0c8959": "4207eea18b5d4b68a9e476bbc139c97c",
    "b005ce47-09b9-4315-b1b6-f8ac450296c1": "3be59ab7cfdc472c9770456cb532d26f",
    "0c5d1620-68f5-4dc0-a891-f6da3b6d55f0": "9e1fc601f33b4455b01e911cb7834d31"
};

export default function BuyButtons({ product }: BuyButtonsProps) {
    const { addToCart } = useCart();
    const router = useRouter();
    const [showSuccess, setShowSuccess] = useState(false);
    const [loadingSub, setLoadingSub] = useState(false); // Añadido de 4af7fc6

    const subscriptionPrice = product.price;
    const oneTimePrice = calculatePrice(product.price, false);

    const handleAddToCart = (isSubscription: boolean) => {
        addToCart(product, 1, isSubscription);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    const handleSubscribe = async () => { // Cambiado a async de 4af7fc6
        // Comentarios de 4af7fc6:
        // Real subscriptions don't go to the cart usually, they are a direct commitment.
        // But for this MVP, let's keep it simple: redirect to checkout if we need data, 
        // OR if we already have it (from session), start the MP flow.
        // Strategy: Redirect to /checkout?mode=subscription&product_id=...
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
                    disabled={loadingSub} // Añadido de 4af7fc6
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