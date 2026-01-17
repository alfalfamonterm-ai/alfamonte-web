import React, { useState, useRef } from 'react';
import { Upload, X, Check, AlertCircle, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
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

        // Force WebP or convert if possible, but for now just validate
        if (file.type !== 'image/webp' && !file.type.startsWith('image/')) {
            setError('Por favor sube una imagen (se recomienda WebP).');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setError('La imagen es muy pesada. Máximo 2MB.');
            return;
        }

        setError(null);
        setUploading(true);

        try {
            const fileExt = file.name.split('.').pop() || 'webp';
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${fileName}`; // Upload directly to bucket root or specific subfolder

            const { data, error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(filePath);

            onChange(publicUrl);
        } catch (err: any) {
            console.error('Upload error:', err);
            setError('Error al conectar con Supabase Storage. Verifica el bucket "products".');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Imagen del Producto</label>

            <div className="flex items-center gap-3">
                <div className="w-20 h-20 bg-white rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden relative group shrink-0">
                    {value ? (
                        <>
                            <img src={value} alt="Preview" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => onChange('')}
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                            >
                                <X size={20} />
                            </button>
                        </>
                    ) : (
                        <ImageIcon className="text-gray-300" size={24} />
                    )}
                    {uploading && (
                        <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-[#2D4A3E] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full py-2 px-3 bg-white border border-[#2D4A3E] text-[#2D4A3E] rounded-lg text-xs font-bold hover:bg-[#2D4A3E] hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                        <Upload size={14} />
                        {uploading ? 'Subiendo...' : 'Seleccionar Imagen'}
                    </button>
                    {error ? (
                        <p className="text-[10px] text-red-500 font-medium mt-1 leading-tight">{error}</p>
                    ) : (
                        <p className="text-[10px] text-gray-400 mt-1">Sube la foto y se guardará automáticamente.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
