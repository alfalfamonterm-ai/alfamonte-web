"use client";

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import supabase from '@/lib/supabase';

// Colors based on Premium Nature theme
const COLORS = ['#2D4A3E', '#8B5E3C', '#009EE3', '#FFBB28', '#FF8042', '#9C27B0'];

export default function AnalyticsDashboard() {
    const [data, setData] = useState<any[]>([]);
    const [alerts, setAlerts] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [kpis, setKpis] = useState({
        produccionTotal: 0,
        ingresosTotales: 0,
        costosTotales: 0,
        utilidadNeta: 0, // Ingresos - Costos
        costoUnitarioPromedio: 0, // Costo Total / Producción Total
        activePanos: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const { data: ops } = await supabase.from('operations').select('*').order('date', { ascending: true });
        const { data: settings } = await supabase.from('settings').select('value').eq('key', 'alerts_config').single();

        if (ops) {
            setData(ops);
            calculateKPIs(ops);
            generateAlerts(ops, settings?.value || []);
        }
        setLoading(false);
    };

    const calculateKPIs = (ops: any[]) => {
        // ... (existing KPI logic kept distinct)
        // 1. Producción (Fardos) -> Category = 'Rendimiento'
        const rendimientoOps = ops.filter(o => o.category === 'Rendimiento');
        const produccionTotal = rendimientoOps.reduce((sum, o) => sum + Number(o.quantity || 0), 0);

        // 2. Ingresos (Ventas) -> Category = 'Venta'
        // Stored in 'total_cost' column for now (as value)
        const ventasOps = ops.filter(o => o.category === 'Venta');
        const ingresosTotales = ventasOps.reduce((sum, o) => sum + Number(o.total_cost || 0), 0);

        // 3. Costos -> Category = 'Costo Operacional'
        const costosOps = ops.filter(o => o.category === 'Costo Operacional');
        const costosTotales = costosOps.reduce((sum, o) => sum + Number(o.total_cost || 0), 0);

        // 4. Utilidad
        const utilidadNeta = ingresosTotales - costosTotales;

        // 5. Costo Unitario Promedio (Global)
        const costoUnitarioPromedio = produccionTotal > 0 ? Math.round(costosTotales / produccionTotal) : 0;

        const uniquePanos = new Set(ops.map(o => o.pano_id));

        setKpis({
            produccionTotal,
            ingresosTotales,
            costosTotales,
            utilidadNeta,
            costoUnitarioPromedio,
            activePanos: uniquePanos.size
        });
    };

    const generateAlerts = (ops: any[], alertConfigs: any[]) => {
        const newAlerts: string[] = [];
        const today = new Date();

        // 1. System Alerts (Financial)
        if (kpis.utilidadNeta < 0 && ops.length > 5) {
            newAlerts.push(`📉 Alerta Financiera: Estás operando en pérdida global.`);
        }

        // 2. User Configured Alerts
        alertConfigs.forEach(conf => {
            // Find latest event of this trigger
            // e.g. Trigger "Fardos Cosechados" -> Find last operation with subcategory "Fardos Cosechados"
            const relevantOps = ops.filter(o => o.subcategory === conf.trigger || o.category === conf.trigger); // Robust check
            if (relevantOps.length > 0) {
                const lastOp = relevantOps[relevantOps.length - 1]; // Because ops are ordered by date
                const lastDate = new Date(lastOp.date);

                // Add Days
                const targetDate = new Date(lastDate);
                targetDate.setDate(targetDate.getDate() + Number(conf.days_after));

                // Check difference in days from today
                const diffTime = targetDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                // Logic: Show alert if we are close (e.g. within 3 days) or overdue
                if (diffDays <= 3 && diffDays >= -7) {
                    const status = diffDays < 0 ? `hace ${Math.abs(diffDays)} días` : diffDays === 0 ? 'HOY' : `en ${diffDays} días`;
                    newAlerts.push(`🔔 ${conf.message} (Vence ${status})`);
                }
            }
        });

        setAlerts(newAlerts);
    };

    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Cargando Tablero de Control Inteligente...</div>;

    // --- CHART DATA PREPARATION ---
    // ... (Charts Logic Kept)
    // 1. Costo Unitario por Paño (The "Star KPI")
    const panoStats = new Map();
    data.forEach(o => {
        const pid = o.pano_id;
        if (!panoStats.has(pid)) panoStats.set(pid, { id: pid, cost: 0, prod: 0 });
        const stat = panoStats.get(pid);

        if (o.category === 'Costo Operacional') stat.cost += Number(o.total_cost);
        if (o.category === 'Rendimiento') stat.prod += Number(o.quantity);
    });

    const unitCostData = Array.from(panoStats.values())
        .map((s: any) => ({
            name: `Paño ${s.id}`,
            unitCost: s.prod > 0 ? Math.round(s.cost / s.prod) : 0,
            efficiency: s.prod > 0 ? (s.cost / s.prod) : 99999 // For sorting
        }))
        .sort((a, b) => a.efficiency - b.efficiency); // Lowest cost first (Most Efficient)


    // 2. Cost Composition (Pie Chart) -> Only check category 'Costo Operacional'
    const costCompositionData = data
        .filter(o => o.category === 'Costo Operacional')
        .reduce((acc: any[], curr) => {
            const cat = curr.subcategory || 'Otros';
            const existing = acc.find(x => x.name === cat);
            if (existing) existing.value += Number(curr.total_cost);
            else acc.push({ name: cat, value: Number(curr.total_cost) });
            return acc;
        }, [])
        .sort((a: any, b: any) => b.value - a.value);

    // 3. Ingreso vs Costo vs Utilidad (Line Chart)
    const timelineDataMap = new Map();
    data.forEach(o => {
        const d = o.date;
        if (!timelineDataMap.has(d)) timelineDataMap.set(d, { date: d, ingresos: 0, costos: 0 });
        const entry = timelineDataMap.get(d);

        if (o.category === 'Venta') entry.ingresos += Number(o.total_cost);
        if (o.category === 'Costo Operacional') entry.costos += Number(o.total_cost);
    });
    const timelineData = Array.from(timelineDataMap.values()).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());


    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* ALERTS SECTION */}
            {alerts.length > 0 && (
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded shadow-sm">
                    <h3 className="text-orange-800 font-bold mb-2 flex items-center gap-2">⚠️ Alertas Activas</h3>
                    <ul className="space-y-1">
                        {alerts.map((alert, i) => (
                            <li key={i} className="text-sm text-orange-900 font-medium">• {alert}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* KPI Cards Row (Updated Layout) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <span className="text-gray-500 text-sm font-bold uppercase tracking-wider">Utilidad Neta</span>
                    <span className={`text-3xl font-bold font-mono ${kpis.utilidadNeta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${kpis.utilidadNeta.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-400 mt-2">Ingresos - Costos</span>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <span className="text-gray-500 text-sm font-bold uppercase tracking-wider">Costo Unitario Prom.</span>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-[#8B5E3C]">${kpis.costoUnitarioPromedio.toLocaleString()}</span>
                        <span className="text-sm font-bold text-gray-400 mb-1">/ fardo</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <span className="text-gray-500 text-sm font-bold uppercase tracking-wider">Rendimiento Total</span>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-[#2D4A3E]">{kpis.produccionTotal}</span>
                        <span className="text-sm font-bold text-gray-400 mb-1">fardos</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <span className="text-gray-500 text-sm font-bold uppercase tracking-wider">Ingresos Totales</span>
                    <span className="text-3xl font-bold text-[#009EE3]">${kpis.ingresosTotales.toLocaleString()}</span>
                </div>
            </div>

            {/* Main Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* 1. Efficiency Chart (Unit Cost per Pano) - Takes 2 cols */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
                    <h3 className="font-bold text-[#2D4A3E] mb-4 text-lg">💰 Eficiencia: Costo Unitario por Paño (Menor es Mejor)</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={unitCostData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" fontSize={12} tickLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} unit="$" />
                            <Tooltip
                                cursor={{ fill: '#F4F1EA' }}
                                formatter={(value: number) => [`$${value}`, 'Costo/Fardo']}
                            />
                            <Bar dataKey="unitCost" fill="#8B5E3C" radius={[4, 4, 0, 0]} barSize={40}>
                                {
                                    unitCostData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#4CAF50' : '#8B5E3C'} />
                                    ))
                                }
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-gray-400 text-center mt-[-10px]">* La barra verde indica el paño más eficiente.</p>
                </div>

                {/* 2. Cost Composition - Takes 1 col */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
                    <h3 className="font-bold text-[#2D4A3E] mb-4 text-lg">Composición del Gasto</h3>
                    <ResponsiveContainer width="100%" height="70%">
                        <PieChart>
                            <Pie
                                data={costCompositionData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {costCompositionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2 h-24 overflow-y-auto">
                        {costCompositionData.map((entry, index) => (
                            <div key={index} className="flex justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                    <span>{entry.name}</span>
                                </div>
                                <span className="font-bold">${entry.value.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Financial Trend Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
                <h3 className="font-bold text-[#2D4A3E] mb-4 text-lg">Flujo de Caja: Ingresos vs Costos</h3>
                <ResponsiveContainer width="100%" height="85%">
                    <AreaChart data={timelineData}>
                        <defs>
                            <linearGradient id="colorIng" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#009EE3" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#009EE3" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorGasto" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#FF0000" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#FF0000" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" fontSize={12} tickFormatter={(str) => new Date(str).toLocaleDateString()} />
                        <YAxis fontSize={12} />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="ingresos" name="Ingresos ($)" stroke="#009EE3" fill="url(#colorIng)" strokeWidth={2} />
                        <Area type="monotone" dataKey="costos" name="Costos ($)" stroke="#FF0000" fill="url(#colorGasto)" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

        </div>
    );
}
