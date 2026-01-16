import supabase from '@/lib/supabase';
import { CreateCustomerDTO, Customer } from '../../features/crm/types';

export const getCustomers = async (limit = 100) => {
    // Fetch directly from customers table as it is the source of truth
    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw new Error(error.message);

    // Map DB columns to Frontend Type
    return (data || []).map((d: any) => ({
        ...d,
        total_purchased: d.total_spent || 0,
        last_purchase_date: d.last_purchase_at
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