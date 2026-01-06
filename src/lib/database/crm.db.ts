import supabase from '@/lib/supabase';

export const getCustomers = async (limit = 100) => {
    const { data, error } = await supabase
        .from('customer_purchase_history')
        .select('*')
        .order('name')
        .limit(limit);

    if (error) throw new Error(error.message);
    return (data || []).map(d => ({
        ...d,
        id: d.customer_id,
        total_purchased: Number(d.total_spent)
    }));
};

export const createCustomer = async (payload: any) => {
    const { data, error } = await supabase
        .from('customers')
        .insert({
            ...payload,
            status: 'active'
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};
