"use client";

import { useCustomerManager } from '@/features/crm/hooks/useCustomerManager';
import { Users, Plus, Phone, Mail, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function CRMPage() {
    const { customers, loading, isAddModalOpen, setIsAddModalOpen, addCustomer } = useCustomerManager();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');

    const handleQuickAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await addCustomer({ name, phone, email, type: 'particular' });
        if (success) {
            setName('');
            setPhone('');
            setEmail('');
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#2D4A3E] font-merriweather">Gestión de Clientes (CRM)</h1>
                    <p className="text-gray-500">Base de datos de compradores y proveedores.</p>
                </div>
                <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-[#2D4A3E] text-white rounded-xl font-bold shadow-lg hover:bg-[#1f352c]">
                    <Plus size={20} /> Nuevo Cliente
                </button>
            </div>

            {/* Quick Add Modal (Simplification: Inline form if modal open) */}
            {isAddModalOpen && (
                <div className="mb-8 p-6 bg-green-50 rounded-xl border border-green-200 animate-in slide-in-from-top-4">
                    <h3 className="font-bold text-green-900 mb-4">Agregar Nuevo Cliente</h3>
                    <form onSubmit={handleQuickAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input required value={name} onChange={e => setName(e.target.value)} placeholder="Nombre Completo" className="p-3 border rounded-lg" />
                        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Teléfono" className="p-3 border rounded-lg" />
                        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email (Opcional)" className="p-3 border rounded-lg" />
                        <div className="flex gap-2">
                            <button type="submit" className="flex-1 bg-green-700 text-white font-bold rounded-lg hover:bg-green-800">Guardar</button>
                            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 border border-gray-300 rounded-lg hover:bg-white text-gray-600">X</button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                        <tr>
                            <th className="p-4">ID</th>
                            <th className="p-4">Cliente</th>
                            <th className="p-4">Contacto</th>
                            <th className="p-4">Estado</th>
                            <th className="p-4 text-right">Total Comprado</th>
                            <th className="p-4 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {customers.map(c => (
                            <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                    <span className="font-mono text-sm font-bold text-gray-400">
                                        {c.customer_number || '---'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="font-bold text-gray-900">{c.name}</div>
                                    <div className="text-xs text-gray-400 capitalize">{c.type}</div>
                                </td>
                                <td className="p-4 text-sm text-gray-600 space-y-1">
                                    {c.phone && <div className="flex items-center gap-2"><Phone size={14} /> {c.phone}</div>}
                                    {c.email && <div className="flex items-center gap-2"><Mail size={14} /> {c.email}</div>}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs rounded-full font-bold uppercase ${c.data_complete
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-orange-100 text-orange-700'
                                        }`}>
                                        {c.data_complete ? 'Completo' : '⚠️ Incompleto'}
                                    </span>
                                </td>
                                <td className="p-4 text-right font-mono font-bold text-gray-700">
                                    ${(c.total_purchased || 0).toLocaleString()}
                                </td>
                                <td className="p-4 text-center">
                                    <Link href={`/admin/crm/${c.id}`} className="text-gray-400 hover:text-[#2D4A3E] font-medium hover:underline">
                                        Editar
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {customers.length === 0 && !loading && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">No hay clientes registrados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
