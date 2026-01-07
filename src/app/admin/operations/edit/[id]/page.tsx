"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import supabase from '@/lib/supabase';

// Helper to fetch settings (mock or localstorage)
const getSettings = () => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('adminSettings');
        if (saved) return JSON.parse(saved);
    }
    return { tasaRiegoEnrique: 25000, precioFardoEstandar: 5000 };
};

export default function EditOperationPage() {
    const router = useRouter();
    const params = useParams(); // Correctly get params in Client Component
    const id = params?.id as string; // Safe cast

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Settings State
    const [settings, setSettings] = useState({
        tractor_cost_per_bale: 650,
        irrigation_cost_per_day: 25000
    });

    // --- FORM STATE (Duplicates NewOperationPage) ---
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [panoId, setPanoId] = useState<string[]>(['1']); // Changed to array for multi-paño
    const [corteId, setCorteId] = useState('1');
    const [category, setCategory] = useState<'Rendimiento' | 'Venta' | 'Costo Operacional'>('Rendimiento');
    const [subcategory, setSubcategory] = useState('');
    const [description, setDescription] = useState('');
    const [quantity, setQuantity] = useState<number>(0);
    const [unitCost, setUnitCost] = useState<number>(0);
    const [totalCost, setTotalCost] = useState<number>(0);
    const [performer, setPerformer] = useState('');
    const [amountPaid, setAmountPaid] = useState<number>(0);
    const [paymentDueDate, setPaymentDueDate] = useState<string>('');

    // Fetch Settings
    useEffect(() => {
        const loadSettings = async () => {
            const { data } = await supabase.from('settings').select('value').eq('key', 'global_config').single();
            if (data) setSettings(data.value);
        };
        loadSettings();
    }, []);

    // Auto-calculate for Tractor Cost (with manual override capability)
    useEffect(() => {
        if (subcategory === 'Mano de Obra (Tractor)' && quantity > 0) {
            setTotalCost(quantity * settings.tractor_cost_per_bale);
        }
    }, [quantity, subcategory, settings.tractor_cost_per_bale]);

    useEffect(() => {
        if (id) {
            fetchOperation(id);
        }
    }, [id]);

    const fetchOperation = async (opId: string) => {
        const { data, error } = await supabase.from('operations').select('*').eq('id', opId).single();
        if (data) {
            setStartDate(data.date);
            setEndDate(data.items?.endDate || data.date); // Fallback

            // Parse pano_id: could be single "1" or multi "1,2,3"
            const panoIds = data.pano_id ? data.pano_id.toString().split(',') : ['1'];
            setPanoId(panoIds);

            setCorteId(data.corte_id || '1');
            setCategory(data.category);
            setSubcategory(data.subcategory);
            setDescription(data.description);
            setQuantity(data.quantity);
            setUnitCost(data.unit_cost || 0);
            setTotalCost(data.total_cost);
            setPerformer(data.performer || '');
            setAmountPaid(data.amount_paid || 0);
            setPaymentDueDate(data.payment_due_date || '');
            setLoading(false);
        } else {
            console.error(error);
            alert('Operación no encontrada o error de conexión.');
            router.push('/admin/operations');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Manual Update: We trust the user edits the values correctly. 
            // We don't run auto-calc logic here deeply because it might overwrite manual adjustments.
            // We save what is in the form.
            const payload = {
                date: startDate,
                pano_id: panoId.join(','), // Convert array to comma-separated string
                corte_id: corteId,
                category,
                subcategory,
                quantity,
                unit_cost: unitCost,
                total_cost: totalCost,
                performer,
                description,
                amount_paid: amountPaid,
                payment_due_date: paymentDueDate || null,
                payment_status: amountPaid >= totalCost ? 'paid' : (amountPaid > 0 ? 'partial' : 'pending'),
                items: { startDate, endDate }
            };

            const { error } = await supabase.from('operations').update(payload).eq('id', id);
            if (error) throw error;

            alert('Operación actualizada.');
            router.push('/admin/operations');
            router.refresh();
        } catch (err: any) {
            alert('Error al actualizar: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-12 text-center text-gray-500">Cargando operación...</div>;

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <h1 className="text-2xl font-bold text-[#2D4A3E] mb-6 font-merriweather">Editar Operación #{id}</h1>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 space-y-8">

                {/* SIMPLE EDIT FORM - Allows changing core data */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Fecha Registro</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Categoría (Fija)</label>
                        <input disabled value={category} className="w-full p-2 border rounded bg-gray-100 text-gray-500" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Subcategoría / Actividad</label>
                    <input type="text" value={subcategory} onChange={e => setSubcategory(e.target.value)} className="w-full p-2 border rounded" />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                        Paño(s) Asignado(s)
                        {panoId.length > 1 && <span className="text-blue-600 ml-1">(Multi-paño)</span>}
                    </label>
                    <div className="flex gap-2">
                        {[1, 2, 3].map(n => {
                            const isSelected = panoId.includes(String(n));
                            return (
                                <div
                                    key={n}
                                    className={`flex-1 py-2 px-3 rounded border-2 font-bold text-center ${isSelected
                                        ? 'bg-[#2D4A3E] text-white border-[#2D4A3E]'
                                        : 'bg-gray-100 text-gray-400 border-gray-200'
                                        }`}
                                >
                                    P{n}
                                </div>
                            );
                        })}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                        {panoId.length > 1
                            ? `Este gasto se distribuyó entre ${panoId.length} paños`
                            : 'Operación asignada a un solo paño'}
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Descripción / Detalle</label>
                    <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded" />
                    <p className="text-xs text-gray-400 mt-1">Ej: 1er Riego (Don Enrique)</p>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Cantidad (Días/Fardos)</label>
                        <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="w-full p-2 border rounded font-bold" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Costo Unitario (Ref)</label>
                        <input type="number" value={unitCost} onChange={e => setUnitCost(Number(e.target.value))} className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Total ($)</label>
                        <input type="number" value={totalCost} onChange={e => setTotalCost(Number(e.target.value))} className="w-full p-2 border rounded font-bold text-red-700" />
                        {subcategory === 'Mano de Obra (Tractor)' && (
                            <p className="text-xs text-blue-600 mt-1">💡 Auto-calculado: {quantity} fardos × ${settings.tractor_cost_per_bale} = ${quantity * settings.tractor_cost_per_bale}</p>
                        )}
                    </div>
                </div>

                {/* PAYMENT SECTION (Only for Income/Sales) */}
                {category === 'Venta' && (
                    <div id="payment" className="pt-6 border-t border-gray-100 scroll-mt-20">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            💰 Seguimiento de Pago
                            {(amountPaid >= totalCost && totalCost > 0) ? (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">PAGADO TOTAL</span>
                            ) : (
                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">PENDIENTE: ${(totalCost - amountPaid).toLocaleString()}</span>
                            )}
                        </h3>

                        <div className="grid grid-cols-2 gap-6 bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                            <div>
                                <label className="block text-sm font-bold text-blue-900 mb-1 flex justify-between">
                                    Monto Pagado Hoy
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setAmountPaid(totalCost)}
                                            className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded hover:bg-blue-700 transition-colors"
                                        >
                                            Pagar Total
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setAmountPaid(0)}
                                            className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded hover:bg-gray-300 transition-colors"
                                        >
                                            Limpiar
                                        </button>
                                    </div>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 font-bold">$</span>
                                    <input
                                        type="number"
                                        value={amountPaid}
                                        onChange={e => setAmountPaid(Number(e.target.value))}
                                        className="w-full pl-7 p-3 border-2 border-blue-200 rounded-lg font-bold text-xl text-blue-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-blue-900 mb-1">Fecha Compromiso (Si adeuda)</label>
                                <input
                                    type="date"
                                    value={paymentDueDate}
                                    onChange={e => setPaymentDueDate(e.target.value)}
                                    className="w-full p-3 border-2 border-blue-200 rounded-lg text-blue-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                                />
                                <p className="text-[10px] text-blue-600 mt-1 italic">
                                    * Se enviarán recordatorios automáticos cerca de esta fecha.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-4 pt-6 mt-6 border-t">
                    <button type="button" onClick={() => router.back()} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded">Cancelar</button>
                    <button type="submit" disabled={saving} className="px-6 py-2 bg-[#2D4A3E] text-white font-bold rounded hover:bg-[#3E6052]">
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>

            </form>
        </div>
    );
}
