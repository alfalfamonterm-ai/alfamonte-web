import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { sendOrderConfirmationEmail, sendLoyaltyPointsEmail, sendWelcomeEmail, sendAccountCreatedEmail, sendMissedPointsEmail } from '@/lib/resend';

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || '',
});

// Admin client for backend updates (bypasses RLS)
const supabaseAdmin = createClient(
    process.env.N_P_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log('--- Webhook Received ---', body);

        const { action, type, data } = body;

        // 1. Handle Subscription Status Changes
        if (type === 'subscription_preapproval' && data?.id) {
            console.log(`Subscription ${data.id} action: ${action}`);
        }

        // 2. Handle Payments
        if (type === 'payment' && (action === 'payment.created' || action === 'created') && data?.id) {
            const payment = (await new Payment(client).get({ id: data.id })) as any;

            if (payment.status === 'approved') {
                const orderId = payment.external_reference;
                const preapproval_id = payment.preapproval_id;

                console.log(`Payment approved! Order/Ref: ${orderId}`);

                let targetOrderId = null;

                // Case A: One-time payment (Cart)
                if (orderId && orderId.startsWith('ORDER-')) {
                    const { data: order } = await supabaseAdmin
                        .from('orders')
                        .select('*')
                        .eq('external_reference', orderId)
                        .single();

                    if (order) {
                        targetOrderId = order.id;
                        await supabaseAdmin
                            .from('orders')
                            .update({
                                payment_status: 'paid',
                                status: 'processing',
                                notes: (order.notes || '') + `\nPayment ID: ${payment.id}`
                            })
                            .eq('id', order.id);
                    }
                }
                // Case B: Recurring payment (Subscription)
                else if (preapproval_id) {
                    const { data: sub } = await supabaseAdmin
                        .from('subscriptions')
                        .select('*, products(*)')
                        .eq('mp_preapproval_id', preapproval_id)
                        .single();

                    if (sub) {
                        const { data: newOrder } = await supabaseAdmin
                            .from('orders')
                            .insert({
                                guest_info: { email: sub.customer_email },
                                total_amount: payment.transaction_amount,
                                subtotal: payment.transaction_amount,
                                status: 'processing',
                                payment_status: 'paid',
                                payment_method: 'mercadopago_subscription',
                                notes: `Recurring Payment for Sub: ${preapproval_id}`,
                                external_reference: `RECURRING-${payment.id}`
                            })
                            .select()
                            .single();

                        if (newOrder) {
                            targetOrderId = newOrder.id;
                            await supabaseAdmin.from('order_items').insert({
                                order_id: newOrder.id,
                                product_id: sub.product_id,
                                quantity: 1,
                                unit_price: payment.transaction_amount,
                                total_price: payment.transaction_amount,
                                product_title: sub.products?.title || 'Suscripción'
                            });
                        }
                    }
                }

                // Shared ERP & Logic
                if (targetOrderId) {
                    const { data: fullOrder } = await supabaseAdmin
                        .from('orders')
                        .select('*, order_items(*)')
                        .eq('id', targetOrderId)
                        .single();

                    if (fullOrder) {
                        // 1. ERP Sync
                        const itemsSummary = fullOrder.order_items?.map((it: any) => `${it.quantity}x ${it.product_title}`).join(', ');
                        await supabaseAdmin.from('operations').insert({
                            category: 'Venta',
                            subcategory: 'Venta Web',
                            description: `Venta Online: ${fullOrder.guest_info?.email} (${itemsSummary})`,
                            total_cost: fullOrder.total_amount,
                            quantity: 1,
                            items: fullOrder.order_items,
                            date: new Date().toISOString().split('T')[0],
                            pano_id: '0'
                        });

                        // 2. CRM & Loyalty
                        if (fullOrder.guest_info?.email) {
                            const { data: existingCust } = await supabaseAdmin.from('customers').select('*').eq('email', fullOrder.guest_info.email).maybeSingle();
                            
                            await supabaseAdmin.from('customers').upsert({
                                email: fullOrder.guest_info.email,
                                name: `${fullOrder.guest_info.firstName || ''} ${fullOrder.guest_info.lastName || ''}`.trim() || fullOrder.guest_info.email,
                                status: 'Activo'
                            }, { onConflict: 'email' });

                            await sendOrderConfirmationEmail(fullOrder.guest_info.email, fullOrder.id, fullOrder.total_amount);
                        }
                    }
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
