import supabase from '@/lib/supabase';
import { CreateCustomerDTO, Customer } from '../../features/crm/types';

export const getCustomers = async (limit = 100) => {
    // Fetch from history view to get purchase KPIs and IDs
    const { data, error } = await supabase
        .from('customer_purchase_history')
        .select('*')
        .order('name')
        .limit(limit);

    if (error) throw new Error(error.message);

    // Map view columns to Customer type if needed
    return (data || []).map(d => ({
        ...d,
        id: d.customer_id, // Map customer_id from view to id
        total_purchased: Number(d.total_spent)
    })) as Customer[];
};

export const createCustomer = async (payload: CreateCustomerDTO) => {
    const { data, error } = await supabase
        .from('customers')
        .insert({
            ...payload,
            status: 'active',
            total_purchased: 0
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};

export const updateCustomer = async (id: string, payload: Partial<Customer>) => {
    const { data, error } = await supabase
        .from('customers')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};