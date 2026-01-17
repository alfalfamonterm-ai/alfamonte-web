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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50 flex-shrink-0">
                    <h3 className="font-bold text-gray-800 text-lg">
                        {initialData ? 'Editar Producto' : 'Nuevo Producto'}
                    </h3>
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Producto</label>
                        <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="Ej. Fardo Alfalfa Premium" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Precio Compra ($)</label>
                            <input required type="number" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full p-3 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Stock Inicial</label>
                            <input required type="number" value={stock} onChange={e => setStock(Number(e.target.value))} className="w-full p-3 border rounded-lg" />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-bold text-gray-700">Categoría Web</label>
                            <button
                                type="button"
                                onClick={() => setShowNewCategory(!showNewCategory)}
                                className="text-xs text-[#2D4A3E] font-bold flex items-center gap-1 hover:underline"
                            >
                                <Plus size={12} /> {showNewCategory ? 'Cancelar' : 'Nueva Categoría'}
                            </button>
                        </div>

                        {showNewCategory ? (
                            <div className="flex gap-2 animate-in slide-in-from-top-1">
                                <input
                                    value={newCategoryName}
                                    onChange={e => setNewCategoryName(e.target.value)}
                                    placeholder="Nombre de la nueva categoría..."
                                    className="flex-1 p-3 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
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
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
                                >
                                    Crear
                                </button>
                            </div>
                        ) : (
                            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 border rounded-lg bg-white">
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 border rounded-lg h-24" placeholder="Detalles para la web..." />
                    </div>

                    <div className="pt-2">
                        <ImageUploader
                            value={imageSrc}
                            onChange={setImageSrc}
                        />
                    </div>

                    <div className="pt-4 flex gap-3 sticky bottom-0 bg-white border-t mt-4">
                        <button type="button" onClick={onCancel} className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50">Cancelar</button>
                        <button type="submit" disabled={loading} className="flex-1 py-3 bg-[#2D4A3E] text-white rounded-xl font-bold hover:bg-[#1f352c] flex justify-center items-center gap-2">
                            {loading ? 'Guardando...' : <><Save size={18} /> Guardar Producto</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
