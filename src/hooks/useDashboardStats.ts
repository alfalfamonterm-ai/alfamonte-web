"use client";

import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';

export interface DashboardStats {
    baleStock: number;
    salesMonth: number;
    activeCustomers: number;
    cashFlow: number;
    income: number;
    expense: number;
    dataLoaded: boolean;
    // For charts
    operations: any[];
    lowStockInputs: any[];
}

export const useDashboardStats = () => {
    const [stats, setStats] = useState<DashboardStats>({
        baleStock: 0,
        salesMonth: 0,
        activeCustomers: 0,
        cashFlow: 0,
        income: 0,
        expense: 0,
        dataLoaded: false,
        operations: [],
        lowStockInputs: []
    });

    useEffect(() => {
        const loadStats = async () => {
            try {
                // 1. Fetch Operations (All time for historical charts, but we could limit if needed)
                const { data: cols } = await supabase
                    .from('operations')
                    .select('*')
                    .order('date', { ascending: true });

                const ops = cols || [];

                // 2. Calculate Bale Stock
                let produced = 0;
                let soldBales = 0;
                let soldTotal = 0;

                // 3. Calculate Financials
                let income = 0;
                let expense = 0;

                ops.forEach(o => {
                    const qty = Number(o.quantity) || 0;
                    const amount = Number(o.total_cost) || 0;

                    // STOCK
                    if (o.subcategory === 'Fardos Cosechados') produced += qty;
                    // Fix: Include empty subcategory or 'Fardos' subcategory for sales
                    if (o.category === 'Venta' && (o.subcategory === 'Fardos' || !o.subcategory || o.subcategory === '')) {
                        soldBales += qty;
                    }
                    // Also subtract losses if any
                    if (o.subcategory === 'Merma / Pérdida') produced -= qty;

                    // FINANCIALS
                    if (o.category === 'Venta') {
                        income += amount;
                        soldTotal++; // Count transactions
                    } else if (o.category === 'Costo Operacional') {
                        expense += amount;
                    }
                });

                const { count: customerCount } = await supabase
                    .from('customers')
                    .select('*', { count: 'exact', head: true });

                // 5. Check Input Stock
                const { data: inputs } = await supabase
                    .from('inputs')
                    .select('*');

                const lowStock = (inputs || []).filter(i => Number(i.stock_quantity) < 50);

                setStats({
                    baleStock: produced - soldBales,
                    salesMonth: soldTotal,
                    activeCustomers: customerCount || 0,
                    cashFlow: Math.round(income - expense), // Round to 0 decimals
                    income: Math.round(income),
                    expense: Math.round(expense),
                    dataLoaded: true,
                    operations: ops,
                    lowStockInputs: lowStock
                });

            } catch (error) {
                console.error("Error loading dashboard stats:", error);
            }
        };

        loadStats();
    }, []);

    return stats;
};