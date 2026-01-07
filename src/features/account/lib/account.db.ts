import supabase from '@/lib/supabase';

export const getCustomerProfile = async (email: string) => {
    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('email', email)
        .maybeSingle();

    if (error) throw error;
    return data;
};

export const getCustomerOrders = async (email: string) => {
    const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('guest_info->>email', email)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const getLoyaltyHistory = async (customerId: string) => {
    const { data, error } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
};

export const getCustomerSubscriptions = async (email: string) => {
    const { data, error } = await supabase
        .from('subscriptions')
        .select('*, products(*)')
        .eq('customer_email', email);

    if (error) throw error;
    return data || [];
};
