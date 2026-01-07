"use client";

<<<<<<< HEAD
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchOrders() {
            setLoading(true);
            const { data, error } = await supabase
                .from('orders')
                .select('*, order_items(*)')
                .order('created_at', { ascending: false });

            if (data) setOrders(data);
            setLoading(false);
        }
        fetchOrders();
    }, []);

    const updateStatus = async (orderId: string, status: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: status })
            .eq('id', orderId);
        
        if (!error) {
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: status } : o));
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <h1 className="text-3xl font-bold text-[#2D4A3E] mb-8">Gestión de Pedidos</h1>
            
            {loading ? (
                <div className="text-center py-12">Cargando pedidos...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b text-sm font-bold text-gray-600">
                                <th className="px-6 py-4">ID / Fecha</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Pago</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-sm">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold">#{order.id.slice(0, 8)}</div>
                                        <div className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {order.guest_info?.email || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 font-bold">
                                        ${order.total_amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                            order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {order.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select 
                                            value={order.status}
                                            onChange={(e) => updateStatus(order.id, e.target.value)}
                                            className="bg-transparent border rounded px-2 py-1"
                                        >
                                            <option value="pending">Pendiente</option>
                                            <option value="processing">Procesando</option>
                                            <option value="shipped">Enviado</option>
                                            <option value="delivered">Entregado</option>
                                            <option value="cancelled">Cancelado</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-blue-600 hover:underline">Ver Detalle</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
=======
import { useOrderManager } from '@/features/orders/hooks/useOrderManager';
import { Package, Truck, CheckCircle, Clock, Search, Eye } from 'lucide-react';
import { useState } from 'react';

const statusColors: any = {
    pending: 'bg-yellow-100 text-yellow-700',
    paid: 'bg-blue-100 text-blue-700',
    processing: 'bg-indigo-100 text-indigo-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700'
};

const statusLabels: any = {
    pending: 'Pendiente',
    paid: 'Pagado',
    processing: 'Procesando',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado'
};

export default function OrdersPage() {
    const { orders, loading, selectedOrder, setSelectedOrder, updateStatus } = useOrderManager();
    const [filter, setFilter] = useState('');

    const filteredOrders = orders.filter(o =>
        (o.customer?.name || 'Cliente').toLowerCase().includes(filter.toLowerCase()) ||
        o.id.includes(filter)
    );

    return (
        <div className="max-w-7xl mx-auto pb-12 flex gap-6 h-[calc(100vh-100px)]">

            {/* LEFT: ORDER LIST */}
            <div className={`flex-1 flex flex-col ${selectedOrder ? 'hidden md:flex' : 'flex'}`}>
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-[#2D4A3E] font-merriweather">Pedidos Web</h1>
                    <p className="text-gray-500">Gestión de envíos y pagos online.</p>
                </div>

                <div className="mb-4 relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        placeholder="Buscar por cliente o ID..."
                        className="w-full pl-10 p-3 border rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-[#2D4A3E]"
                    />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center text-gray-400">Cargando pedidos...</div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredOrders.map(order => (
                                <div
                                    key={order.id}
                                    onClick={() => setSelectedOrder(order)}
                                    className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${selectedOrder?.id === order.id ? 'bg-green-50 border-l-4 border-[#2D4A3E]' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-bold text-gray-800">#{order.id.slice(0, 8)}</div>
                                        <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${statusColors[order.status] || 'bg-gray-100'}`}>
                                            {statusLabels[order.status] || order.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <div>{order.customer?.name || 'Invitado'}</div>
                                        <div className="font-bold">${order.total_amount.toLocaleString()}</div>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-2 flex gap-2">
                                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                                        <span>•</span>
                                        <span>{order.items?.length || 0} ítems</span>
                                    </div>
                                </div>
                            ))}
                            {filteredOrders.length === 0 && !loading && (
                                <div className="p-8 text-center text-gray-500">No hay pedidos registrados.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: DETAIL VIEW */}
            {selectedOrder ? (
                <div className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-right-4">
                    <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Pedido #{selectedOrder.id.slice(0, 8)}</h2>
                            <p className="text-sm text-gray-500">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                        </div>
                        <button onClick={() => setSelectedOrder(null)} className="md:hidden text-gray-500">Volver</button>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto space-y-8">

                        {/* Status Actions */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Cambiar Estado</label>
                            <div className="flex flex-wrap gap-2">
                                {['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => updateStatus(selectedOrder.id, s)}
                                        className={`px-3 py-1 text-xs rounded-lg border font-bold transition-all ${selectedOrder.status === s
                                            ? 'bg-[#2D4A3E] text-white border-[#2D4A3E]'
                                            : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        {statusLabels[s]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Items */}
                        <div>
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Package size={18} /> Productos
                            </h3>
                            <table className="w-full text-sm">
                                <thead className="text-gray-400 bg-gray-50 border-b">
                                    <tr>
                                        <th className="py-2 text-left pl-2">Producto</th>
                                        <th className="py-2 text-center">Cant</th>
                                        <th className="py-2 text-right pr-2">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {selectedOrder.items?.map(item => (
                                        <tr key={item.id}>
                                            <td className="py-3 pl-2 text-gray-800">{item.product_title}</td>
                                            <td className="py-3 text-center text-gray-600">{item.quantity}</td>
                                            <td className="py-3 text-right pr-2 font-bold">${item.total_price.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="border-t">
                                    <tr>
                                        <td colSpan={2} className="py-3 text-right text-gray-500 pr-4">Subtotal</td>
                                        <td className="py-3 text-right font-bold">${selectedOrder.subtotal.toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={2} className="py-1 text-right text-gray-500 pr-4">Envío</td>
                                        <td className="py-1 text-right font-bold">${selectedOrder.shipping_cost.toLocaleString()}</td>
                                    </tr>
                                    <tr className="text-lg">
                                        <td colSpan={2} className="py-4 text-right font-bold text-[#2D4A3E] pr-4">Total</td>
                                        <td className="py-4 text-right font-bold text-[#2D4A3E]">${selectedOrder.total_amount.toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Customer Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                                    <CheckCircle size={18} /> Cliente
                                </h3>
                                <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border">
                                    <p className="font-bold">{selectedOrder.customer?.name || 'Invitado'}</p>
                                    <p>{selectedOrder.customer?.email}</p>
                                    <p className="mt-2 text-xs text-gray-400">ID: {selectedOrder.customer_id || 'N/A'}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                                    <Truck size={18} /> Envío
                                </h3>
                                <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border">
                                    <p className="font-bold capitalize">{selectedOrder.shipping_method || 'Por definir'}</p>
                                    <p>{selectedOrder.shipping_address || 'Sin dirección registrada'}</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            ) : (
                <div className="hidden md:flex flex-1 bg-gray-50 rounded-2xl border border-dashed border-gray-300 items-center justify-center text-gray-400 flex-col gap-4">
                    <Search size={48} className="opacity-20" />
                    <p>Selecciona un pedido para ver detalles</p>
>>>>>>> 4af7fc6 (Fix: Aplicado downgrade de Next.js y React a versiones estables)
                </div>
            )}
        </div>
    );
}
