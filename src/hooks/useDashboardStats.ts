"use client";

import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';

export function useDashboardStats() {
    const [stats, setStats] = useState({
        baleStock: 0,
        salesMonth: 120, // Manual mock for now or fetch from DB
        activeCustomers: 45,
        cashFlow: 1250000,
        dataLoaded: false,
        operations: [] as any[],
        lowStockInputs: [] as any[]
    });

    useEffect(() => {
        async function loadStats() {
            try {
                // 1. Get Bale Stock (InventoryItem id for Bales)
                const { data: items } = await supabase.from('inventory_items').select('quantity_available').eq('name', 'Fardos Alfalfa 20-25kg').single();
                
                // 2. Get Operations for charts
                const { data: ops } = await supabase.from('operations').select('*').order('date', { ascending: false }).limit(50);
                
                // 3. Get Low Stock Inputs
                const { data: inputs } = await supabase.from('inputs').select('*').lt('stock_quantity', 10);

                setStats(prev => ({
                    ...prev,
                    baleStock: items?.quantity_available || 0,
                    operations: ops || [],
                    lowStockInputs: inputs || [],
                    dataLoaded: true
                }));
            } catch (error) {
                console.error('Error loading dashboard stats:', error);
                setStats(prev => ({ ...prev, dataLoaded: true }));
            }
        }
        loadStats();
    }, []);

    return stats;
}
