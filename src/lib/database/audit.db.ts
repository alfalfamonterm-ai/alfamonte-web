import supabase from '@/lib/supabase';

export const logAuditAction = async (action: string, table: string, recordId: string, details: any) => {
    const { error } = await supabase.from('audit_logs').insert({
        action,
        table_name: table,
        record_id: recordId,
        details,
        user_id: (await supabase.auth.getUser()).data.user?.id
    });
    if (error) console.error("Audit log failed:", error);
};

export const getAuditLogs = async (limit = 100) => {
    const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw new Error(error.message);
    return data;
};
