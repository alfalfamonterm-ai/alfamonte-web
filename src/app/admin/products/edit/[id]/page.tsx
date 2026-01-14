"use client";

import { useEffect, useState, use } from 'react'; // use is needed for next.js 13+ dynamic params in some configs, but standard is props
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';

// Helper for dynamic params in Next.js 15+ (if using app dir strictly)
// But standard props usually work: { params: { id: string } }
export default function ProductEditorPage({ params }: { params: { id: string } }) {
    // Unwrapping params if it's a promise (Next 15 breaking change, but mostly safe to assume object in 14)
    // To be safe we treat it as potentially async or use simple access.
    // Let's assume params.id is available directly or we handle 'new'.

    // WORKAROUND: If params.id is 'new', we are creating. Else editing.
    // Note: in recent Next.js versions params might need to be awaited.
    // I will use a simple client-side check if possible or just rely on the router/path if params struggle.
    // Actually, let's just use standard state init.

    const isNew = params.id === 'new';
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    const [form, setForm] = useState({
        title: '',
        price: '',
        description: '',
        category: 'Caballos',
        image_src: '',
        slug: '',
        stock: '0',
        is_subscription_enabled: false,
        mp_plan_id: ''
    });

    useEffect(() => {
        if (!isNew) {
            fetchProduct(params.id);
        }
    }, [params.id]);

    const fetchProduct = async (id: string) => {
        const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
        if (data) {
            setForm({
                title: data.title,
                price: data.price,
                description: data.description || '',
                category: data.category || 'Caballos',
                image_src: data.image_src || '',
                slug: data.slug || '',
                stock: data.stock || '0',
                is_subscription_enabled: data.is_subscription_enabled || false,
                mp_plan_id: data.mp_plan_id || ''
            });
        }
        setLoading(false);
    };

    const handleChange = (e: any) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setForm({ ...form, [e.target.name]: value });
    };

    const generateSlug = (title: string) => {
        return title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                title: form.title,
                price: Number(form.price),
                description: form.description,
                category: form.category,
                image_src: form.image_src,
                stock: Number(form.stock),
                slug: form.slug || generateSlug(form.title)
            };

            let error;
            let productData;

            if (isNew) {
                const { data, error: err } = await supabase.from('products').insert(payload).select().single();
                error = err;
                productData = data;
            } else {
                const { data, error: err } = await supabase.from('products').update(payload).eq('id', params.id).select().single();
                error = err;
                productData = data;
            }

            if (error) throw error;

            // --- SYNC WITH MERCADO PAGO ---
            if (payload.price > 0) {
                try {
                    const syncResponse = await fetch('/api/admin/products/sync', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...payload,
                            is_subscription_enabled: form.is_subscription_enabled,
                            mp_plan_id: form.mp_plan_id
                        }),
                    });

                    const syncData = await syncResponse.json();
                    if (syncData.mp_plan_id && syncData.mp_plan_id !== form.mp_plan_id) {
                        // Update product with the new MP Plan ID
                        await supabase.from('products').update({ mp_plan_id: syncData.mp_plan_id }).eq('id', productData.id);
                    }
                } catch (syncErr) {
                    console.error('Failed to sync with MP:', syncErr);
                    // We don't block the whole save if sync fails, but alert the user
                    alert('Atención: El producto se guardó pero la sincronización con Mercado Pago falló.');
                }
            }

            alert(`Producto ${isNew ? 'creado' : 'actualizado'} con éxito.`);
            router.push('/admin/products');
            router.refresh();

        } catch (err: any) {
            alert('Error: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Cargando producto...</div>;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">← Volver</button>
                <h1 className="text-2xl font-bold text-[#2D4A3E] font-merriweather">
                    {isNew ? 'Nuevo Producto' : 'Editar Producto'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Producto</label>
                    <input name="title" required value={form.title} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 ring-[#2D4A3E] outline-none" placeholder="Ej: Fardo Premium" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Precio ($)</label>
                        <input name="price" type="number" required value={form.price} onChange={handleChange} className="w-full p-2 border rounded font-mono" placeholder="5000" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Stock Disponible</label>
                        <input name="stock" type="number" value={form.stock} onChange={handleChange} className="w-full p-2 border rounded font-mono" placeholder="100" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Categoría</label>
                    <select name="category" value={form.category} onChange={handleChange} className="w-full p-2 border rounded">
                        <option value="Caballos">Caballos</option>
                        <option value="Conejos">Conejos</option>
                        <option value="Hámsters">Hámseters / Cobayas</option>
                        <option value="Gallinas">Gallinas</option>
                        <option value="Accesorios">Accesorios</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
                    <textarea name="description" rows={4} value={form.description} onChange={handleChange} className="w-full p-2 border rounded resize-none" />
                </div>

                <div className="bg-[#F8F9FA] p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="is_subscription_enabled"
                            name="is_subscription_enabled"
                            checked={form.is_subscription_enabled}
                            onChange={handleChange}
                            className="w-5 h-5 accent-[#2D4A3E]"
                        />
                        <div>
                            <label htmlFor="is_subscription_enabled" className="block text-sm font-bold text-[#2D4A3E]">Activar como Suscripción</label>
                            <p className="text-xs text-gray-500">Se creará un Plan Mensual automáticamente en Mercado Pago.</p>
                        </div>
                    </div>
                    {form.mp_plan_id && (
                        <div className="mt-3 text-[10px] text-gray-400 font-mono">
                            ID Plan MP: {form.mp_plan_id}
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">URL Imagen</label>
                    <input name="image_src" value={form.image_src} onChange={handleChange} className="w-full p-2 border rounded text-xs text-gray-500" placeholder="https://..." />
                    {form.image_src && (
                        <div className="mt-2 h-32 w-32 bg-gray-100 rounded overflow-hidden border">
                            <img src={form.image_src} className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>

                <div className="pt-6 border-t flex justify-end gap-3">
                    <button type="button" onClick={() => router.back()} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                    <button type="submit" disabled={saving} className="px-6 py-2 bg-[#2D4A3E] text-white font-bold rounded hover:bg-[#3E6052] disabled:opacity-50">
                        {saving ? 'Guardando...' : '💾 Guardar Producto'}
                    </button>
                </div>

            </form>
        </div>
    );
}
