"use client";

import React, { useEffect, useState } from 'react';
import { getInventoryItems, createInventoryItem, createInventoryMovement, deleteInventoryItem, updateInventoryItem } from '@/lib/database/inventory.db';
import { InventoryItem } from '@/features/inventory/types';
import Link from 'next/link';

export default function InputsPage() {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);

    // Edit Mode State
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

    // New Item State
    const [newItem, setNewItem] = useState({
        name: '',
        category: 'Combustibles',
        subcategory: 'General',
        unit: 'Lt',
        quantity_total: 0,
        unit_cost: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const allItems = await getInventoryItems();
            // Filter only 'material' or conceptually 'insumos' for this specific view if desired.
            // Or just show all 'materials'.
            const insumos = allItems.filter(i => i.item_type === 'material');
            setItems(insumos);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createInventoryItem({
                ...newItem,
                item_type: 'material',
                status: 'active',
                quantity_available: newItem.quantity_total, // Initial avail = total
                item_code: `INS-${Date.now()}` // Auto-generate simple code
            });
            setShowAddForm(false);
            setNewItem({ name: '', category: 'Combustibles', subcategory: 'General', unit: 'Lt', quantity_total: 0, unit_cost: 0 });
            fetchData();
        } catch (error: any) {
            alert('Error al crear insumo: ' + error.message);
        }
    };

    const handleRestock = async (id: string) => {
        const amount = prompt('Cantidad a agregar al inventario (Compra/Ingreso):');
        if (!amount || isNaN(Number(amount))) return;

        try {
            await createInventoryMovement({
                item_id: id,
                movement_type: 'purchase',
                quantity: Number(amount),
                reason: 'Repuición Manual desde Panel de Insumos',
                performed_by: 'Administrador'
            });
            fetchData();
        } catch (error: any) {
            alert('Error al actualizar stock: ' + error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este insumo? Si tiene historial de uso, podría fallar.')) return;
        try {
            await deleteInventoryItem(id);
            fetchData();
        } catch (error: any) {
            alert('No se pudo eliminar: ' + error.message);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;

        try {
            await updateInventoryItem(editingItem.id, {
                name: editingItem.name,
                category: editingItem.category,
                unit: editingItem.unit,
                unit_cost: editingItem.unit_cost
            });
            setEditingItem(null);
            fetchData();
        } catch (error: any) {
            alert('Error al actualizar: ' + error.message);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#2D4A3E]">Control de Insumos</h1>
                    <p className="text-gray-500 mt-1">Gestión Unificada de Inventario (Combustibles, Semillas, Fertilizantes)</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="bg-[#2D4A3E] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#1a2e26] transition-all shadow-md"
                    >
                        {showAddForm ? 'Cancelar' : '+ Nuevo Insumo'}
                    </button>
                    <Link href="/admin/inventory" className="text-sm font-semibold text-gray-500 hover:text-[#2D4A3E] flex items-center">
                        ← Ver Inventario Completo
                    </Link>
                </div>
            </header>

            {/* CREATE FORM */}
            {showAddForm && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 animate-in fade-in slide-in-from-top-4">
                    <h2 className="text-lg font-bold mb-4 text-[#2D4A3E]">Registrar Nuevo Insumo</h2>
                    <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <input
                            className="p-3 border rounded-xl"
                            placeholder="Nombre (ej: Urea, Diesel)"
                            value={newItem.name}
                            onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                            required
                        />
                        <select
                            className="p-3 border rounded-xl"
                            value={newItem.category}
                            onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                        >
                            <option value="Combustibles">Combustibles</option>
                            <option value="Fertilizantes">Fertilizantes</option>
                            <option value="Semillas">Semillas</option>
                            <option value="Químicos">Químicos</option>
                            <option value="Otros">Otros</option>
                        </select>
                        <input
                            className="p-3 border rounded-xl"
                            placeholder="Unidad (ej: Kg, Lt)"
                            value={newItem.unit}
                            onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
                            required
                        />
                        <input
                            type="number"
                            className="p-3 border rounded-xl"
                            placeholder="Stock Inicial"
                            value={newItem.quantity_total || ''}
                            onChange={e => setNewItem({ ...newItem, quantity_total: Number(e.target.value) })}
                        />
                        <button type="submit" className="bg-[#2D4A3E] text-white rounded-xl font-bold">Guardar</button>
                    </form>
                </div>
            )}

            {/* EDIT MODAL/FORM (Inline) */}
            {editingItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg">
                        <h2 className="text-lg font-bold mb-4">Editar Insumo</h2>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700">Nombre</label>
                                <input className="w-full p-2 border rounded" value={editingItem.name} onChange={e => setEditingItem({ ...editingItem, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Categoría</label>
                                    <select className="w-full p-2 border rounded" value={editingItem.category} onChange={e => setEditingItem({ ...editingItem, category: e.target.value })}>
                                        <option value="Combustibles">Combustibles</option>
                                        <option value="Fertilizantes">Fertilizantes</option>
                                        <option value="Semillas">Semillas</option>
                                        <option value="Químicos">Químicos</option>
                                        <option value="Otros">Otros</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Unidad</label>
                                    <input className="w-full p-2 border rounded" value={editingItem.unit} onChange={e => setEditingItem({ ...editingItem, unit: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setEditingItem(null)} className="px-4 py-2 text-gray-600 font-bold">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-[#2D4A3E] text-white rounded font-bold">Guardar Cambios</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {loading ? (
                    <div className="md:col-span-3 text-center py-12 text-gray-400">Cargando insumos...</div>
                ) : items.length === 0 ? (
                    <div className="md:col-span-3 text-center py-12 text-gray-400">
                        No hay insumos registrados.
                    </div>
                ) : items.map(item => (
                    <div key={item.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group">
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditingItem(item)} className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100" title="Editar">✏️</button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100" title="Eliminar">🗑️</button>
                        </div>

                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                    {item.category}
                                </span>
                                <h3 className="text-xl font-bold text-[#2D4A3E] mt-1">{item.name}</h3>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${item.quantity_available < 10 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                {item.quantity_available < 10 ? 'Bajo Stock' : 'OK'}
                            </div>
                        </div>

                        <div className="flex items-end gap-2 mb-6">
                            <span className="text-4xl font-black text-[#2D4A3E]">{item.quantity_available}</span>
                            <span className="text-gray-500 font-bold mb-1 uppercase text-sm">{item.unit}</span>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleRestock(item.id)}
                                className="flex-1 bg-gray-50 text-[#2D4A3E] border border-gray-200 py-3 rounded-2xl font-bold hover:bg-gray-100 transition-colors"
                            >
                                ⛽ Reponer Stock
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
