import React from 'react';
import { useInventoryForm } from '../hooks/useInventoryForm';
import { Save, Truck, Wrench, Package, Tag } from 'lucide-react';

export const AddItemForm = () => {
    const form = useInventoryForm();

    return (
        <form onSubmit={form.handleSubmit} className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 space-y-8 animate-in fade-in slide-in-from-bottom-4">

            {/* Header / Type Selection */}
            <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded cursor-pointer transition-all ${form.itemType === 'material' ? 'bg-blue-100 text-blue-700 font-bold border-2 border-blue-200' : 'hover:bg-gray-200'}`}>
                    <input type="radio" value="material" checked={form.itemType === 'material'} onChange={() => form.setItemType('material')} className="hidden" />
                    <Package size={20} /> Material
                </label>
                <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded cursor-pointer transition-all ${form.itemType === 'tool' ? 'bg-orange-100 text-orange-700 font-bold border-2 border-orange-200' : 'hover:bg-gray-200'}`}>
                    <input type="radio" value="tool" checked={form.itemType === 'tool'} onChange={() => form.setItemType('tool')} className="hidden" />
                    <Wrench size={20} /> Herramienta
                </label>
                <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded cursor-pointer transition-all ${form.itemType === 'equipment' ? 'bg-purple-100 text-purple-700 font-bold border-2 border-purple-200' : 'hover:bg-gray-200'}`}>
                    <input type="radio" value="equipment" checked={form.itemType === 'equipment'} onChange={() => form.setItemType('equipment')} className="hidden" />
                    <Truck size={20} /> Maquinaria
                </label>
            </div>

            {/* Core Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre del Ítem</label>
                    <input required value={form.name} onChange={e => form.setName(e.target.value)} type="text" className="w-full p-3 border rounded-lg font-bold text-gray-800 focus:ring-2 focus:ring-[#2D4A3E] outline-none" placeholder="ej. Manga Riego 3 Pulgadas" />
                </div>
                <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Código Identificador</label>
                    <div className="relative">
                        <Tag className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input value={form.itemCode} onChange={e => form.setItemCode(e.target.value)} type="text" className="w-full pl-10 p-3 border rounded-lg font-mono text-sm" placeholder="(Opcional) Generación Auto" />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoría</label>
                    <input required value={form.category} onChange={e => form.setCategory(e.target.value)} list="categories" className="w-full p-2 border rounded" placeholder="Seleccionar..." />
                    <datalist id="categories">
                        <option value="Tuberías" />
                        <option value="Fertilizantes" />
                        <option value="Herramientas Manuales" />
                        <option value="Repuestos" />
                    </datalist>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Proveedor</label>
                    <input value={form.supplier} onChange={e => form.setSupplier(e.target.value)} type="text" className="w-full p-2 border rounded" placeholder="Lugar de compra" />
                </div>
            </div>

            {/* Quantity & Cost */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-xs font-bold text-blue-800 uppercase mb-1">Cantidad</label>
                    <div className="flex">
                        <input required type="number" min="0.01" step="0.01" value={form.quantity} onChange={e => form.setQuantity(Number(e.target.value))} className="w-2/3 p-3 border rounded-l font-bold text-xl text-center" />
                        <select value={form.unit} onChange={e => form.setUnit(e.target.value)} className="w-1/3 p-3 border-y border-r rounded-r bg-gray-50">
                            <option value="unidades">Unid.</option>
                            <option value="metros">Mts.</option>
                            <option value="litros">Lts.</option>
                            <option value="kg">Kg.</option>
                            <option value="rollos">Rollos</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-blue-800 uppercase mb-1">Costo Unitario</label>
                    <input required type="number" min="0" value={form.unitCost} onChange={e => form.setUnitCost(Number(e.target.value))} className="w-full p-3 border rounded font-mono" placeholder="$" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-blue-800 uppercase mb-1">Inversión Total</label>
                    <div className="w-full p-3 bg-white border border-blue-200 rounded font-mono font-bold text-blue-800 text-right">
                        ${(form.quantity * form.unitCost).toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Extra Fields (Maintenance) */}
            {form.itemType === 'equipment' && (
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 flex items-center gap-4">
                    <Wrench className="text-purple-600" />
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-purple-900 mb-1">Intervalo de Mantención (Días)</label>
                        <input type="number" value={form.maintenanceInterval} onChange={e => form.setMaintenanceInterval(Number(e.target.value))} className="w-full p-2 border rounded" placeholder="ej. 90 días" />
                    </div>
                    <div className="text-xs text-purple-700 max-w-[200px]">
                        El sistema generará alertas automáticas cada X días para revisar este equipo.
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="pt-6 border-t flex justify-end">
                <button type="submit" disabled={form.loading} className="flex items-center gap-3 px-8 py-4 bg-[#2D4A3E] text-white font-bold rounded-xl shadow-lg hover:bg-[#3E6052] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {form.loading ? 'Registrando...' : (
                        <>
                            <Save size={20} />
                            Registrar Compra
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};
