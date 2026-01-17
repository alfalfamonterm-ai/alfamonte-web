import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { X, Save, Image as ImageIcon, Plus } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { ImageUploader } from './ImageUploader';

interface ProductFormProps {
    initialData: Product | null;
    onSave: (data: Partial<Product>) => Promise<boolean>;
    onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSave, onCancel }) => {
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState(0);
    const [stock, setStock] = useState(0);
    const [category, setCategory] = useState('Fardos');
    const [description, setDescription] = useState('');
    const [imageSrc, setImageSrc] = useState('');
    const [loading, setLoading] = useState(false);
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const { categories, addCategory } = useCategories();

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setPrice(initialData.price);
            setStock(initialData.stock);
            setCategory(initialData.category || 'Fardos');
            setDescription(initialData.description || '');
            setImageSrc(initialData.image_src || '');
        } else {
            // Reset for new
            setTitle('');
            setPrice(0);
            setStock(0);
            setCategory('Fardos');
            setDescription('');
            setImageSrc('');
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const success = await onSave({
            title,
            price,
            stock,
            category,
            description,
            image_src: imageSrc
        });
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
                {/* Header - Fixed */}
                <div className="px-4 py-3 sm:p-6 border-b flex justify-between items-center bg-gray-50 flex-shrink-0">
                    <h3 className="font-bold text-gray-800 text-base sm:text-lg">
                        {initialData ? 'Editar Producto' : 'Nuevo Producto'}
                    </h3>
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 bg-white">
                    {/* Content - Scrollable */}
                    <div className="px-4 py-3 sm:px-6 sm:py-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                        <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Nombre del Producto</label>
                            <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all" placeholder="Ej. Fardo Alfalfa Premium" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Precio ($)</label>
                                <input required type="number" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Stock</label>
                                <input required type="number" value={stock} onChange={e => setStock(Number(e.target.value))} className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center mr-1">
                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Categoría Web</label>
                                <button
                                    type="button"
                                    onClick={() => setShowNewCategory(!showNewCategory)}
                                    className="text-[10px] text-[#2D4A3E] font-bold uppercase tracking-tight hover:underline"
                                >
                                    {showNewCategory ? 'Cancelar' : '+ Nueva'}
                                </button>
                            </div>

                            {showNewCategory ? (
                                <div className="flex gap-2 animate-in slide-in-from-top-1">
                                    <input
                                        value={newCategoryName}
                                        onChange={e => setNewCategoryName(e.target.value)}
                                        placeholder="Nueva categoría..."
                                        className="flex-1 p-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            if (!newCategoryName) return;
                                            const cat = await addCategory(newCategoryName);
                                            if (cat) {
                                                setCategory(cat.name);
                                                setShowNewCategory(false);
                                                setNewCategoryName('');
                                            }
                                        }}
                                        className="px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700"
                                    >
                                        Añadir
                                    </button>
                                </div>
                            ) : (
                                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none">
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Descripción Corta</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 text-sm border border-gray-200 rounded-lg h-20 outline-none focus:ring-2 focus:ring-green-500 resize-none" placeholder="Breve detalle..." />
                        </div>

                        <div className="pt-1">
                            <ImageUploader
                                value={imageSrc}
                                onChange={setImageSrc}
                            />
                        </div>
                    </div>

                    {/* Footer - Fixed */}
                    <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gray-50 border-t flex gap-3 flex-shrink-0">
                        <button type="button" onClick={onCancel} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-600 hover:bg-white transition-colors">Cancelar</button>
                        <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-[#2D4A3E] text-white rounded-xl text-sm font-bold hover:bg-[#1f352c] transition-colors flex justify-center items-center gap-2">
                            {loading ? 'Guardando...' : <><Save size={16} /> Guardar</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
