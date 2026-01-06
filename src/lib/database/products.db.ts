import supabase from '@/lib/supabase';

export const getProducts = async () => {
    const { data, error } = await supabase.from('products').select('*').order('price');
    if (error) throw new Error(error.message);
    return data;
};

export const getProductBySlug = async (slug: string) => {
    const { data, error } = await supabase.from('products').select('*').eq('slug', slug).single();
    if (error) throw new Error(error.message);
    return data;
};
