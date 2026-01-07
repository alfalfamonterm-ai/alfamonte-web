"use client";

import React, { useEffect, useState, useMemo } from 'react';
import supabase from '@/lib/supabase';
import Link from 'next/link';
import { StockSummaryCards } from '@/features/operations/components/StockSummaryCards';
import { ProfitByCut } from '@/features/operations/components/ProfitByCut';

export default function OperationsPage() {
    const [ops, setOps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalRows, setTotalRows] = useState(0);
    const [pageSize] = useState(50);

    const [rentConfig, setRentConfig] = useState<any>({ yearly_rent_cost: 2000000 });
    const [remoteStats, setRemoteStats] = useState({
        income: 0,
        expense: 0,
        profit: 0,
        rentPaid: 0,
        capitalInvested: 0,
        withdrawals: 0,
        pendingIncome: 0
    });

    // Advanced Filters State
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        dateFrom: '',
        dateTo: '',
        categories: [] as string[],
        subcategories: [] as string[],
        panos: [] as string[],
        showIncome: true,
        showExpense: true
    });

    useEffect(() => {
        fetchOperations();
        fetchSettings();
    }, [page, filters]); // Re-fetch on page or filter change

    const fetchSettings = async () => {
        const { data } = await supabase.from('settings').select('value').eq('key', 'global_config').single();
        if (data) {
            setRentConfig(data.value);
        }
    };

    const fetchOperations = async () => {
        setLoading(true);
        try {
            // 1. Fetch Paginated Data
            let query = supabase
                .from('operations')
                .select('*', { count: 'exact' })
                .order('date', { ascending: false })
                .range((page - 1) * pageSize, page * pageSize - 1);

            // Apply Filters to query
            if (filters.dateFrom) query = query.gte('date', filters.dateFrom);
            if (filters.dateTo) query = query.lte('date', filters.dateTo);
            if (filters.categories.length > 0) query = query.in('category', filters.categories);

            const { data, count, error } = await query;
            if (error) throw error;

            setOps(data || []);
            setTotalRows(count || 0);

            // 2. Fetch Robust Stats (Server Side calculation)
            // 2. Fetch Robust Stats (Server Side calculation) - respecting ALL filters
            let statsQuery = supabase.from('operations').select('category, subcategory, total_cost, quantity, pano_id, items, amount_paid, payment_status, payment_due_date');
            if (filters.dateFrom) statsQuery = statsQuery.gte('date', filters.dateFrom);
            if (filters.dateTo) statsQuery = statsQuery.lte('date', filters.dateTo);
            if (filters.categories.length > 0) statsQuery = statsQuery.in('category', filters.categories);
            if (filters.subcategories.length > 0) statsQuery = statsQuery.in('subcategory', filters.subcategories);

            // Panos Filter (Text Search for partial match "1" in "1,2")
            if (filters.panos.length > 0) {
                // This is tricky in Supabase basic query if pano_id is CSV. 
                // For now, we fetch stats and filter in JS for Panos if strictly needed, or use .or()
                // Given the dataset size, JS filtering on the 'statsData' (which allows 1000+ rows usually) is safer for CSV logic.
            }

            const { data: statsData } = await statsQuery;

            if (statsData) {
                // Filter by Pano in JS (since pano_id is CSV string "1,2")
                const filteredStatsData = statsData.filter(o => {
                    if (filters.panos.length === 0) return true;
                    if (!o.pano_id) return false;
                    const opPanos = o.pano_id.toString().split(',');
                    return opPanos.some((p: string) => filters.panos.includes(p.trim()));
                });

                let inc = 0, exp = 0, rent = 0, cap = 0, wit = 0, pending = 0;
                filteredStatsData.forEach((o: any) => {
                    // Logic for Financials
                    if (filters.showIncome === false && o.category === 'Venta') return;
                    if (filters.showExpense === false && (o.category === 'Costo Operacional' || o.category === 'Rendimiento' || o.category === 'Retiro de Utilidad')) return;

                    const c = Number(o.total_cost) || 0;
                    if (o.category === 'Venta') inc += c;
                    else if (o.category === 'Costo Operacional') {
                        exp += c;
                        if (o.subcategory === 'Arriendo') rent += c;
                        if (o.subcategory === 'Compra de Activos' || o.items?.is_asset_purchase) cap += c;
                    } else if (o.category === 'Retiro de Utilidad') {
                        wit += c;
                    } else if (o.category === 'Rendimiento' && o.subcategory === 'Días de Riego') {
                        exp += c;
                    }

                    // Accounts Receivable Tracking
                    if (o.category === 'Venta' && (o.payment_status === 'pending' || o.payment_status === 'partial')) {
                        const paid = Number(o.amount_paid) || 0;
                        pending += (c - paid);
                    }
                });
                setRemoteStats({
                    income: inc,
                    expense: exp,
                    profit: inc - exp - wit, // Final Net Profit (Bank Balance Flow)
                    rentPaid: rent,
                    capitalInvested: cap,
                    withdrawals: wit,
                    pendingIncome: pending
                });

                // Update Stock Stats (Global, filtered by date if needed, or usually Stock is All Time?)
                // The user wants "Stock Paño 1, 2, 3" -> This is usually "Current Stock", so it should NOT be filtered by date.
                // However, the previous logic used 'ops' (paginated).
                // We will use a separate query for ALL time stock stats, or just use statsData if date filters are empty.
                // If date filters are active, do we show stock *for that period* or *current total*?
                // Usually Stock is Inventory (snapshot). Operations is Flow.
                // The Stock Summary Row implies "Current Status". So we should fetch ALL time ops for stock calc.
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Borrar esta operación? Esto afectará los totales.')) return;
        const { error } = await supabase.from('operations').delete().eq('id', id);
        if (error) {
            alert('Error: ' + error.message);
        } else {
            alert('Operación eliminada.');
            fetchOperations();
        }
    };

    const handleRemind = async (opId: number) => {
        try {
            const res = await fetch('/api/admin/remind-payment', {
                method: 'POST',
                body: JSON.stringify({ operationId: opId })
            });
            const data = await res.json();
            if (data.success) {
                alert('🔔 Recordatorio enviado con éxito al cliente.');
            } else {
                alert('⚠️ Error: ' + (data.error || 'No se pudo enviar el correo'));
            }
        } catch (err) {
            alert('Error de conexión');
        }
    };

    // 1. Filter Operations
    const filteredOps = useMemo(() => {
        return ops.filter(op => {
            if (filters.dateFrom && op.date < filters.dateFrom) return false;
            if (filters.dateTo && op.date > filters.dateTo) return false;
            if (filters.categories.length > 0 && !filters.categories.includes(op.category)) return false;
            if (filters.subcategories.length > 0 && !filters.subcategories.includes(op.subcategory)) return false;
            if (filters.panos.length > 0) {
                const opPanos = op.pano_id ? op.pano_id.toString().split(',') : [];
                const hasMatchingPano = opPanos.some((p: string) => filters.panos.includes(p.trim()));
                if (!hasMatchingPano) return false;
            }
            if (!filters.showIncome && op.category === 'Venta') return false;
            if (!filters.showExpense && (op.category === 'Costo Operacional' || op.category === 'Rendimiento')) return false;
            return true;
        });
    }, [ops, filters]);

    // 2. Reactive Financials (Now using server-calculated robust totals)
    const { stats, rentStats } = useMemo(() => {
        const totalRent = rentConfig?.yearly_rent_cost || 2000000;

        return {
            stats: {
                income: remoteStats.income,
                expense: remoteStats.expense,
                profit: remoteStats.profit,
                operatingProfit: remoteStats.income - remoteStats.expense,
                margin: remoteStats.expense > 0 ? Math.round(((remoteStats.income - remoteStats.expense) / remoteStats.expense) * 100 * 10) / 10 : 0,
                capitalInvested: remoteStats.capitalInvested,
                withdrawals: remoteStats.withdrawals,
                pendingIncome: remoteStats.pendingIncome,
                cashOnHand: remoteStats.income - remoteStats.expense - remoteStats.withdrawals
            },
            rentStats: {
                paid: remoteStats.rentPaid,
                total: totalRent,
                percentage: Math.min((remoteStats.rentPaid / totalRent) * 100, 100)
            }
        };
    }, [remoteStats, rentConfig]);

    // 3. Available Subcategories
    const availableSubcategories = useMemo(() => {
        const subcats = new Set<string>();
        ops.forEach(op => {
            if (op.subcategory) subcats.add(op.subcategory);
        });
        return Array.from(subcats).sort();
    }, [ops]);

    const clearFilters = () => {
        setFilters({
            dateFrom: '',
            dateTo: '',
            categories: [],
            subcategories: [],
            panos: [],
            showIncome: true,
            showExpense: true
        });
    };

    const downloadCSV = () => {
        if (filteredOps.length === 0) {
            alert('No hay datos para exportar con los filtros actuales.');
            return;
        }

        const headers = ['ID', 'Fecha', 'Categoria', 'Subcategoria', 'Descripcion', 'Cantidad', 'Costo Total', 'Paño'];
        const csvRows = [headers.join(',')];

        filteredOps.forEach(op => {
            const row = [
                op.id,
                op.date,
                `"${op.category}"`,
                `"${op.subcategory}"`,
                `"${(op.description || '').replace(/"/g, '""')}"`,
                op.quantity || 0,
                op.total_cost || 0,
                `"${op.pano_id || ''}"`
            ];
            csvRows.push(row.join(','));
        });

        const csvContent = "\uFEFF" + csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `cartola_fundo_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        const parts = dateStr.split('-');
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    };

    return (
        <div className="pb-12">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#2D4A3E] font-merriweather">Cartola de Operaciones</h1>
                    <p className="text-gray-600">Estado de Cuenta y Rendimiento Agrícola</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={downloadCSV}
                        className="bg-white text-[#2D4A3E] border border-[#2D4A3E] px-4 py-3 rounded-lg hover:bg-[#2D4A3E] hover:text-white transition-colors font-bold flex items-center gap-2 shadow-sm"
                        title="Descargar datos filtrados"
                    >
                        <span>📥</span> Exportar CSV
                    </button>
                    <Link
                        href="/admin/operations/new"
                        className="bg-[#2D4A3E] text-white px-6 py-3 rounded-lg hover:bg-[#3E6052] transition-colors font-bold flex items-center gap-2 shadow-lg"
                    >
                        <span className="text-xl">+</span> Nuevo Movimiento
                    </Link>
                </div>
            </div>

            {/* ADVANCED FILTERS PANEL */}
            <div className="mb-6">
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-[#2D4A3E] transition-colors"
                >
                    <span>{showFilters ? '▼' : '▶'}</span>
                    Filtros Avanzados
                    {(filters.dateFrom || filters.dateTo || filters.categories.length > 0 || filters.subcategories.length > 0 || filters.panos.length > 0 || !filters.showIncome || !filters.showExpense) && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-bold">
                            Activos
                        </span>
                    )}
                </button>

                {showFilters && (
                    <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Date Range */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Rango de Fechas</label>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        value={filters.dateFrom}
                                        onChange={e => setFilters({ ...filters, dateFrom: e.target.value })}
                                        className="flex-1 p-2 border rounded text-sm"
                                    />
                                    <input
                                        type="date"
                                        value={filters.dateTo}
                                        onChange={e => setFilters({ ...filters, dateTo: e.target.value })}
                                        className="flex-1 p-2 border rounded text-sm"
                                    />
                                </div>
                            </div>

                            {/* Category Filter */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Categorías</label>
                                <div className="flex gap-2">
                                    {['Rendimiento', 'Venta', 'Costo Operacional'].map(cat => {
                                        const isSelected = filters.categories.includes(cat);
                                        return (
                                            <button
                                                key={cat}
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setFilters({ ...filters, categories: filters.categories.filter(c => c !== cat) });
                                                    } else {
                                                        setFilters({ ...filters, categories: [...filters.categories, cat] });
                                                    }
                                                }}
                                                className={`flex-1 px-2 py-1 text-xs rounded border-2 font-bold transition-all ${isSelected
                                                    ? 'bg-[#2D4A3E] text-white border-[#2D4A3E]'
                                                    : 'bg-white text-gray-600 border-gray-300 hover:border-[#2D4A3E]'
                                                    }`}
                                            >
                                                {cat === 'Rendimiento' ? '🚜' : cat === 'Venta' ? '💰' : '💸'}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Subcategory Filter */}
                            <div className="md:col-span-3">
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
                                    Subcategorías (Tipo de Operación)
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {availableSubcategories.map(subcat => {
                                        const isSelected = filters.subcategories.includes(subcat);
                                        return (
                                            <button
                                                key={subcat}
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setFilters({ ...filters, subcategories: filters.subcategories.filter(s => s !== subcat) });
                                                    } else {
                                                        setFilters({ ...filters, subcategories: [...filters.subcategories, subcat] });
                                                    }
                                                }}
                                                className={`px-3 py-1 text-xs rounded-full border-2 font-bold transition-all ${isSelected
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-600'
                                                    }`}
                                            >
                                                {subcat}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Paño Filter */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Paños</label>
                                <div className="flex gap-2">
                                    {['1', '2', '3'].map(pano => {
                                        const isSelected = filters.panos.includes(pano);
                                        return (
                                            <button
                                                key={pano}
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setFilters({ ...filters, panos: filters.panos.filter(p => p !== pano) });
                                                    } else {
                                                        setFilters({ ...filters, panos: [...filters.panos, pano] });
                                                    }
                                                }}
                                                className={`flex-1 px-2 py-1 text-sm rounded border-2 font-bold transition-all ${isSelected
                                                    ? 'bg-[#2D4A3E] text-white border-[#2D4A3E]'
                                                    : 'bg-white text-gray-600 border-gray-300 hover:border-[#2D4A3E]'
                                                    }`}
                                            >
                                                P{pano}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Income/Expense Toggles */}
                        <div className="flex items-center gap-4 pt-2 border-t">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filters.showIncome}
                                    onChange={e => setFilters({ ...filters, showIncome: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm font-bold text-blue-700">Mostrar Ingresos</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filters.showExpense}
                                    onChange={e => setFilters({ ...filters, showExpense: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm font-bold text-red-700">Mostrar Egresos</span>
                            </label>
                            <button
                                onClick={clearFilters}
                                className="ml-auto px-4 py-2 text-sm font-bold text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                                🗑️ Limpiar Filtros
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* FINANCIAL HEADER */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase font-bold">Ingresos Totales</p>
                    <p className="text-2xl font-bold text-blue-600">+${stats.income.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase font-bold">Gastos Operacionales</p>
                    <p className="text-2xl font-bold text-red-600">-${stats.expense.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <p className="text-xs text-gray-500 uppercase font-bold">Balance Final (Neta)</p>
                        <div className={`text-[10px] font-bold px-2 py-0.5 rounded ${stats.operatingProfit >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {stats.margin}% Margen Op.
                        </div>
                    </div>
                    <p className={`text-3xl font-bold ${stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stats.profit >= 0 ? '+' : ''}${stats.profit.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">Utilidad Operacional: ${stats.operatingProfit.toLocaleString()}</p>
                </div>

                <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden">
                    <p className="text-xs text-indigo-800 uppercase font-bold">Retiros de Utilidad</p>
                    <p className="text-2xl font-bold text-indigo-700">-${stats.withdrawals.toLocaleString()}</p>
                    <div className="mt-2 text-[10px] text-gray-500 italic">
                        No afecta el margen operacional
                    </div>
                </div>

                <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <p className="text-xs text-orange-800 uppercase font-bold">Cuentas por Cobrar</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-800">Deuda Clientes</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-700">${stats.pendingIncome.toLocaleString()}</p>
                    <div className="mt-2 text-[10px] text-gray-500 italic">
                        Ingresos pendientes de pago
                    </div>
                </div>
            </div>

            {/* STOCK SUMMARY ROW */}
            {/* STOCK SUMMARY ROW (Calculated from separate robust state, not just paginated 'ops') */}
            <StockSummaryCards filters={filters} />

            {/* FINANCIAL BREAKDOWN BY CUT */}
            <ProfitByCut filters={filters} />

            {loading ? <p className="text-center py-12 text-gray-500">Cargando cartola...</p> : (
                <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-700 border-b border-gray-200 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="p-4 font-bold w-32">Fecha</th>
                                <th className="p-4 font-bold">Concepto / Detalle</th>
                                <th className="p-4 font-bold">Ubicación</th>
                                <th className="p-4 font-bold text-right text-red-700 bg-red-50/50">Egresos (Gasto)</th>
                                <th className="p-4 font-bold text-right text-blue-700 bg-blue-50/50">Ingresos (Venta)</th>
                                <th className="p-4 font-bold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filteredOps.map((op) => {
                                const isExpense = op.category === 'Costo Operacional';
                                const isIncome = op.category === 'Venta';
                                const startDate = op.items?.startDate || op.date;
                                const endDate = op.items?.endDate || op.date;

                                return (
                                    <tr key={op.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="p-4 align-top text-gray-500">
                                            <div className="font-bold text-gray-800">{formatDate(startDate)}</div>
                                            {startDate !== endDate && (
                                                <div className="text-xs">al {formatDate(endDate)}</div>
                                            )}
                                        </td>
                                        <td className="p-4 align-top">
                                            <div className="flex items-start gap-3">
                                                <span className={`text-xl p-2 rounded-lg ${op.category === 'Rendimiento' ? 'bg-green-100 text-green-700' :
                                                    op.category === 'Venta' ? 'bg-blue-100 text-blue-700' :
                                                        op.category === 'Retiro de Utilidad' ? 'bg-indigo-100 text-indigo-700' :
                                                            'bg-red-100 text-red-700'
                                                    }`}>
                                                    {op.category === 'Rendimiento' ? '🚜' : op.category === 'Venta' ? '💰' : op.category === 'Retiro de Utilidad' ? '🏦' : '💸'}
                                                </span>
                                                <div>
                                                    <div className="font-bold text-gray-900 text-base">
                                                        {isIncome ? (op.performer || op.subcategory || 'Venta') : (op.subcategory || op.category)}
                                                    </div>
                                                    <div className="text-gray-500 mt-1 text-sm">{op.description}</div>
                                                    {isIncome && (
                                                        <div className="text-xs text-blue-600 font-mono font-bold mt-1">
                                                            {op.quantity || '?'} Ui @ ${Math.round(op.unit_cost || (op.quantity > 0 ? op.total_cost / op.quantity : 0)).toLocaleString()} c/u
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 align-top">
                                            {op.pano_id ? (
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold border border-gray-200">
                                                    Paño {op.pano_id}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="p-4 align-top text-right font-mono text-base bg-red-50/10">
                                            {(isExpense || op.category === 'Retiro de Utilidad') ? (
                                                <span className={op.category === 'Retiro de Utilidad' ? 'text-indigo-700 font-bold' : 'text-red-700 font-bold'}>
                                                    -${Math.round(op.total_cost).toLocaleString()}
                                                </span>
                                            ) : <span className="text-gray-300">-</span>}
                                        </td>
                                        <td className="p-4 align-top text-right font-mono text-base bg-blue-50/10 relative">
                                            {isIncome ? (
                                                <div className="flex flex-col items-end">
                                                    <span className="text-blue-700 font-bold">+${Math.round(op.total_cost).toLocaleString()}</span>
                                                    {(op.payment_status === 'pending' || op.payment_status === 'partial') && (
                                                        <div className="flex flex-col items-end mt-1">
                                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${op.payment_status === 'pending' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                                                                {op.payment_status === 'pending' ? 'DEUDA TOTAL' : 'PAGO PARCIAL'}
                                                            </span>
                                                            <span className="text-[9px] text-gray-500 font-bold">Saldo: ${(op.total_cost - op.amount_paid).toLocaleString()}</span>
                                                            {op.payment_due_date && (
                                                                <span className="text-[9px] text-orange-600 italic">Compromiso: {new Date(op.payment_due_date).toLocaleDateString()}</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : <span className="text-gray-300">-</span>}
                                        </td>
                                        <td className="p-4 align-top text-right">
                                            <div className="flex justify-end gap-2">
                                                {isIncome && (op.payment_status === 'pending' || op.payment_status === 'partial') && (
                                                    <Link
                                                        href={`/admin/operations/edit/${op.id}#payment`}
                                                        className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-[10px] font-bold rounded hover:bg-blue-700 transition-colors"
                                                    >
                                                        💰 Registrar Pago
                                                    </Link>
                                                )}
                                                <Link href={`/admin/operations/edit/${op.id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Editar">✏️</Link>
                                                <button onClick={() => handleDelete(op.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Eliminar">🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}


            {/* Pagination Controls */}
            {!loading && totalRows > pageSize && (
                <div className="mt-6 flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <span className="text-sm text-gray-500">
                        Mostrando <b>{(page - 1) * pageSize + 1}</b> - <b>{Math.min(page * pageSize, totalRows)}</b> de <b>{totalRows}</b> movimientos
                    </span>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => { setPage(p => p - 1); window.scrollTo(0, 0); }}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed font-bold transition-colors"
                        >
                            Anterior
                        </button>
                        <div className="flex items-center px-4 font-bold text-[#2D4A3E] bg-gray-50 rounded-lg border">
                            Página {page} de {Math.ceil(totalRows / pageSize)}
                        </div>
                        <button
                            disabled={page >= Math.ceil(totalRows / pageSize)}
                            onClick={() => { setPage(p => p + 1); window.scrollTo(0, 0); }}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed font-bold transition-colors"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
