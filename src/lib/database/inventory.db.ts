import supabase from '@/lib/supabase';
import { InventoryItem, InventoryMovement } from '../../features/inventory/types';

/**
 * Fetch all inventory items, ordered by newest first.
 */
export const getInventoryItems = async () => {
    const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw new Error(`Error fetching inventory: ${error.message}`);
    return data as InventoryItem[];
};

/**
 * Create a new inventory item.
 */
export const createInventoryItem = async (item: Partial<InventoryItem>) => {
    const { data, error } = await supabase
        .from('inventory_items')
        .insert(item)
        .select()
        .single();

    if (error) throw new Error(`Error creating item: ${error.message}`);
    return data;
};

/**
 * Update an inventory item.
 */
export const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
    const { data, error } = await supabase
        .from('inventory_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(`Error updating item: ${error.message}`);
    return data;
};

/**
 * Delete an inventory item.
 */
export const deleteInventoryItem = async (id: string) => {
    const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);

    if (error) throw new Error(`Error deleting item: ${error.message}`);
    return true;
};

/**
 * Create a movement (purchase, usage, etc.) and auto-update stock via DB trigger.
 */
export const createInventoryMovement = async (movement: Partial<InventoryMovement>) => {
    // If we have an override on item_id for specific logic
    const { data, error } = await supabase
        .from('inventory_movements')
        .insert(movement)
        .select()
        .single();

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
    return data;
};