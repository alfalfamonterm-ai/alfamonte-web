import supabase from '@/lib/supabase';

export const createOperations = async (payloads: any[]) => {
    const { data, error } = await supabase
        .from('operations')
        .insert(payloads)
        .select();

    if (error) throw new Error(error.message);
    return data;
};

export const getOperations = async (page = 1, pageSize = 50) => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
        .from('operations')
        .select('*', { count: 'exact' })
        .order('date', { ascending: false })
        .range(from, to);

    if (error) throw new Error(error.message);
    return { data, count };
};

export const getOperationsStats = async (filters: any) => {
    let query = supabase.from('operations').select('*');
    if (filters.dateFrom) query = query.gte('date', filters.dateFrom);
    if (filters.dateTo) query = query.lte('date', filters.dateTo);
    
    const { data, error } = await query;
    if (error) throw new Error(error.message);

    let income = 0;
    let expense = 0;
    data.forEach(op => {
        if (op.category === 'Venta') income += Number(op.total_cost);
        else expense += Number(op.total_cost);
    });

    return { income, expense, profit: income - expense };
};
