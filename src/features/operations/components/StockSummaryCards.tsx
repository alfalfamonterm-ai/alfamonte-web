import React, { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';

interface StockSummaryProps {
    filters: {
        dateFrom: string;
        dateTo: string;
        categories: string[];
        subcategories: string[];
        panos: string[];
    }
}

export const StockSummaryCards = ({ filters }: StockSummaryProps) => {
    const [stockData, setStockData] = useState<{ [key: string]: { produced: number, sold: number, lost: number, stock: number, profit: number, profitPerBale: number } }>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStock = async () => {
            let query = supabase
                .from('operations')
                .select('category, subcategory, quantity, total_cost, pano_id')
                .order('date', { ascending: false });

            if (filters.dateFrom) query = query.gte('date', filters.dateFrom);
            if (filters.dateTo) query = query.lte('date', filters.dateTo);
            if (filters.categories.length > 0) query = query.in('category', filters.categories);

            const { data, error } = await query.limit(10000);

            if (data) {
                const newStockData: any = {};

                [1, 2, 3].forEach(panoId => {
                    const pid = String(panoId);

                    const produced = data
                        .filter(o => String(o.pano_id).includes(pid) && o.category === 'Rendimiento' && o.subcategory === 'Fardos Cosechados')
                        .reduce((acc, curr) => acc + Number(curr.quantity), 0);

                    const sold = data
                        .filter(o => String(o.pano_id).includes(pid) && o.category === 'Venta' && (o.subcategory === 'Fardos' || !o.subcategory))
                        .reduce((acc, curr) => acc + Number(curr.quantity), 0);

                    const lost = data
                        .filter(o => String(o.pano_id).includes(pid) && o.subcategory === 'Merma / Pérdida')
                        .reduce((acc, curr) => acc + Number(curr.quantity), 0);

                    const income = data
                        .filter(o => String(o.pano_id).includes(pid) && o.category === 'Venta')
                        .reduce((acc, curr) => acc + Number(curr.total_cost || 0), 0);

                    const expense = data
                        .filter(o => String(o.pano_id).includes(pid) && (o.category === 'Costo Operacional' || (o.category === 'Rendimiento' && o.subcategory === 'Días de Riego')))
                        .reduce((acc, curr) => acc + Number(curr.total_cost || 0), 0);

                    const profit = income - expense;
                    const profitPerBale = produced > 0 ? (profit / produced) : 0;

                    newStockData[pid] = {
                        produced,
                        sold,
                        lost,
                        stock: produced - sold - lost,
                        profit,
                        profitPerBale
                    };
                });

                setStockData(newStockData);
            }
            setLoading(false);
        };

        fetchStock();
    }, [filters]);

    if (loading) return <div className="p-4 text-center text-gray-500">Cargando stock...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(panoId => {
                const stats = stockData[String(panoId)] || { produced: 0, sold: 0, lost: 0, stock: 0, profit: 0, profitPerBale: 0 };
                return (
                    <div key={panoId} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Paño {panoId}</p>
                                <p className="text-xl font-bold text-[#2D4A3E]">{stats.stock} Fardos</p>
                            </div>
                            <div className="text-right">
                                <p className={`text-sm font-bold ${stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {stats.profit >= 0 ? '+' : ''}${Math.round(stats.profit).toLocaleString()}
                                </p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Utilidad Op.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                            <div className="text-[10px] text-gray-500">
                                <div>Prod: <span className="text-green-600 font-bold">{stats.produced}</span></div>
                                <div>Vend: <span className="text-blue-600 font-bold">{stats.sold}</span></div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-gray-500 font-bold">PROMEDIO / FARDO</div>
                                <div className={`text-xs font-bold ${stats.profitPerBale >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                    ${Math.round(stats.profitPerBale).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
