import supabase from '@/lib/supabase';

export const getInputs = async () => {
    const { data, error } = await supabase.from('inputs').select('*').order('name');
    if (error) throw new Error(error.message);
    return data;
};

export const updateInputStock = async (id: string, newQuantity: number) => {
    const { error } = await supabase.from('inputs').update({ stock_quantity: newQuantity }).eq('id', id);
    if (error) throw new Error(error.message);
};
