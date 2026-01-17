import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { notFound } from "next/navigation";
import BuyButtons from "@/components/checkout/BuyButtons";
import supabase from "@/lib/supabase";
import { Metadata } from 'next';
import { ProductRecommendations } from "@/components/shop/ProductRecommendations";
import { BlogRecommendations } from "@/components/shop/BlogRecommendations";

interface Product {
    id: string;
    slug: string;
    title: string;
    price: number;
    weight: string;
    description: string;
    image_src: string;
    category: string;
    features: string[];
    composition?: string;
    usage_instructions?: string;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const { data: product } = await supabase.from('products').select('*').eq('slug', slug).single();

    if (!product) return { title: 'Producto no encontrado' };

    return {
        title: `${product.title} - Alfa.Monte Premium`,
        description: product.description.slice(0, 160),
        alternates: {
            canonical: `https://alfamonte.cl/product/${slug}`
        }
    };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const { data: productData, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error || !productData) {
        notFound();
    }

    const product = productData as Product;

    return (
        <main className="min-h-screen pt-24 pb-12 bg-white">
            <Navbar />

            <div className="container mx-auto px-4">
                <div className="mb-6 flex items-center justify-between">
                    <Link href="/shop" className="text-[#8B5E3C] font-semibold hover:underline flex items-center gap-2">
                        <span>←</span> Volver a la tienda
                    </Link>
                    <span className="text-gray-400 text-xs">SKU: {product.id.slice(0, 8).toUpperCase()}</span>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-start mb-16">
                    {/* Image Section */}
                    <div className="bg-[#F9F7F2] rounded-3xl h-[400px] md:h-[600px] flex items-center justify-center relative overflow-hidden group border border-gray-100 shadow-sm">
                        {product.image_src ? (
                            <img
                                src={product.image_src}
                                alt={product.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        ) : (
                            <div className="text-center">
                                <span className="text-4xl block mb-2">🌿</span>
                                <span className="text-gray-400 font-medium">{product.title}</span>
                            </div>
                        )}

                        <div className="absolute top-6 left-6 bg-[#2D4A3E] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
                            {product.category}
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="flex flex-col h-full">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-3 py-1 bg-[#F4F1EA] text-[#2D4A3E] font-bold rounded-lg text-xs uppercase tracking-wider">
                                {product.weight || '1 Kg'}
                            </span>
                            <span className="text-xs text-gray-400">• Iva Incluido</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold font-merriweather text-[#2D4A3E] mb-6 leading-tight">
                            {product.title}
                        </h1>

                        <div className="flex flex-col gap-2 mb-8">
                            <div className="flex items-center gap-4">
                                <p className="text-4xl font-bold text-[#8B5E3C]">
                                    ${product.price.toLocaleString('es-CL')}
                                </p>
                                <span className="text-sm line-through text-gray-300">
                                    ${(product.price * 1.25).toLocaleString('es-CL')}
                                </span>
                            </div>
                            <p className="text-[#2D4A3E] font-medium flex items-center gap-2">
                                <span className="text-lg">🚚</span>
                                Envío calculado en el siguiente paso (RM desde $2.990)
                            </p>
                        </div>

                        <p className="text-lg text-gray-600 leading-relaxed mb-8 border-l-4 border-[#F4F1EA] pl-6 italic">
                            {product.description}
                        </p>

                        <div className="mt-auto space-y-6">
                            <BuyButtons product={product} />

                            {/* Shipping Trust Widget */}
                            <div className="bg-[#F8F9FA] p-5 rounded-2xl border border-gray-100">
                                <h4 className="font-bold text-[#2D4A3E] text-sm mb-3 flex items-center gap-2">
                                    <span>📦</span> Consulta de Despacho
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                                    <div className="flex justify-between border-b pb-1">
                                        <span>RM Urbana</span>
                                        <span className="font-bold text-[#2D4A3E]">$2.990</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-1">
                                        <span>RM Rural</span>
                                        <span className="font-bold text-[#2D4A3E]">$4.500</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-1">
                                        <span>Provincias</span>
                                        <span className="font-bold text-[#2D4A3E]">Starken/Blue</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-1">
                                        <span>Plazo</span>
                                        <span className="font-bold text-[#2D4A3E]">2-5 días</span>
                                    </div>
                                </div>
                                <p className="text-[10px] mt-2 opacity-60">* Valores finales se confirman al ingresar dirección</p>
                            </div>

                            <div className="flex items-center justify-center gap-8 opacity-40 grayscale h-8">
                                <img src="/mp-logo.png" alt="Mercado Pago" className="h-full object-contain" />
                                <img src="/webpay-logo.png" alt="Webpay" className="h-full object-contain" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Technical Specs Tab Grid */}
                <div className="grid md:grid-cols-3 gap-8 mt-12 border-t pt-16">
                    <div className="space-y-4">
                        <div className="w-12 h-12 bg-[#F4F1EA] rounded-full flex items-center justify-center text-xl">🌿</div>
                        <h3 className="text-xl font-bold text-[#2D4A3E]">Composición</h3>
                        <p className="text-gray-600 leading-relaxed">
                            {product.composition || "100% Alfalfa natural seleccionada, secada al sol para preservar nutrientes esenciales, fibra y clorofila. Sin aditivos químicos ni conservantes artificiales."}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="w-12 h-12 bg-[#F4F1EA] rounded-full flex items-center justify-center text-xl">🦷</div>
                        <h3 className="text-xl font-bold text-[#2D4A3E]">Beneficios</h3>
                        <ul className="text-gray-600 space-y-2">
                            <li className="flex gap-2"><span>•</span> Favorece el desgaste dental natural.</li>
                            <li className="flex gap-2"><span>•</span> Alto contenido de fibra cruda para la digestión.</li>
                            <li className="flex gap-2"><span>•</span> Aporta calcio y proteínas para el crecimiento.</li>
                            {product.features?.map((f, i) => (
                                <li key={i} className="flex gap-2"><span>•</span> {f}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <div className="w-12 h-12 bg-[#F4F1EA] rounded-full flex items-center justify-center text-xl">🥣</div>
                        <h3 className="text-xl font-bold text-[#2D4A3E]">Uso y Conservación</h3>
                        <p className="text-gray-600 leading-relaxed">
                            {product.usage_instructions || "Suministrar como complemento de la dieta diaria. Mantener siempre agua fresca a disposición. Almacenar en lugar fresco, seco y protegido de la luz solar directa."}
                        </p>
                    </div>
                </div>

                {/* Recommendations and Content */}
                <div className="mt-16 space-y-16">
                    <ProductRecommendations
                        currentProductId={product.id}
                        category={product.category}
                        type="related"
                    />

                    <BlogRecommendations
                        category={product.category}
                    />

                    <ProductRecommendations
                        currentProductId={product.id}
                        category={product.category}
                        type="bought-together"
                    />
                </div>
            </div>
        </main>
    );
}
