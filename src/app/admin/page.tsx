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

    // --- DATA TRANSFORMATION FOR CHARTS ---

    // 1. Irrigation Analysis (Riego) - Cost & Duration over time
    const irrigationData = operations
        .filter(op => op.subcategory.includes('Riego') && Number(op.total_cost) > 0) // Filter out $0 duplicates
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(op => ({
            date: new Date(op.date).toLocaleDateString('es-CL'),
            costo: Number(op.total_cost),
            dias: Number(op.quantity) || 1,
            pano: `Paño ${op.pano_id}`
        }));

    // 2. Production Flow (Fardos Cosechados) - Multi-line by Paño
    const productionByPano: Record<string, any[]> = {};

    operations
        .filter(op => op.subcategory === 'Fardos Cosechados')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .forEach(op => {
            const panoKey = `pano${op.pano_id}`;
            const dateKey = new Date(op.date).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' });

            if (!productionByPano[panoKey]) {
                productionByPano[panoKey] = [];
            }

            productionByPano[panoKey].push({
                date: dateKey,
                fardos: Number(op.quantity),
                pano: op.pano_id
            });
        });

    // Merge all dates and create multi-line dataset
    const allDates = new Set<string>();
    Object.values(productionByPano).forEach(panoData => {
        panoData.forEach(entry => allDates.add(entry.date));
    });

    const productionData = Array.from(allDates).sort().map(date => {
        const dataPoint: any = { date };
        Object.keys(productionByPano).forEach(panoKey => {
            const entry = productionByPano[panoKey].find(e => e.date === date);
            dataPoint[panoKey] = entry ? entry.fardos : 0;
        });
        return dataPoint;
    });

    // 3. Operational Costs Breakdown (Subcategories)
    const costBreakdown: Record<string, number> = {};
    operations
        .filter(op => op.category === 'Costo Operacional')
        .forEach(op => {
            const current = costBreakdown[op.subcategory] || 0;
            costBreakdown[op.subcategory] = current + Number(op.total_cost);
        });

    const costPieData = Object.entries(costBreakdown)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Top 5 costs

    // 4. Fuel Trends (Combustible)
    const fuelData = operations
        .filter(op => op.subcategory === 'Combustible' || op.subcategory.includes('Diesel') || op.subcategory.includes('Bencina'))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(op => ({
            date: new Date(op.date).toLocaleDateString('es-CL'),
            costo: Number(op.total_cost)
        }));

    // 5. Pano Efficiency (Cost per Pano)
    const panoCosts: Record<string, number> = {};
    const panoProd: Record<string, number> = {};

    operations.forEach(op => {
        if (!op.pano_id) return;
        const panos = op.pano_id.split(',').map((p: string) => p.trim());
        const costPerPano = Number(op.total_cost) / panos.length;
        const qtyPerPano = Number(op.quantity) / panos.length;

        panos.forEach((p: string) => {
            if (op.category === 'Costo Operacional') {
                panoCosts[p] = (panoCosts[p] || 0) + costPerPano;
            }
            if (op.subcategory === 'Fardos Cosechados') {
                panoProd[p] = (panoProd[p] || 0) + qtyPerPano;
            }
        });
    });

    const panoEfficiencyData = Object.keys(panoCosts).map(pano => ({
        name: `Paño ${pano}`,
        gasto: Math.round(panoCosts[pano]),
        produccion: Math.round(panoProd[pano] || 0),
        costoUnitario: panoProd[pano] ? Math.round(panoCosts[pano] / panoProd[pano]) : 0
    })).sort((a, b) => Number(a.name.replace('Paño ', '')) - Number(b.name.replace('Paño ', '')));


    // --- COLORS ---
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];


    // KPI Cards configuration
    const cards = [
        { title: 'Stock Fardos', value: baleStock.toLocaleString(), icon: <Package size={24} />, color: 'bg-green-100 text-green-700', label: 'Unidades Disponibles' },
        { title: 'Ventas (Histórico)', value: salesMonth.toLocaleString(), icon: <TrendingUp size={24} />, color: 'bg-blue-100 text-blue-700', label: 'Transacciones Totales' },
        { title: 'Cartera Clientes', value: activeCustomers, icon: <Users size={24} />, color: 'bg-purple-100 text-purple-700', label: 'Clientes Registrados' },
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

            {/* HER0 SECTION */}
            <div className="mb-10 text-center md:text-left">
                <h1 className="text-4xl font-bold text-[#2D4A3E] font-merriweather mb-2">Panel de Control General</h1>
                <p className="text-gray-500 text-lg">Resumen de operaciones en tiempo real - Fundo Santa Inés</p>
                {!dataLoaded && <span className="text-xs font-bold text-orange-500 animate-pulse">Sincronizando con ERP...</span>}
            </div>

            {/* LOW STOCK ALERTS */}
            {lowStockInputs.length > 0 && (
                <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm animate-bounce-subtle">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <Activity className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-bold text-red-800 uppercase">⚠️ Alerta de Stock Bajo</h3>
                            <div className="mt-1 text-sm text-red-700">
                                Los siguientes insumos están por agotarse:
                                <b> {lowStockInputs.map(i => `${i.name} (${i.stock_quantity} ${i.unit})`).join(', ')}</b>.
                                <Link href="/admin/inventory/inputs" className="ml-2 underline font-bold">Reponer ahora</Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {cards.map((card, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${card.color}`}>
                                {card.icon}
                            </div>
                            <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">TR</span>
                        </div>
                        <h3 className="text-gray-500 text-sm font-bold uppercase mb-1">{card.title}</h3>
                        <p className="text-3xl font-bold text-gray-800 tracking-tight">{dataLoaded ? card.value : '...'}</p>
                        <p className="text-xs text-gray-400 mt-2">{card.label}</p>
                    </div>
                ))}
            </div>

            {dataLoaded && (
                <div className="space-y-8 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* ROW 1: RIEGO & PRODUCTION */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Irrigation Chart */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Droplets size={20} /></div>
                                <h3 className="font-bold text-gray-800">Análisis de Riego (Costo vs Días)</h3>
                            </div>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={irrigationData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" fontSize={10} />
                                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" fontSize={10} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar yAxisId="left" dataKey="costo" name="Costo Riego ($)" fill="#8884d8" radius={[4, 4, 0, 0]} />
                                        <Bar yAxisId="right" dataKey="dias" name="Días Duración" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Production Chart */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-green-50 rounded-lg text-green-600"><Tractor size={20} /></div>
                                <h3 className="font-bold text-gray-800">Flujo de Producción por Paño (Fardos)</h3>
                            </div>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={productionData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                        <YAxis fontSize={10} />
                                        <Tooltip />
                                        <Legend />
                                        {Object.keys(productionByPano).map((panoKey, idx) => (
                                            <Line
                                                key={panoKey}
                                                type="monotone"
                                                dataKey={panoKey}
                                                name={`Paño ${panoKey.replace('pano', '')}`}
                                                stroke={['#82ca9d', '#8884d8', '#ffc658'][idx % 3]}
                                                strokeWidth={2}
                                                dot={{ r: 4 }}
                                                activeDot={{ r: 6 }}
                                            />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* ROW 2: COSTS & EFFICIENCY */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cost Breakdown */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-1">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-red-50 rounded-lg text-red-600"><DollarSign size={20} /></div>
                                <h3 className="font-bold text-gray-800">Distribución de Costos</h3>
                            </div>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={costPieData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {costPieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                                        <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '10px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Pano Efficiency */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><BarChart3 size={20} /></div>
                                <h3 className="font-bold text-gray-800">Eficiencia por Paño (Gasto vs Costo Unitario)</h3>
                            </div>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={panoEfficiencyData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" fontSize={10} tickFormatter={(val) => `$${val / 1000}k`} />
                                        <YAxis yAxisId="right" orientation="right" stroke="#ff7300" fontSize={10} tickFormatter={(val) => `$${val}`} />
                                        <Tooltip formatter={(value, name) => [typeof value === 'number' ? `$${value.toLocaleString()}` : value, name === 'costoUnitario' ? 'Costo/Unidad' : 'Gasto Total']} />
                                        <Legend />
                                        <Bar yAxisId="left" dataKey="gasto" name="Gasto Total ($)" fill="#8884d8" radius={[4, 4, 0, 0]} barSize={20} />
                                        <Line yAxisId="right" type="monotone" dataKey="costoUnitario" name="Costo Promedio / Fardo" stroke="#ff7300" strokeWidth={3} dot={{ r: 4 }} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* ROW 3: FUEL TRENDS */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 bg-orange-50 rounded-lg text-orange-600"><Fuel size={20} /></div>
                            <h3 className="font-bold text-gray-800">Gasto en Combustible (Tiempo)</h3>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={fuelData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                    <YAxis fontSize={10} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="costo" stroke="#ffc658" strokeWidth={2} name="Costo Carga" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}


            {/* QUICK ACTIONS GRID */}
            <h2 className="text-xl font-bold text-[#2D4A3E] mb-6 flex items-center gap-2">
                <Activity size={20} /> Accesos Directos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Operations Card */}
                <Link href="/admin/operations/new" className="group relative overflow-hidden rounded-2xl bg-[#2D4A3E] text-white p-8 shadow-lg hover:bg-[#1f352c] transition-all">
                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold mb-2">Nueva Operación</h3>
                        <p className="text-white/80">Registrar cosecha, riego o gastos.</p>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-4 translate-x-4 group-hover:scale-110 transition-transform">
                        <Activity size={120} />
                    </div>
                </Link>

                {/* Inventory Card */}
                <Link href="/admin/inventory" className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-8 shadow-sm hover:border-[#2D4A3E] hover:shadow-md transition-all">
                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Inventario</h3>
                        <p className="text-gray-500">Gestionar stock de insumos y maquinaria.</p>
                    </div>
                    <div className="absolute right-0 bottom-0 text-gray-200 transform translate-y-4 translate-x-4">
                        <Package size={100} />
                    </div>
                </Link>

                {/* CRM Card */}
                <Link href="/admin/crm" className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-8 shadow-sm hover:border-[#2D4A3E] hover:shadow-md transition-all">
                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Clientes (CRM)</h3>
                        <p className="text-gray-500">Base de datos de compradores.</p>
                    </div>
                    <div className="absolute right-0 bottom-0 text-gray-200 transform translate-y-4 translate-x-4">
                        <Users size={100} />
                    </div>
                </Link>

            </div>
        </div>
    );
}
