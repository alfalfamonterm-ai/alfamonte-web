"use client";

import { useOrderManager } from '@/features/orders/hooks/useOrderManager';
import { Package, Truck, CheckCircle, Clock, Search, Eye } from 'lucide-react';
import { useState } from 'react';

// --- Constantes para Estados ---

// Colores de estado de ENVÍO (status)
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
    paid: 'Pagado (MP)',
    processing: 'Procesando',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado'
};

// Colores de estado de PAGO (payment_status)
const paymentStatusColors: any = {
    pending: 'bg-yellow-100 text-yellow-700',
    paid: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    refunded: 'bg-indigo-100 text-indigo-700',
    processing: 'bg-blue-100 text-blue-700',
};

const paymentStatusLabels: any = {
    pending: 'Pendiente',
    paid: 'Pagado',
    failed: 'Fallido',
    refunded: 'Reembolsado',
    processing: 'Procesando',
};


export default function OrdersPage() {
    const { orders, loading, selectedOrder, setSelectedOrder, updateStatus, updatePaymentStatus } = useOrderManager();
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
                                        <div className="flex gap-2">
                                            <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${paymentStatusColors[order.payment_status] || 'bg-gray-100'}`}>
                                                {paymentStatusLabels[order.payment_status] || order.payment_status}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${statusColors[order.status] || 'bg-gray-100'}`}>
                                                {statusLabels[order.status] || order.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <div>{order.customer?.name || 'Invitado'}</div>
                                        <div className="font-bold">${order.total_amount.toLocaleString('es-CL')}</div>
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

                        {/* Status Actions (Envío) */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Cambiar Estado de Envío</label>
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

                        {/* Status Actions (Pago) - NUEVA SECCIÓN */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Cambiar Estado de Pago</label>
                            <div className="flex flex-wrap gap-2">
                                {['pending', 'paid', 'failed', 'refunded', 'processing'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => updatePaymentStatus(selectedOrder.id, s)} 
                                        className={`px-3 py-1 text-xs rounded-lg border font-bold transition-all ${selectedOrder.payment_status === s
                                            ? 'bg-[#2D4A3E] text-white border-[#2D4A3E]'
                                            : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        {paymentStatusLabels[s]}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        {/* Summary & Customer Data */}
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-sm font-bold text-gray-800 mb-2">Resumen del Pedido</h3>
                                <div className="space-y-1 text-sm text-gray-600">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span className="font-medium">${selectedOrder.total_amount.toLocaleString('es-CL')}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-dashed mt-2 pt-2">
                                        <span className="font-bold text-base">Total:</span>
                                        <span className="font-bold text-base text-[#2D4A3E]">${selectedOrder.total_amount.toLocaleString('es-CL')}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-sm font-bold text-gray-800 mb-2">Datos del Cliente</h3>
                                <div className="text-sm space-y-1 text-gray-600">
                                    <p className="font-medium">{selectedOrder.customer?.name || 'Invitado'}</p>
                                    <p>{selectedOrder.customer?.email || 'N/A'}</p>
                                    <p>{selectedOrder.customer?.phone || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-800 mb-2">Dirección de Envío</h3>
                            <div className="text-sm text-gray-600">
                                <p>{selectedOrder.shipping_address?.address || 'Sin dirección registrada.'}</p>
                                <p>{selectedOrder.shipping_address?.city || 'N/A'}, {selectedOrder.shipping_address?.region || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Items List */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-800 mb-2">Detalle de Productos ({selectedOrder.items?.length || 0})</h3>
                            <div className="border rounded-lg divide-y bg-white">
                                {(selectedOrder.items || []).map((item: any, index: number) => (
                                    <div key={index} className="flex justify-between p-3 text-sm">
                                        <span className="text-gray-700">{item.product_name}</span>
                                        <span className="font-medium text-gray-500">{item.quantity} x ${item.price.toLocaleString('es-CL')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>


                    </div>
                </div>
            ) : (
                <div className="hidden md:flex flex-1 items-center justify-center text-gray-400 border border-dashed rounded-xl h-full bg-white">
                    <div className="text-center">
                        <Eye size={36} className="mx-auto mb-2" />
                        <p>Selecciona un pedido para ver los detalles.</p>
                    </div>
                </div>
            )}
        </div>
    );
}