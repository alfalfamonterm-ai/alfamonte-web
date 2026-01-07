import supabase from '@/lib/supabase';
<<<<<<< HEAD

=======
import { InventoryItem, InventoryMovement } from '../../features/inventory/types';

/**
 * Fetch all inventory items, ordered by newest first.
 */
>>>>>>> 4af7fc6 (Fix: Aplicado downgrade de Next.js y React a versiones estables)
export const getInventoryItems = async () => {
    const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('created_at', { ascending: false });

<<<<<<< HEAD
    if (error) throw new Error(error.message);
    return data;
};

export const createInventoryItem = async (item: any) => {
=======
    if (error) throw new Error(`Error fetching inventory: ${error.message}`);
    return data as InventoryItem[];
};

/**
 * Create a new inventory item.
 */
export const createInventoryItem = async (item: Partial<InventoryItem>) => {
>>>>>>> 4af7fc6 (Fix: Aplicado downgrade de Next.js y React a versiones estables)
    const { data, error } = await supabase
        .from('inventory_items')
        .insert(item)
        .select()
        .single();

<<<<<<< HEAD
    if (error) throw new Error(error.message);
    return data;
};

export const updateInventoryItem = async (id: string, updates: any) => {
=======
    if (error) throw new Error(`Error creating item: ${error.message}`);
    return data;
};

/**
 * Update an inventory item.
 */
export const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
>>>>>>> 4af7fc6 (Fix: Aplicado downgrade de Next.js y React a versiones estables)
    const { data, error } = await supabase
        .from('inventory_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

<<<<<<< HEAD
    if (error) throw new Error(error.message);
    return data;
};

=======
    if (error) throw new Error(`Error updating item: ${error.message}`);
    return data;
};

/**
 * Delete an inventory item.
 */
>>>>>>> 4af7fc6 (Fix: Aplicado downgrade de Next.js y React a versiones estables)
export const deleteInventoryItem = async (id: string) => {
    const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);

<<<<<<< HEAD
    if (error) throw new Error(error.message);
    return true;
};

export const createInventoryMovement = async (movement: any) => {
=======
    if (error) throw new Error(`Error deleting item: ${error.message}`);
    return true;
};

/**
 * Create a movement (purchase, usage, etc.) and auto-update stock via DB trigger.
 */
export const createInventoryMovement = async (movement: Partial<InventoryMovement>) => {
    // If we have an override on item_id for specific logic
>>>>>>> 4af7fc6 (Fix: Aplicado downgrade de Next.js y React a versiones estables)
    const { data, error } = await supabase
        .from('inventory_movements')
        .insert(movement)
        .select()
        .single();

<<<<<<< HEAD
    if (error) throw new Error(error.message);
=======
    if (error) throw new Error(`Error creating movement: ${error.message}`);
    return data;
};

/**
 * Fetch movements logic
 */
export const getInventoryMovements = async (limit = 100) => {
    const { data, error } = await supabase
        .from('inventory_movements')
        .select('*, item:inventory_items(name, unit)') // Join to get item name
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw new Error(`Error fetching movements: ${error.message}`);
>>>>>>> 4af7fc6 (Fix: Aplicado downgrade de Next.js y React a versiones estables)
    return data;
};
