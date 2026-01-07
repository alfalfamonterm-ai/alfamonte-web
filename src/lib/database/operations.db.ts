import supabase from '@/lib/supabase';
<<<<<<< HEAD

export const createOperations = async (payloads: any[]) => {
=======
import { CreateOperationDTO } from '../../features/operations/types';

/**
 * Inserts one or multiple operations into the database.
 */
export const createOperations = async (payloads: CreateOperationDTO[]) => {
>>>>>>> 4af7fc6 (Fix: Aplicado downgrade de Next.js y React a versiones estables)
    const { data, error } = await supabase
        .from('operations')
        .insert(payloads)
        .select();

<<<<<<< HEAD
    if (error) throw new Error(error.message);
    return data;
};

=======
    if (error) {
        throw new Error(`Error creating operations: ${error.message}`);
    }
    return data;
};

/**
 * Fetches operations with optional filters and pagination.
 */
>>>>>>> 4af7fc6 (Fix: Aplicado downgrade de Next.js y React a versiones estables)
export const getOperations = async (page = 1, pageSize = 50) => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
        .from('operations')
        .select('*', { count: 'exact' })
        .order('date', { ascending: false })
        .range(from, to);

<<<<<<< HEAD
    if (error) throw new Error(error.message);
    return { data, count };
};

export const getOperationsStats = async (filters: any) => {
    let query = supabase.from('operations').select('*');
    if (filters.dateFrom) query = query.gte('date', filters.dateFrom);
    if (filters.dateTo) query = query.lte('date', filters.dateTo);
    
    const { data, error } = await query;
=======
    if (error) {
        throw new Error(`Error fetching operations: ${error.message}`);
    }
    return { data, count };
};

/**
 * Calculates financial totals on the server for filtered operations.
 */
export const getOperationsStats = async (filters: { dateFrom?: string, dateTo?: string, categories?: string[] }) => {
    let query = supabase.from('operations').select('category, subcategory, total_cost, items');

    if (filters.dateFrom) query = query.gte('date', filters.dateFrom);
    if (filters.dateTo) query = query.lte('date', filters.dateTo);
    if (filters.categories && filters.categories.length > 0) query = query.in('category', filters.categories);

    const { data, error } = await query;

>>>>>>> 4af7fc6 (Fix: Aplicado downgrade de Next.js y React a versiones estables)
    if (error) throw new Error(error.message);

    let income = 0;
    let expense = 0;
<<<<<<< HEAD
    data.forEach(op => {
        if (op.category === 'Venta') income += Number(op.total_cost);
        else expense += Number(op.total_cost);
    });

    return { income, expense, profit: income - expense };
=======
    let rentPaid = 0;
    let capitalInvested = 0;

    data.forEach(op => {
        const cost = Number(op.total_cost) || 0;
        if (op.category === 'Venta') {
            income += cost;
        } else if (op.category === 'Costo Operacional') {
            expense += cost;
            if (op.subcategory === 'Arriendo') rentPaid += cost;
            if (op.subcategory === 'Compra de Activos' || op.items?.is_asset_purchase) capitalInvested += cost;
        }
    });

    return { income, expense, rentPaid, capitalInvested, profit: income - expense };
};

/**
 * Fetches specific columns for stock calculation to optimize performance.
 */
export const getOperationsForStock = async (limit = 1000) => {
    const { data, error } = await supabase
        .from('operations')
        .select('category, subcategory, quantity, pano_id')
        .order('date', { ascending: false })
        .limit(limit);

    if (error) {
        throw new Error(`Error fetching stock operations: ${error.message}`);
    }
    return data;
>>>>>>> 4af7fc6 (Fix: Aplicado downgrade de Next.js y React a versiones estables)
};
