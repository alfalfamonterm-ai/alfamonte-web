import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InventoryItemType } from '../types';
import { createInventoryItem, createInventoryMovement } from '@/lib/database/inventory.db';
import { createOperations } from '@/lib/database/operations.db';
import { CreateOperationDTO } from '@/features/operations/types';

export const useInventoryForm = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [itemCode, setItemCode] = useState('');
    const [itemType, setItemType] = useState<InventoryItemType>('material');
    const [category, setCategory] = useState(''); // e.g., 'tuberías'
    const [quantity, setQuantity] = useState<number>(1);
    const [unit, setUnit] = useState('unidades');
    const [unitCost, setUnitCost] = useState<number>(0);
    const [supplier, setSupplier] = useState('');
    const [description, setDescription] = useState('');

    // For Equipment ONLY
    const [maintenanceInterval, setMaintenanceInterval] = useState<number>(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const totalCost = quantity * unitCost;
            const dateStr = new Date().toISOString().split('T')[0];

            // 1. Create Inventory Item
            // Note: In a real app check if item exists first to update stock instead of creating new.
            // For now, we assume "New Item" flow.
            const newItem = await createInventoryItem({
                item_code: itemCode || `ITEM-${Date.now()}`, // Fallback generation
                name,
                item_type: itemType,
                category,
                unit,
                quantity_total: quantity,
                quantity_available: quantity,
                unit_cost: unitCost,
                purchase_date: dateStr,
                supplier,
                description,
                maintenance_interval_days: itemType === 'equipment' ? maintenanceInterval : undefined
            });

            if (!newItem) throw new Error("Failed to create inventory item");

            // 2. Record Initial Purchase Movement
            await createInventoryMovement({
                item_id: newItem.id,
                movement_type: 'purchase',
                quantity: quantity,
                unit_cost: unitCost,
                total_cost: totalCost,
                reason: 'Compra Inicial',
                notes: `Proveedor: ${supplier}`
            });

            // 3. Dual-Entry: Create Financial Expense (Operations Table)
            const expensePayload: CreateOperationDTO = {
                date: dateStr,
                category: 'Costo Operacional',
                subcategory: itemType === 'equipment' ? 'Maquinaria' : 'Insumos',
                description: `Compra: ${name} (${quantity} ${unit})`,
                quantity: quantity,
                unit_cost: unitCost,
                total_cost: totalCost,
                pano_id: '1', // Default to global/P1 for now, or make user select
                corte_id: '1', // Default
                performer: 'Admin',
                items: {
                    inventory_item_id: newItem.id // Link reference
                }
            };

            await createOperations([expensePayload]);

            alert('✅ Ítem e Inversión registrados correctamente.');
            router.push('/admin/inventory');
            router.refresh();

        } catch (err: any) {
            console.error(err);
            alert('❌ Error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        name, setName,
        itemCode, setItemCode,
        itemType, setItemType,
        category, setCategory,
        quantity, setQuantity,
        unit, setUnit,
        unitCost, setUnitCost,
        supplier, setSupplier,
        description, setDescription,
        maintenanceInterval, setMaintenanceInterval,
        handleSubmit
    };
};
