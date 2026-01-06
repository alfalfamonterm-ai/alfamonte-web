"use client";

import { useDashboardStats } from '@/hooks/useDashboardStats';
import { Package, TrendingUp, Users, DollarSign, Activity, Droplets, Tractor, Fuel, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function AdminDashboard() {
    const {
        baleStock,
        salesMonth,
        activeCustomers,
        cashFlow,
        dataLoaded,
        operations,
        lowStockInputs
    } = useDashboardStats();

    // KPI Cards configuration
    const cards = [
        { title: 'Stock Fardos', value: baleStock.toLocaleString(), icon: <Package size={24} />, color: 'bg-green-100 text-green-700', label: 'Unidades Disponibles' },
        { title: 'Ventas (Mes)', value: salesMonth.toLocaleString(), icon: <TrendingUp size={24} />, color: 'bg-blue-100 text-blue-700', label: 'Transacciones' },
        { title: 'Clientes', value: activeCustomers, icon: <Users size={24} />, color: 'bg-purple-100 text-purple-700', label: 'Registrados' },
        {
            title: 'Flujo Caja',
            value: `$${cashFlow.toLocaleString()}`,
            icon: <DollarSign size={24} />,
            color: cashFlow >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700',
            label: 'Balance Total'
        },
    ];

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <div className="mb-10">
                <h1 className="text-4xl font-bold text-[#2D4A3E] font-merriweather mb-2">Panel de Control General</h1>
                <p className="text-gray-500 text-lg">Resumen de operaciones en tiempo real</p>
            </div>

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {cards.map((card, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className={`p-3 rounded-xl w-fit mb-4 ${card.color}`}>
                            {card.icon}
                        </div>
                        <h3 className="text-gray-500 text-sm font-bold uppercase mb-1">{card.title}</h3>
                        <p className="text-3xl font-bold text-gray-800 tracking-tight">{dataLoaded ? card.value : '...'}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/admin/operations/new" className="bg-[#2D4A3E] text-white p-8 rounded-2xl shadow-lg hover:bg-[#1f352c] transition-all">
                    <Activity className="mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Nueva Operación</h3>
                    <p className="text-white/80 text-sm">Registrar cosecha, riego o gastos.</p>
                </Link>

                <Link href="/admin/orders" className="bg-white border text-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all">
                    <Package className="mb-4 text-[#2D4A3E]" />
                    <h3 className="text-2xl font-bold mb-2">Gestión Pedidos</h3>
                    <p className="text-gray-500 text-sm">Controlar despachos y pagos.</p>
                </Link>

                <Link href="/admin/crm" className="bg-white border text-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all">
                    <Users className="mb-4 text-[#2D4A3E]" />
                    <h3 className="text-2xl font-bold mb-2">CRM Clientes</h3>
                    <p className="text-gray-500 text-sm">Base de datos de compradores.</p>
                </Link>
            </div>
        </div>
    );
}
