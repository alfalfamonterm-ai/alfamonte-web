"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import supabase from '@/lib/supabase';
import { products as hardcodedProducts } from '@/lib/products';

export default function ProductsAdminPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [isMigrating, setIsMigrating] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (data) setProducts(data);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de borrar este producto de la base de datos?')) return;

        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) {
            alert('Error al borrar: ' + error.message);
        } else {
            setProducts(products.filter(p => p.id !== id));
            alert('Producto eliminado correctamente.');
        }
    };

    const handleMigration = async () => {
        setIsMigrating(true);
        try {
            const dbProducts = hardcodedProducts.map(p => ({
                slug: p.slug,
                title: p.title,
                price: p.price,
                description: p.description,
                image_src: p.imageSrc,
                category: p.category,
                weight: '1kg',
                features: []
            }));

            const { error } = await supabase.from('products').upsert(dbProducts, { onConflict: 'slug' });
            if (error) throw error;

            alert('¡Migración Completa!');
            fetchProducts();
        } catch (err: any) {
            console.error(err);
            alert('Error en migración: ' + err.message);
        } finally {
            setIsMigrating(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-[#2D4A3E] font-merriweather">Administración de Productos</h1>
                <Link href="/admin/products/edit/new" className="bg-[#2D4A3E] text-white px-4 py-2 rounded-lg hover:bg-[#3E6052] font-bold">
                    + Nuevo Producto
                </Link>
            </div>

            {products.length === 0 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-yellow-800">Base de Datos de Productos Vacía</h3>
                        <p className="text-sm text-yellow-700">Tus productos actuales viven en el código. Migra para editar.</p>
                    </div>
                    <button
                        onClick={handleMigration}
                        disabled={isMigrating}
                        className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded font-bold hover:bg-yellow-500 disabled:opacity-50"
                    >
                        {isMigrating ? 'Migrando...' : '🚀 Migrar Ahora'}
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {products.map(p => (
                    <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-md transition-shadow">
                        <div>
                            <div className="h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                                {p.image_src ? <img src={p.image_src} alt={p.title} className="w-full h-full object-cover" /> : <span className="text-gray-400">Sin Imagen</span>}
                            </div>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full uppercase font-bold">{p.category}</span>
                            <h3 className="font-bold text-[#2D4A3E] text-lg mt-2 leading-tight">{p.title}</h3>
                            <p className="text-gray-500 text-sm mt-1 line-clamp-2">{p.description}</p>
                        </div>

                        <div className="mt-4 flex justify-between items-end border-t pt-4">
                            <span className="text-xl font-bold text-[#8B5E3C]">${p.price?.toLocaleString()}</span>
                            <div className="flex gap-2">
                                <Link href={`/admin/products/edit/${p.id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Editar">
                                    ✏️
                                </Link>
                                <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Eliminar">
                                    🗑️
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
