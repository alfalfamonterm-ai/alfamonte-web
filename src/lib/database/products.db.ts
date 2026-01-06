import supabase from '@/lib/supabase';
import { CreateProductDTO, Product } from '../../features/sales/types';

export const getProducts = async () => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('title');

    if (error) throw new Error(error.message);
    return data as Product[];
};

export const createProduct = async (payload: CreateProductDTO) => {
    const { data, error } = await supabase
        .from('products')
        .insert(payload)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};

export const updateProduct = async (id: string, payload: Partial<Product>) => {
    const { data, error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};

export const deleteProduct = async (id: string) => {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

    if (error) throw new Error(error.message);
    return true;
};
