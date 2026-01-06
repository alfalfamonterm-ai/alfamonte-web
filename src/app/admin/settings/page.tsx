"use client";

import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Config State
    const [config, setConfig] = useState({
        tractor_cost_per_bale: 650,
        irrigation_cost_per_day: 25000,
        standard_bale_price: 5000,
        fuel_suggested_price: 1200,
        yearly_rent_cost: 2000000
    });

    const [alerts, setAlerts] = useState<any[]>([]);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        const { data: globalData } = await supabase.from('settings').select('value').eq('key', 'global_config').single();
        console.log('📥 Settings loaded from DB:', globalData);
        if (globalData) {
            setConfig(globalData.value);
            console.log('✅ Config state updated to:', globalData.value);
        }

        const { data: alertsData } = await supabase.from('settings').select('value').eq('key', 'alerts_config').single();
        if (alertsData) setAlerts(alertsData.value);

        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        console.log('💾 Attempting to save config:', config);
        try {
            const { data, error } = await supabase
                .from('settings')
                .upsert({ key: 'global_config', value: config }, { onConflict: 'key' })
                .select();

            console.log('📤 Upsert result:', { data, error });

            if (error) throw error;

            await supabase.from('settings').upsert({ key: 'alerts_config', value: alerts }, { onConflict: 'key' });
            alert('✅ Configuración guardada correctamente.');
        } catch (err: any) {
            console.error('❌ Error saving:', err);
            alert('Error al guardar: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const addAlert = () => {
        const newId = Math.max(...alerts.map(a => a.id), 0) + 1;
        setAlerts([...alerts, { id: newId, trigger: 'Fardos Cosechados', days_after: 0, message: '' }]);
    };

    const removeAlert = (id: number) => {
        setAlerts(alerts.filter(a => a.id !== id));
    };

    const updateAlert = (id: number, field: string, val: any) => {
        setAlerts(alerts.map(a => a.id === id ? { ...a, [field]: val } : a));
    };

    if (loading) return <div className="p-12 text-center">Cargando configuración...</div>;

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <h1 className="text-3xl font-bold text-[#2D4A3E] mb-2 font-merriweather">Configuración del Sistema</h1>
            <p className="text-gray-600 mb-8">Administra costos automáticos y alertas inteligentes.</p>

            <form onSubmit={handleSave} className="space-y-8">

                {/* 1. COSTOS OPERATIVOS */}
                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        💰 Variables Económicas (Costos Auto)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Costo Tractorista (por Fardo)</label>
                            <input
                                type="number"
                                value={config.tractor_cost_per_bale}
                                onChange={e => setConfig({ ...config, tractor_cost_per_bale: Number(e.target.value) })}
                                className="w-full p-3 border rounded text-lg font-mono text-red-700 bg-red-50"
                            />
                            <p className="text-xs text-gray-400 mt-1">Se aplicará automáticamente al registrar Cosecha.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Costo Riego Don Enrique (por Día)</label>
                            <input
                                type="number"
                                value={config.irrigation_cost_per_day}
                                onChange={e => setConfig({ ...config, irrigation_cost_per_day: Number(e.target.value) })}
                                className="w-full p-3 border rounded text-lg font-mono text-blue-700 bg-blue-50"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Costo Arriendo Anual (Meta)</label>
                            <input
                                type="number"
                                value={config.yearly_rent_cost || 2000000}
                                onChange={e => setConfig({ ...config, yearly_rent_cost: Number(e.target.value) })}
                                className="w-full p-3 border rounded text-lg font-mono text-orange-700 bg-orange-50"
                            />
                            <p className="text-xs text-gray-400 mt-1">Monto total a pagar por el arriendo anual del terreno.</p>
                        </div>
                    </div>
                </section>

                {/* 2. ALERTAS INTELIGENTES */}
                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            🔔 Alertas Programadas
                        </h2>
                        <button type="button" onClick={addAlert} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded font-bold">
                            + Nueva Alerta
                        </button>
                    </div>
                    <div className="space-y-4">
                        {alerts.map((alert, idx) => (
                            <div key={alert.id} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Evento Disparador</label>
                                    <select
                                        value={alert.trigger}
                                        onChange={e => updateAlert(alert.id, 'trigger', e.target.value)}
                                        className="w-full p-2 border rounded bg-white"
                                    >
                                        <option value="Fardos Cosechados">🚜 Cosecha Realizada (Corte)</option>
                                        <option value="Días de Riego">💧 Fin de Riego</option>
                                    </select>
                                </div>
                                <div className="w-24">
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Días Después</label>
                                    <input
                                        type="number"
                                        value={alert.days_after}
                                        onChange={e => updateAlert(alert.id, 'days_after', Number(e.target.value))}
                                        className="w-full p-2 border rounded text-center bg-white"
                                    />
                                </div>
                                <div className="flex-[2]">
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Mensaje de Alerta</label>
                                    <input
                                        type="text"
                                        value={alert.message}
                                        onChange={e => updateAlert(alert.id, 'message', e.target.value)}
                                        className="w-full p-2 border rounded bg-white"
                                        placeholder="Ej: Llamar al tractorista"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeAlert(alert.id)}
                                    className="mt-6 text-red-400 hover:text-red-700 font-bold px-2"
                                    title="Borrar Alerta"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                        {alerts.length === 0 && <p className="text-gray-400 italic text-sm text-center">No hay alertas configuradas.</p>}
                    </div>
                </section>

                <button type="submit" disabled={saving} className="w-full py-4 bg-[#2D4A3E] text-white font-bold text-xl rounded-xl shadow-lg hover:bg-[#3E6052] transition-colors">
                    {saving ? 'Guardando...' : 'Guardar Configuración'}
                </button>
            </form>
        </div>
    );
}
