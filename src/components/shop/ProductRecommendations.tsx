import React from 'react';
import { ProductCard } from '@/components/ui/ProductCard';
import supabase from '@/lib/supabase';

interface ProductRecommendationsProps {
    currentProductId: string;
    category: string;
    type: 'related' | 'bought-together';
}

export const ProductRecommendations: React.FC<ProductRecommendationsProps> = async ({ currentProductId, category, type }) => {
    // Fetch products from same category or fallback to top products
    const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .neq('id', currentProductId)
        .limit(4);

    const displayProducts = products && products.length > 0 ? products : [];

    // Fallback if no related products in same category
    if (displayProducts.length === 0) {
        const { data: fallbackProducts } = await supabase
            .from('products')
            .select('*')
            .neq('id', currentProductId)
            .limit(4);
        if (fallbackProducts) displayProducts.push(...fallbackProducts);
    }

    if (displayProducts.length === 0) return null;

    return (
        <section className="py-12 border-t border-gray-100">
            <h2 className="text-2xl font-bold font-merriweather text-[#2D4A3E] mb-8">
                {type === 'related' ? '🍀 Productos Relacionados' : '🛒 Clientes también compraron'}
            </h2>
            <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x h-full">
                {displayProducts.slice(0, 4).map((p: any) => (
                    <div key={p.id} className="min-w-[280px] md:min-w-[320px] snap-start">
                        <ProductCard 
                            id={p.id}
                            title={p.title}
                            price={p.price}
                            weight={p.weight || '1 Kg'}
                            slug={p.slug}
                            imageSrc={p.image_src || '/images/placeholder.jpg'}
                            description={p.description || ''}
                            category={p.category || ''}
                            stock={p.stock || 0}
                        />
                    </div>
                ))}
            </div>
            {/* Custom scrollbar suggestion or indicator if needed, but flex gap is enough */}
        </section>
    );
};
