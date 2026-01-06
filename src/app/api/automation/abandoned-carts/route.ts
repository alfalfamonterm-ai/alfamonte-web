import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendAbandonedCartEmail } from '@/lib/resend';

// Admin client to bypass RLS
const supabaseAdmin = createClient(
    process.env.N_P_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
    try {
        // Authenticate (enforce cron secret)
        const authHeader = req.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('Running Abandoned Cart Recovery Job...');

        // 1. Find orders that are 'pending' and older than 2 hours, but less than 24 hours
        // and that haven't received an abandoned cart email yet (we can use the notes field or a new column)
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const { data: abandonedOrders, error } = await supabaseAdmin
            .from('orders')
            .select('*, order_items(*)')
            .eq('status', 'pending')
            .lt('created_at', twoHoursAgo)
            .gt('created_at', twentyFourHoursAgo)
            .not('notes', 'ilike', '%AbandonedEmailSent%');

        if (error) throw error;

        console.log(`Found ${abandonedOrders?.length || 0} abandoned checkouts.`);

        let sentCount = 0;
        if (abandonedOrders) {
            for (const order of abandonedOrders) {
                if (order.guest_info?.email) {
                    await sendAbandonedCartEmail(order.guest_info.email, order.order_items || []);

                    // Mark as sent to avoid duplicates
                    await supabaseAdmin
                        .from('orders')
                        .update({
                            notes: (order.notes || '') + '\n[AbandonedEmailSent]'
                        })
                        .eq('id', order.id);

                    sentCount++;
                }
            }
        }

        return NextResponse.json({
            success: true,
            found: abandonedOrders?.length || 0,
            sent: sentCount
        });

    } catch (error: any) {
        console.error('Abandoned Cart Job Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
