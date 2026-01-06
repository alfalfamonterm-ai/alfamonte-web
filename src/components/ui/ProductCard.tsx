"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from './Button';
import { useCart, calculatePrice } from '@/contexts/CartContext';
import { useState } from 'react';

interface ProductCardProps {
    id: string;
    title: string;
    price: number;
    weight: string;
    imageSrc: string;
    slug: string;
    description: string;
    category: string;
    stock: number;
}

export function ProductCard({ id, title, price, weight, imageSrc, slug, description, category, stock }: ProductCardProps) {
    const { addToCart } = useCart();
    const [showSuccess, setShowSuccess] = useState(false);

    const subscriptionPrice = price;
    const oneTimePrice = calculatePrice(price, false);

    const handleAddToCart = (isSubscription: boolean) => {
        addToCart(
            { id, slug, title, price, weight, description, image_src: imageSrc, category, stock },
            1,
            isSubscription
        );

        // Show success message
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    return (
        <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-[#F4F1EA] relative">
            {showSuccess && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold z-10 shadow-lg animate-bounce">
                    ✓ Agregado al carrito
                </div>
            )}

            <Link href={`/product/${slug}`}>
                <div className="relative h-64 w-full bg-[#f0f0f0] cursor-pointer group">
                    {imageSrc ? (
                        <Image
                            src={imageSrc}
                            alt={title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                            [Imagen de Alfalfa]
                        </div>
                    )}
                </div>
            </Link>

            <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold font-merriweather text-[#2D4A3E]">{title}</h3>
                    <span className="bg-[#E8F5E9] text-[#2D4A3E] text-xs font-bold px-2 py-1 rounded-full">
                        {weight}
                    </span>
                </div>

                <div className="mb-4">
                    <div className="flex items-baseline gap-2 mb-1">
                        <p className="text-2xl font-bold text-[#8B5E3C]">
                            ${subscriptionPrice.toLocaleString('es-CL')}
                        </p>
                        <span className="text-xs text-gray-500">suscripción</span>
                    </div>
                    <p className="text-sm text-gray-500">
                        ${oneTimePrice.toLocaleString('es-CL')} compra única
                    </p>
                    <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded inline-block mt-1">
                        🚚 Envío Incluido
                    </span>
                </div>

                <div className="space-y-2">
                    <Button
                        fullWidth
                        variant="primary"
                        onClick={() => handleAddToCart(false)}
                    >
                        Agregar al Carrito
                    </Button>
                    <Button
                        fullWidth
                        variant="outline"
                        onClick={() => handleAddToCart(true)}
                    >
                        Suscribirse (-18%)
                    </Button>
                </div>
            </div>
        </div>
    );
}
