"use client";

import { useState, useEffect, Suspense } from 'react';
import { useCart } from '@/contexts/CartContext';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import supabase from '@/lib/supabase';

interface CheckoutData {
    // Datos personales
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    rut: string;

    // Dirección
    region: string;
    comuna: string;
    street: string;
    number: string;
    apartment: string;
    additionalInfo: string;
}

// Separate component for the actual checkout logic to use useSearchParams
function CheckoutContent() {
    const { items, getSubtotal } = useCart();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Modes
    const mode = searchParams.get('mode');
    const productId = searchParams.get('product_id');
    const isSubscription = mode === 'subscription' && !!productId;

    const [loading, setLoading] = useState(false);
    const [subProduct, setSubProduct] = useState<any>(null);
    const [errors, setErrors] = useState<Partial<Record<keyof CheckoutData, string>>>({});

    const [formData, setFormData] = useState<CheckoutData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        rut: '',
        region: '',
        comuna: '',
        street: '',
        number: '',
        apartment: '',
        additionalInfo: '',
    });

    // Load product for subscription mode
    useEffect(() => {
        if (isSubscription) {
            const fetchProduct = async () => {
                const { data } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', productId)
                    .single();
                if (data) setSubProduct(data);
            };
            fetchProduct();
        }
    }, [isSubscription, productId]);

    // Redirect if cart is empty and NOT in subscription mode
    if (!isSubscription && items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-3xl font-bold text-[#2D4A3E] mb-4 font-merriweather">
                    Tu carrito está vacío
                </h1>
                <p className="text-gray-600 mb-8">
                    Agrega productos antes de proceder al checkout o selecciona una suscripción.
                </p>
                <Link href="/shop">
                    <Button>Ir a la Tienda</Button>
                </Link>
            </div>
        );
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof CheckoutData]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof CheckoutData, string>> = {};
        if (!formData.firstName.trim()) newErrors.firstName = 'Nombre es requerido';
        if (!formData.lastName.trim()) newErrors.lastName = 'Apellido es requerido';
        if (!formData.email.trim()) newErrors.email = 'Email es requerido';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }
        if (!formData.phone.trim()) newErrors.phone = 'Teléfono es requerido';
        else if (!/^(\+?56)?[0-9]{9}$/.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Formato: +56912345678 o 912345678';
        }
        if (!formData.region.trim()) newErrors.region = 'Región es requerida';
        if (!formData.comuna.trim()) newErrors.comuna = 'Comuna es requerida';
        if (!formData.street.trim()) newErrors.street = 'Calle es requerida';
        if (!formData.number.trim()) newErrors.number = 'Número es requerido';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);

        try {
            localStorage.setItem('checkout-data', JSON.stringify(formData));

            if (isSubscription && subProduct) {
                // Subscription Flow
                // Fallback for plan ID mapping if not in DB column yet
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

                const planId = subProduct.mp_plan_id || PLAN_MAPPING[subProduct.id];

                const response = await fetch('/api/subscription', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        planId,
                        customer: formData,
                        productTitle: subProduct.title,
                        amount: subProduct.price
                    }),
                });

                const data = await response.json();
                if (data.init_point) {
                    window.location.href = data.init_point;
                } else {
                    alert('Error al iniciar la suscripción: ' + (data.error || 'Intenta nuevamente'));
                }
            } else {
                // Standard Cart Flow
                const response = await fetch('/api/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items,
                        customer: formData,
                        totalAmount: getSubtotal(),
                    }),
                });

                const data = await response.json();
                if (data.id) {
                    router.push(`/payment?preference_id=${data.id}`);
                } else {
                    alert(`Error al procesar el pago: ${data.details || data.error || 'Intenta nuevamente'}`);
                }
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al procesar el pago');
        } finally {
            setLoading(false);
        }
    };

    const total = isSubscription && subProduct ? subProduct.price : getSubtotal();

    return (
        <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
                <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 shadow-sm">
                    {/* Personal Information */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-[#2D4A3E] mb-6">
                            {isSubscription ? 'Datos para tu Suscripción' : 'Datos Personales'}
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2D4A3E] focus:border-transparent ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Juan"
                                />
                                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Apellido *</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2D4A3E] focus:border-transparent ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Pérez"
                                />
                                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2D4A3E] focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="juan@ejemplo.com"
                                />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2D4A3E] focus:border-transparent ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="+56912345678"
                                />
                                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-[#2D4A3E] mb-6">Dirección de Despacho</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Región *</label>
                                <input
                                    type="text"
                                    name="region"
                                    value={formData.region}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2D4A3E] focus:border-transparent ${errors.region ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Región Metropolitana"
                                />
                                {errors.region && <p className="text-red-500 text-sm mt-1">{errors.region}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Comuna *</label>
                                <input
                                    type="text"
                                    name="comuna"
                                    value={formData.comuna}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2D4A3E] focus:border-transparent ${errors.comuna ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Santiago"
                                />
                                {errors.comuna && <p className="text-red-500 text-sm mt-1">{errors.comuna}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Calle y Número *</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <input
                                        type="text"
                                        name="street"
                                        value={formData.street}
                                        onChange={handleChange}
                                        className={`col-span-2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2D4A3E] focus:border-transparent ${errors.street ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="Av. Principal"
                                    />
                                    <input
                                        type="text"
                                        name="number"
                                        value={formData.number}
                                        onChange={handleChange}
                                        className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2D4A3E] focus:border-transparent ${errors.number ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="123"
                                    />
                                </div>
                                {(errors.street || errors.number) && <p className="text-red-500 text-sm mt-1">Calle y número son requeridos</p>}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Link href={isSubscription ? `/product/${productId}` : "/cart"} className="flex-1">
                            <Button type="button" variant="outline" fullWidth>
                                Volver
                            </Button>
                        </Link>
                        <Button type="submit" fullWidth disabled={loading || (isSubscription && !subProduct)} className="flex-1">
                            {loading ? 'Procesando...' : isSubscription ? 'Confirmar Suscripción' : 'Ir al Pago'}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
                    <h2 className="text-xl font-bold text-[#2D4A3E] mb-6">Resumen</h2>

                    <div className="space-y-4 mb-6">
                        {isSubscription && subProduct ? (
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex flex-col">
                                    <span className="font-bold text-[#2D4A3E]">Suscripción Mensual</span>
                                    <span className="text-gray-600">{subProduct.title}</span>
                                </div>
                                <span className="font-medium">
                                    ${subProduct.price.toLocaleString('es-CL')}
                                </span>
                            </div>
                        ) : (
                            items.map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                        {item.product.title} x{item.quantity}
                                    </span>
                                    <span className="font-medium">
                                        ${(item.product.price * item.quantity).toLocaleString('es-CL')}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="border-t pt-4 space-y-3">
                        <div className="flex justify-between text-gray-600 text-sm">
                            <span>Subtotal (IVA Incl.)</span>
                            <span>${total.toLocaleString('es-CL')}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 text-sm">
                            <span>Costo de Envío</span>
                            <span className="text-[#2D4A3E] font-medium tracking-tight">
                                {total >= 50000 ? '$0 (Gratis)' : 'Calculado según dirección'}
                            </span>
                        </div>
                        <div className="border-t pt-3 flex justify-between text-xl font-bold text-[#2D4A3E]">
                            <span>{isSubscription ? 'Total Mensual' : 'Total Final'}</span>
                            <span>${total.toLocaleString('es-CL')}</span>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t space-y-4">
                        <div className="flex items-center gap-3 text-xs text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
                            <span className="text-xl">🛡️</span>
                            <p>Tu compra está protegida. La pasarela de pago cumple con estándares PCI-DSS de seguridad.</p>
                        </div>

                        <div className="flex justify-center gap-4 opacity-50 grayscale scale-75">
                            <img src="https://www.mercadopago.cl/instore/assets/images/logo-mp.png" alt="MP" className="h-6" />
                            <img src="https://www.transbank.cl/public/img/logo-webpay.png" alt="Webpay" className="h-6" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <main className="min-h-screen pt-24 pb-12 bg-[#F4F1EA]">
            <Navbar />
            <div className="container mx-auto px-4">
                <Suspense fallback={<div className="text-center py-20 text-[#2D4A3E]">Cargando checkout...</div>}>
                    <CheckoutContent />
                </Suspense>
            </div>
        </main>
    );
}
