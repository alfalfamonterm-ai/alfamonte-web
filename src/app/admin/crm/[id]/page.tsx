"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Customer } from '@/features/crm/types';
import supabase from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Save, Trash2, ShoppingBag, Star } from 'lucide-react';
import { updateCustomer } from '@/lib/database/crm.db';

export default function CustomerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<any[]>([]);

    // Form inputs
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        rut: '',
        notes: ''
    });

    useEffect(() => {
        const fetchCustomerData = async () => {
            if (!params.id) return;

            // 1. Get Customer
            const { data: c, error } = await supabase
                .from('customers')
                .select('*')
                .eq('id', params.id)
                .single();

            if (error) {
                console.error("Error fetching customer:", error);
                return;
            }

            setCustomer(c);
            setFormData({
                name: c.name || '',
                email: c.email || '',
                phone: c.phone || '',
                address: c.address || '',
                rut: c.rut || '',
                notes: c.notes || ''
            });

            // 2. Get Orders (Filter by JSONB email)
            const { data: o } = await supabase
                .from('orders')
                .select('*')
                .filter('guest_info->>email', 'eq', c.email)
                .order('created_at', { ascending: false });

            setOrders(o || []);
            setLoading(false);
        };

        fetchCustomerData();
    }, [params.id]);

    const handleSave = async () => {
        if (!customer) return;
        try {
            await updateCustomer(customer.id, formData);
            alert('Cliente actualizado correctamente');
            router.refresh(); // Refresh server state if needed
        } catch (e: any) {
            alert('Error al guardar: ' + e.message);
        }
    };

    if (loading) return <div className="p-12 text-center">Cargando perfil...</div>;
    if (!customer) return <div className="p-12 text-center">Cliente no encontrado</div>;

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <Button variant="outline" onClick={() => router.back()} className="mb-6 flex items-center gap-2">
                <ArrowLeft size={16} /> Volver
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Form */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-[#2D4A3E]">Editar Cliente</h1>
                                <p className="text-sm text-gray-500">ID: {customer.customer_number || customer.id.slice(0, 8)}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${customer.data_complete ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                {customer.data_complete ? 'Completo' : 'Incompleto'}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-600 uppercase">Nombre</label>
                                <input
                                    className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white transition-colors"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-600 uppercase">RUT</label>
                                <input
                                    className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white transition-colors"
                                    value={formData.rut}
                                    onChange={e => setFormData({ ...formData, rut: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-600 uppercase">Email</label>
                                <input
                                    className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white transition-colors"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-600 uppercase">Teléfono</label>
                                <input
                                    className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white transition-colors"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-bold text-gray-600 uppercase">Dirección</label>
                                <textarea
                                    className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white transition-colors"
                                    rows={2}
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-bold text-gray-600 uppercase">Notas Internas</label>
                                <textarea
                                    className="w-full p-3 border rounded-lg bg-yellow-50 focus:bg-white transition-colors border-yellow-200"
                                    rows={3}
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Preferencias del cliente, recordatorios..."
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <Button onClick={handleSave} className="flex items-center gap-2">
                                <Save size={18} /> Guardar Cambios
                            </Button>
                        </div>
                    </div>

                    {/* Order History */}
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="font-bold text-[#2D4A3E] mb-4 flex items-center gap-2">
                            <ShoppingBag size={20} /> Historial de Pedidos
                        </h2>
                        {orders.length === 0 ? (
                            <p className="text-gray-400 italic">No hay pedidos registrados.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase text-left">
                                        <tr>
                                            <th className="p-3">Pedido</th>
                                            <th className="p-3">Fecha</th>
                                            <th className="p-3">Estado</th>
                                            <th className="p-3 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {orders.map(order => (
                                            <tr key={order.id} className="hover:bg-gray-50">
                                                <td className="p-3 font-mono font-bold text-[#2D4A3E]">
                                                    #{order.external_reference || order.id.slice(0, 8)}
                                                </td>
                                                <td className="p-3">
                                                    {new Date(order.created_at).toLocaleDateString('es-CL')}
                                                </td>
                                                <td className="p-3">
                                                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 border text-gray-600 uppercase">
                                                        {order.status || 'Pendiente'}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-right font-bold">
                                                    ${(order.total_amount || 0).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Stats & Points */}
                <div className="space-y-6">
                    <div className="bg-[#2D4A3E] text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Star size={100} />
                        </div>
                        <h3 className="text-sm uppercase tracking-wider opacity-80 mb-2">Puntos Acumulados</h3>
                        <div className="text-5xl font-bold mb-4">{customer.reward_points || 0}</div>
                        <p className="text-xs opacity-70">Equivalente a ${(customer.reward_points || 0) * 10} en descuentos.</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4">Resumen Financiero</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b">
                                <span className="text-gray-500 text-sm">Total Histórico</span>
                                <span className="font-bold text-xl">${(customer.total_spent || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b">
                                <span className="text-gray-500 text-sm">Última Compra</span>
                                <span className="font-medium">
                                    {customer.last_purchase_at
                                        ? new Date(customer.last_purchase_at).toLocaleDateString('es-CL')
                                        : 'Nunca'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
