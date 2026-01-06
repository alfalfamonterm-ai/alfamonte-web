import { useState, useEffect } from 'react';
import { InventoryItem } from '../types';
import { getInventoryItems } from '@/lib/database/inventory.db';

export const useInventoryList = () => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const data = await getInventoryItems();
            setItems(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    // Derived state for dashboard
    const totalValue = items.reduce((acc, item) => acc + (item.total_value || 0), 0);
    const lowStockItems = items.filter(i => i.quantity_available < 5 && i.item_type === 'material');

    return {
        items,
        loading,
        error,
        refresh: fetchItems,
        stats: {
            totalItems: items.length,
            totalValue,
            lowStockCount: lowStockItems.length
        }
    };
};
