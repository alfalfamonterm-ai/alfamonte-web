import supabase from '@/lib/supabase';

export const getInventoryItems = async () => {
    const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
};

export const createInventoryItem = async (item: any) => {
    const { data, error } = await supabase
        .from('inventory_items')
        .insert(item)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};

export const updateInventoryItem = async (id: string, updates: any) => {
    const { data, error } = await supabase
        .from('inventory_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};

export const deleteInventoryItem = async (id: string) => {
    const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);

    if (error) throw new Error(error.message);
    return true;
};

export const createInventoryMovement = async (movement: any) => {
    const { data, error } = await supabase
        .from('inventory_movements')
        .insert(movement)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};
