import supabase from '@/lib/supabase';

export interface InputItem {
    id: string;
    name: string;
    category: string;
    stock_quantity: number;
    unit: string;
    avg_unit_cost: number;
    created_at: string;
    updated_at: string;
}

export interface InputUsage {
    id: string;
    input_id: string;
    operation_id?: string;
    quantity_used: number;
    date: string;
    performed_by?: string;
    notes?: string;
}

/**
 * Fetch all input items.
 */
export const getInputs = async () => {
    const { data, error } = await supabase
        .from('inputs')
        .select('*')
        .order('name', { ascending: true });

    if (error) throw new Error(`Error fetching inputs: ${error.message}`);
    return data as InputItem[];
};

/**
 * Update stock of an input item.
 */
export const updateInputStock = async (id: string, newQuantity: number) => {
    const { data, error } = await supabase
        .from('inputs')
        .update({ stock_quantity: newQuantity, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(`Error updating input stock: ${error.message}`);
    return data as InputItem;
};

/**
 * Use an input (creates a usage record and deducts stock).
 */
export const useInput = async (usage: Partial<InputUsage>) => {
    if (!usage.input_id || !usage.quantity_used) throw new Error('Missing input_id or quantity_used');

    // 1. Get current stock
    const { data: input, error: fetchError } = await supabase
        .from('inputs')
        .select('stock_quantity')
        .eq('id', usage.input_id)
        .single();

    if (fetchError || !input) throw new Error('Input not found');

    // 2. Insert usage record
    const { data, error: usageError } = await supabase
        .from('input_usage')
        .insert(usage)
        .select()
        .single();

    if (usageError) throw new Error(`Error recording usage: ${usageError.message}`);

    // 3. Deduct stock
    const newStock = Number(input.stock_quantity) - Number(usage.quantity_used);
    await updateInputStock(usage.input_id, newStock);

    return data;
};

/**
 * Add new input master item.
 */
export const createInputItem = async (item: Partial<InputItem>) => {
    const { data, error } = await supabase
        .from('inputs')
        .insert(item)
        .select()
        .single();

    if (error) throw new Error(`Error creating input item: ${error.message}`);
    return data as InputItem;
};