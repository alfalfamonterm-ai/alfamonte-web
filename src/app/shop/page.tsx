"use client";

import { useState, useEffect } from 'react';
import Navbar from "@/components/layout/Navbar";
import { ProductCard } from "@/components/ui/ProductCard";
import supabase from "@/lib/supabase";
import { Category } from "@/features/sales/hooks/useCategories";
import { useCategories } from "@/features/sales/hooks/useCategories";

// Define Product Interface matching DB
interface Product {
    id: string; // db uses uuid usually, but check
    slug: string;
    title: string;
    price: number;
    weight: string;
    description: string;
    image_src: string; // DB column is snake_case
    category: string;
    features: string[];
    stock: number;
}

export default function ShopPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const { categories, loading: categoriesLoading } = useCategories();

    const displayCategories = [
        { id: 'all', name: 'Todos' },
        ...categories
    ];

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('price', { ascending: true });

        if (data) {
            setProducts(data);
        }
        setLoading(false);
    };

    const filteredProducts = activeCategory === 'all'
        ? products
        : products.filter(p => p.category === activeCategory);

    return (
        <main className="min-h-screen pt-24 pb-12 bg-[#F4F1EA]">
            <Navbar />

            <div className="container mx-auto px-4">
                <header className="text-center mb-12">
                    <h1 className="text-4xl font-bold font-merriweather text-[#2D4A3E] mb-4">
                        La Despensa de Alfa.Monte
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Selecciona tu tipo de mascota para ver los formatos recomendados.
                    </p>
                </header>

                {/* Category Filter */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {displayCategories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.name === 'Todos' ? 'all' : cat.name)}
                            className={`px-6 py-2 rounded-full font-medium transition-all ${(activeCategory === 'all' && cat.name === 'Todos') || activeCategory === cat.name
                                    ? 'bg-[#2D4A3E] text-white shadow-md'
                                    : 'bg-white text-[#2D4A3E] hover:bg-[#E8F5E9]'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D4A3E] mx-auto"></div>
                        <p className="mt-4 text-gray-500">Cargando productos frescos...</p>
                    </div>
                ) : null}

                {!loading && filteredProducts.length > 0 && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                title={product.title}
                                price={product.price}
                                weight={product.weight || '1 Kg'}
                                slug={product.slug}
                                imageSrc={product.image_src || '/images/placeholder.jpg'}
                                description={product.description || ''}
                                category={product.category || ''}
                                stock={product.stock || 0}
                            />
                        ))}
                    </div>
                )}

                {!loading && filteredProducts.length === 0 && (
                    <div className="text-center text-gray-500 py-12">
                        No encontramos productos para esta categoría aún.
                    </div>
                )}
            </div>
        </main>
    );
}
