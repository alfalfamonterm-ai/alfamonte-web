import { NextResponse } from 'next/server';
import { sendPaymentReminderEmail } from '@/lib/resend';
import supabase from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { operationId } = await req.json();

        // 1. Fetch operation detail with customer info
        const { data: op, error: opError } = await supabase
            .from('operations')
            .select(`
                total_cost,
                amount_paid,
                payment_due_date,
                subcategory,
                customer_id,
                customers (
                    name,
                    email
                )
            `)
            .eq('id', operationId)
            .single();

        if (opError || !op) {
            return NextResponse.json({ error: 'Operación no encontrada' }, { status: 404 });
        }

        const customer = op.customers as any;
        if (!customer?.email) {
            return NextResponse.json({ error: 'El cliente no tiene un email registrado' }, { status: 400 });
        }

        const pendingAmount = op.total_cost - op.amount_paid;

        // 2. Send Email
        await sendPaymentReminderEmail(
            customer.email,
            customer.name,
            pendingAmount,
            op.payment_due_date,
            op.subcategory || 'Venta de Fardos'
        );

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Error in remind-payment API:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
