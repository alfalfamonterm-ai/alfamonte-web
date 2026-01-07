"use client";

import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';

interface CustomerMetrics {
    email: string;
    name: string;
    totalSpend: number;
    lastOrder: string;
    orderCount: number;
    plan: string; // Derived from logic
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<CustomerMetrics[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        // Fetch all orders to aggregate customer data
        // In a real scalability scenario, we would have a separate 'profiles' table,
        // but for this MVP we derive customers from unique emails in orders.
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching customers:', error);
        } else if (orders) {
            const customerMap = new Map<string, CustomerMetrics>();

            orders.forEach(order => {
                const email = order.customer_email || 'sin-email@anonimo.com';

                if (!customerMap.has(email)) {
                    customerMap.set(email, {
                        email,
                        name: order.customer_name || 'Cliente Web',
                        totalSpend: 0,
                        lastOrder: order.created_at,
                        orderCount: 0,
                        plan: 'Cliente Ocasional'
                    });
                }

                const cust = customerMap.get(email)!;
                cust.totalSpend += Number(order.total);
                cust.orderCount += 1;
                // Since we ordered by desc, the first time we see a customer is their last order
            });

            // Determine "Plan" based on logic
            const aggregated = Array.from(customerMap.values()).map(c => ({
                ...c,
                plan: c.orderCount > 2 ? 'Cliente Frecuente' : 'Nuevo Cliente'
            }));

            setCustomers(aggregated);
        }
        setLoading(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-[#2D4A3E] font-merriweather">Clientes y Suscriptores</h1>
                <button className="bg-[#2D4A3E] text-white px-4 py-2 rounded-lg hover:bg-[#3E6052] transition-colors disabled:opacity-50">
                    Nuevo Cliente
                </button>
            </div>

            {loading ? <p>Cargando cartera de clientes...</p> : (
                <div className="grid gap-6">
                    {customers.map((customer) => (
                        <div key={customer.email} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#F4F1EA] rounded-full flex items-center justify-center text-[#2D4A3E] font-bold text-xl uppercase">
                                    {customer.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#2D4A3E] text-lg">{customer.name}</h3>
                                    <p className="text-gray-500">{customer.email}</p>
                                </div>
                            </div>

                            <div className="flex gap-8 text-center md:text-left">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide">Estatus</p>
                                    <span className={`font-medium px-2 py-1 rounded-full text-xs ${customer.plan === 'Cliente Frecuente' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {customer.plan}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide">Último Pedido</p>
                                    <p className="font-medium text-gray-700">{new Date(customer.lastOrder).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide">Gastado Historico</p>
                                    <p className="font-bold text-[#8B5E3C]">${customer.totalSpend.toLocaleString('es-CL')}</p>
                                </div>
                            </div>

                            <div>
                                <button className="text-[#2D4A3E] font-bold hover:underline">Ver Historial</button>
                            </div>
                        </div>
                    ))}

                    {customers.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500">Aún no hay clientes registrados en el sistema.</p>
                            <p className="text-sm text-gray-400">Los clientes aparecerán automáticamente cuando realicen su primera compra.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
