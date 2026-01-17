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
    const [showManualUrl, setShowManualUrl] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'image/webp') {
            setError('La imagen debe estar en formato WebP para asegurar un sitio liviano.');
            return;
        }

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
            setError('Error al subir. Usa "URL Manual" si el bucket no está creado.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="flex justify-between items-center">
                <label className="block text-sm font-bold text-gray-700">Imagen del Producto</label>
                <button
                    type="button"
                    onClick={() => setShowManualUrl(!showManualUrl)}
                    className="text-xs text-[#2D4A3E] font-bold flex items-center gap-1 hover:underline"
                >
                    <LinkIcon size={12} /> {showManualUrl ? 'Cerrar URL Manual' : 'Ingresar URL Manual'}
                </button>
            </div>

            <div className="flex items-start gap-4">
                <div className="w-24 h-24 bg-white rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative group flex-shrink-0">
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
                        <ImageIcon className="text-gray-300" size={24} />
                    )}
                    {uploading && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                            <div className="w-6 h-6 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>

                <div className="flex-1 space-y-2">
                    {showManualUrl ? (
                        <div className="animate-in slide-in-from-top-1">
                            <input
                                value={value}
                                onChange={(e) => onChange(e.target.value)}
                                placeholder="https://ejemplo.com/imagen.webp"
                                className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Ingresa el link directo de la imagen.</p>
                        </div>
                    ) : (
                        <>
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
                                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#2D4A3E] text-[#2D4A3E] rounded-lg text-sm font-bold hover:bg-[#2D4A3E] hover:text-white transition-all disabled:opacity-50"
                            >
                                <Upload size={16} />
                                {uploading ? 'Subiendo...' : 'Subir WebP (máx 1MB)'}
                            </button>
                        </>
                    )}

                    {!showManualUrl && (
                        <p className="text-[10px] text-gray-500 italic">
                            WebP recomendado para mejor rendimiento.
                        </p>
                    )}

                    {error && (
                        <div className="mt-2 flex items-center gap-1 text-red-500 text-[10px] font-bold">
                            <AlertCircle size={12} />
                            {error}
                        </div>
                    )}
                    {value && !error && !uploading && !showManualUrl && (
                        <div className="mt-2 flex items-center gap-1 text-green-600 text-[10px] font-bold">
                            <Check size={12} />
                            Imagen lista
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
