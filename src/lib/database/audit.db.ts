import supabase from '@/lib/supabase';

export interface AuditLog {
    id: string;
    table_name: string;
    record_id: string;
    action: 'INSERT' | 'UPDATE' | 'DELETE';
    old_data: any;
    new_data: any;
    user_id?: string;
    created_at: string;
}

/**
 * Fetch audit logs with pagination and optional filtering by table.
 */
export const getAuditLogs = async (page = 1, pageSize = 50, tableName?: string) => {
    let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

    if (tableName) {
        query = query.eq('table_name', tableName);
    }

    const { data, count, error } = await query;

    if (error) throw new Error(`Error fetching audit logs: ${error.message}`);
    return {
        data: data as AuditLog[],
        totalRows: count || 0
    };
};
