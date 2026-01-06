"use client";

import { useCart, calculatePrice } from '@/contexts/CartContext';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';

export default function CartPage() {
    const { items, removeFromCart, updateQuantity, updateSubscriptionType, getSubtotal, clearCart } = useCart();

    const shipping = 0; // Envío incluido
    const total = getSubtotal();

    if (items.length === 0) {
        return (
            <main className="min-h-screen pt-24 pb-12 bg-[#F4F1EA]">
                <Navbar />
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto text-center py-20">
                        <div className="text-6xl mb-6">🛒</div>
                        <h1 className="text-3xl font-bold text-[#2D4A3E] mb-4 font-merriweather">
                            Tu carrito está vacío
                        </h1>
                        <p className="text-gray-600 mb-8">
                            ¡Descubre nuestros productos frescos y naturales!
                        </p>
                        <Link href="/shop">
                            <Button>Ir a la Tienda</Button>
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen pt-24 pb-12 bg-[#F4F1EA]">
            <Navbar />
            <div className="container mx-auto px-4">
                <h1 className="text-4xl font-bold text-[#2D4A3E] mb-8 font-merriweather">
                    Tu Carrito
                </h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item, index) => {
                            const price = calculatePrice(item.product.price, item.isSubscription);
                            const itemTotal = price * item.quantity;

                            return (
                                <div key={`${item.product.id}-${index}`} className="bg-white rounded-xl p-6 shadow-sm">
                                    <div className="flex gap-6">
                                        {/* Product Image */}
                                        <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                            {item.product.image_src ? (
                                                <Image
                                                    src={item.product.image_src}
                                                    alt={item.product.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                                    Sin imagen
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-bold text-[#2D4A3E] text-lg">
                                                        {item.product.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">{item.product.weight}</p>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(index)}
                                                    className="text-gray-400 hover:text-red-600 transition-colors"
                                                    title="Eliminar"
                                                >
                                                    🗑️
                                                </button>
                                            </div>

                                            {/* Subscription Toggle */}
                                            <div className="flex gap-2 mb-4">
                                                <button
                                                    onClick={() => updateSubscriptionType(index, true)}
                                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${item.isSubscription
                                                        ? 'bg-[#2D4A3E] text-white'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    Suscripción (-18%)
                                                </button>
                                                <button
                                                    onClick={() => updateSubscriptionType(index, false)}
                                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${!item.isSubscription
                                                        ? 'bg-[#2D4A3E] text-white'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    Compra Única
                                                </button>
                                            </div>

                                            {/* Quantity and Price */}
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => updateQuantity(index, item.quantity - 1)}
                                                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="w-12 text-center font-medium">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(index, item.quantity + 1)}
                                                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-bold text-[#8B5E3C]">
                                                        ${itemTotal.toLocaleString('es-CL')}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        ${price.toLocaleString('es-CL')} c/u
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        <button
                            onClick={clearCart}
                            className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                        >
                            Vaciar carrito
                        </button>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
                            <h2 className="text-xl font-bold text-[#2D4A3E] mb-6">Resumen del Pedido</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>${total.toLocaleString('es-CL')}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Envío</span>
                                    <span className="text-green-600 font-medium">Incluido 🚚</span>
                                </div>
                                <div className="border-t pt-3 flex justify-between text-lg font-bold text-[#2D4A3E]">
                                    <span>Total</span>
                                    <span>${total.toLocaleString('es-CL')}</span>
                                </div>
                            </div>

                            <Link href="/checkout">
                                <Button fullWidth className="mb-3">
                                    Proceder al Pago
                                </Button>
                            </Link>

                            <Link href="/shop">
                                <Button fullWidth variant="outline">
                                    Seguir Comprando
                                </Button>
                            </Link>

                            <div className="mt-6 pt-6 border-t">
                                <div className="flex items-start gap-2 text-sm text-gray-600">
                                    <span className="text-green-500">✓</span>
                                    <p>Envío gratis incluido en todos los pedidos</p>
                                </div>
                                <div className="flex items-start gap-2 text-sm text-gray-600 mt-2">
                                    <span className="text-green-500">✓</span>
                                    <p>Pago 100% seguro con Mercado Pago</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
