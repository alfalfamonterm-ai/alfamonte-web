import React, { useState, useRef } from 'react';
import { Upload, X, Check, AlertCircle, Image as ImageIcon } from 'lucide-react';
import supabase from '@/lib/supabase';

interface ImageUploaderProps {
    value: string;
    onChange: (url: string) => void;
    folder?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ value, onChange, folder = 'products' }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation: WebP format
        if (file.type !== 'image/webp') {
            setError('La imagen debe estar en formato WebP para asegurar un sitio liviano.');
            return;
        }

        // Validation: Size (Max 1MB)
        if (file.size > 1024 * 1024) {
            setError('La imagen es muy pesada. Debe pesar menos de 1MB.');
            return;
        }

        setError(null);
        setUploading(true);

        try {
            const fileExt = 'webp';
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${folder}/${fileName}`;

            const { data, error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(filePath);

            onChange(publicUrl);
        } catch (err: any) {
            console.error('Upload error:', err);
            setError('Error al subir la imagen. Asegúrate que existe el bucket "products" en Supabase.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 mb-1">Imagen del Producto (WebP, máx 1MB)</label>

            <div className="flex items-start gap-4">
                <div className="w-32 h-32 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative group">
                    {value ? (
                        <>
                            <img src={value} alt="Preview" className="w-full h-full object-cover" />
                            <button
                                onClick={() => onChange('')}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={12} />
                            </button>
                        </>
                    ) : (
                        <ImageIcon className="text-gray-300" size={32} />
                    )}
                    {uploading && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                            <div className="w-6 h-6 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/webp"
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 px-4 py-2 border-2 border-[#2D4A3E] text-[#2D4A3E] rounded-lg font-bold hover:bg-[#2D4A3E] hover:text-white transition-all disabled:opacity-50"
                    >
                        <Upload size={18} />
                        {uploading ? 'Subiendo...' : 'Cargar Imagen .webp'}
                    </button>

                    <p className="mt-2 text-xs text-gray-500 italic">
                        Recomendado: 800x800 px para mejores resultados.
                    </p>

                    {error && (
                        <div className="mt-2 flex items-center gap-1 text-red-500 text-xs font-bold animate-pulse">
                            <AlertCircle size={14} />
                            {error}
                        </div>
                    )}
                    {value && !error && (
                        <div className="mt-2 flex items-center gap-1 text-green-600 text-xs font-bold">
                            <Check size={14} />
                            Imagen cargada correctamente
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
