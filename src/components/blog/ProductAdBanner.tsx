import React from 'react';
import supabase from '@/lib/supabase';
import Link from 'next/link';

interface ProductAdBannerProps {
    category: string;
}

export const ProductAdBanner: React.FC<ProductAdBannerProps> = async ({ category }) => {
    // Fetch top product for this category
    const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .limit(3);

    const featuredProducts = products || [];

    if (featuredProducts.length === 0) return null;

    return (
        <div className="my-12 bg-gradient-to-br from-[#2D4A3E] to-[#1F352C] rounded-3xl p-8 text-white shadow-xl overflow-hidden relative">
            <div className="relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="max-w-md">
                        <span className="text-xs font-bold uppercase tracking-widest text-green-300 mb-2 block">Recomendado para tu mascota</span>
                        <h3 className="text-2xl font-bold font-merriweather mb-2">Lo mejor en Heno para {category}</h3>
                        <p className="text-green-100/80 text-sm mb-6">Directo del campo a tu casa, seleccionamos la mejor fibra para asegurar la salud de tu {category}.</p>
                        <Link href={`/shop?category=${encodeURIComponent(category)}`} className="inline-block px-6 py-3 bg-white text-[#2D4A3E] rounded-xl font-bold hover:bg-green-50 transition-colors">
                            Ver Catálogo de {category}
                        </Link>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-4 md:pb-0 w-full md:w-auto">
                        {featuredProducts.map(p => (
                            <Link key={p.id} href={`/product/${p.slug}`} className="min-w-[140px] bg-white/10 backdrop-blur-md p-3 rounded-2xl hover:bg-white/20 transition-all border border-white/10">
                                <img src={p.image_src} alt={p.title} className="w-full h-24 object-cover rounded-xl mb-2" />
                                <p className="text-xs font-bold truncate">{p.title}</p>
                                <p className="text-xs text-green-300 font-bold">${p.price.toLocaleString('es-CL')}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Decorative background elements */}
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-green-400/10 rounded-full blur-3xl"></div>
        </div>
    );
};
