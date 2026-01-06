"use client";

import { useProductManager } from '@/features/sales/hooks/useProductManager';
import { ProductForm } from '@/features/sales/components/ProductForm';
import { Plus, Package, Edit, Trash2, Search } from 'lucide-react';
import { useState } from 'react';

export default function ProductsPage() {
    const { products, loading, isModalOpen, setIsModalOpen, editingProduct, openNew, openEdit, saveProduct, removeProduct } = useProductManager();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto pb-12">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#2D4A3E] font-merriweather">Catálogo de Productos Web</h1>
                    <p className="text-gray-500">Administra los ítems disponibles para venta online y presencial.</p>
                </div>
                <button onClick={openNew} className="flex items-center gap-2 px-6 py-3 bg-[#2D4A3E] text-white rounded-xl font-bold shadow-lg hover:bg-[#1f352c] transition-colors">
                    <Plus size={20} /> Nuevo Producto
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative">
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Buscar por nombre o categoría..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-12 p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-[#2D4A3E] outline-none"
                />
            </div>

            {/* Products Grid */}
            {loading ? (
                <div className="text-center py-12 text-gray-500">Cargando catálogo...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {filteredProducts.map(product => (
                        <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
                            <div className="h-40 bg-gray-100 relative items-center justify-center flex">
                                {product.image_src ? (
                                    <img src={product.image_src} alt={product.title} className="w-full h-full object-cover" />
                                ) : (
                                    <Package size={48} className="text-gray-300" />
                                )}
                                <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold shadow-sm">
                                    {product.category}
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="font-bold text-gray-800 text-lg mb-1">{product.title}</h3>
                                <p className="text-gray-500 text-sm line-clamp-2 mb-4 h-10">{product.description || 'Sin descripción'}</p>

                                <div className="flex justify-between items-end border-t pt-4">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold">Precio</p>
                                        <p className="text-xl font-bold text-[#2D4A3E]">${product.price?.toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400 uppercase font-bold">Stock</p>
                                        <div className={`font-bold ${product.stock > 0 ? 'text-gray-700' : 'text-red-500'}`}>
                                            {product.stock} Unid.
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-3 flex gap-2 border-t opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEdit(product)} className="flex-1 py-2 flex items-center justify-center gap-2 bg-white border rounded-lg hover:bg-gray-100 font-bold text-xs text-blue-700">
                                    <Edit size={14} /> Editar
                                </button>
                                <button onClick={() => removeProduct(product.id)} className="px-3 py-2 flex items-center justify-center bg-white border rounded-lg hover:bg-red-50 text-red-600">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredProducts.length === 0 && (
                        <div className="col-span-3 text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <Package size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">No se encontraron productos.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <ProductForm
                    initialData={editingProduct}
                    onSave={saveProduct}
                    onCancel={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
}
