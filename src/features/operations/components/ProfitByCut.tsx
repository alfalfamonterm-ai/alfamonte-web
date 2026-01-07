import React, { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';

interface CutStats {
    corteId: string;
    income: number;
    expense: number;
    profit: number;
    balesProduced: number;
    profitPerBale: number;
}

interface ProfitByCutProps {
    filters: {
        dateFrom: string;
        dateTo: string;
        categories: string[];
    }
}

export const ProfitByCut = ({ filters }: ProfitByCutProps) => {
    const [cutStats, setCutStats] = useState<CutStats[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            let query = supabase
                .from('operations')
                .select('category, subcategory, quantity, total_cost, corte_id')
                .order('date', { ascending: false });

            if (filters.dateFrom) query = query.gte('date', filters.dateFrom);
            if (filters.dateTo) query = query.lte('date', filters.dateTo);
            if (filters.categories.length > 0) query = query.in('category', filters.categories);

            const { data, error } = await query;

            if (data) {
                const groups: { [key: string]: any } = {};

                data.forEach(op => {
                    const cid = op.corte_id || 'Sin Corte';
                    if (!groups[cid]) {
                        groups[cid] = { income: 0, expense: 0, bales: 0 };
                    }

                    const val = Number(op.total_cost) || 0;
                    if (op.category === 'Venta') {
                        groups[cid].income += val;
                    } else if (op.category === 'Costo Operacional' || (op.category === 'Rendimiento' && op.subcategory === 'Días de Riego')) {
                        groups[cid].expense += val;
                    }

                    if (op.category === 'Rendimiento' && op.subcategory === 'Fardos Cosechados') {
                        groups[cid].bales += (Number(op.quantity) || 0);
                    }
                });

                const stats: CutStats[] = Object.keys(groups)
                    .filter(cid => cid !== 'Sin Corte') // Only show actual cuts for this breakdown
                    .map(cid => {
                        const g = groups[cid];
                        const profit = g.income - g.expense;
                        return {
                            corteId: cid,
                            income: g.income,
                            expense: g.expense,
                            profit: profit,
                            balesProduced: g.bales,
                            profitPerBale: g.bales > 0 ? profit / g.bales : 0
                        };
                    })
                    .sort((a, b) => Number(b.corteId) - Number(a.corteId));

                setCutStats(stats);
            }
            setLoading(false);
        };

        fetchStats();
    }, [filters]);

    if (loading) return null;
    if (cutStats.length === 0) return null;

    return (
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden mb-8">
            <div className="bg-gray-50 p-4 border-b border-gray-200">
                <h3 className="text-sm font-bold text-gray-700 uppercase">Rentabilidad por Corte</h3>
                <p className="text-[10px] text-gray-500 italic">Comparativa de eficiencia entre cosechas</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-gray-50 text-[10px] uppercase text-gray-500 font-bold tracking-wider">
                            <th className="p-4">Corte</th>
                            <th className="p-4">Producción</th>
                            <th className="p-4 text-right">Ingresos</th>
                            <th className="p-4 text-right">Gastos Op.</th>
                            <th className="p-4 text-right">Utilidad</th>
                            <th className="p-4 text-right">Por Fardo</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {cutStats.map(stat => (
                            <tr key={stat.corteId} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-bold">Corte #{stat.corteId}</td>
                                <td className="p-4">{stat.balesProduced} Fardos</td>
                                <td className="p-4 text-right text-blue-600 font-mono">${Math.round(stat.income).toLocaleString()}</td>
                                <td className="p-4 text-right text-red-600 font-mono">-${Math.round(stat.expense).toLocaleString()}</td>
                                <td className={`p-4 text-right font-bold font-mono ${stat.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ${Math.round(stat.profit).toLocaleString()}
                                </td>
                                <td className="p-4 text-right">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${stat.profitPerBale >= 0 ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
                                        ${Math.round(stat.profitPerBale).toLocaleString()}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
