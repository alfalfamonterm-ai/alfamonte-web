import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import {
    sendOrderConfirmationEmail,
    sendLoyaltyPointsEmail,
    sendWelcomeEmail,
    sendAccountCreatedEmail,
    sendMissedPointsEmail
} from '@/lib/resend';

export const dynamic = 'force-dynamic';

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || '',
});

// Admin client for backend updates (bypasses RLS)
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
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
            // Logic for preapproval status changes (authorized, paused, cancelled)
            // can be added here to update the 'subscriptions' table.
        }

        // 2. Handle Payments
        if (type === 'payment' && (action === 'payment.created' || action === 'created') && data?.id) {
            const payment = (await new Payment(client).get({ id: data.id })) as any;

            if (payment.status === 'approved') {
                const orderId = payment.external_reference;
                const preapproval_id = payment.preapproval_id;

                console.log(`Payment approved! Order/Ref: ${orderId}, Preference: ${payment.preference_id}`);

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
                    console.log(`Recurring payment for subscription ${preapproval_id}`);

                    // 1. Find the parent subscription to get customer/product data
                    const { data: sub } = await supabaseAdmin
                        .from('subscriptions')
                        .select('*, products(*)')
                        .eq('mp_preapproval_id', preapproval_id)
                        .single();

                    if (sub) {
                        // 2. Create a new order for this recurring payment
                        const { data: newOrder } = await supabaseAdmin
                            .from('orders')
                            .insert({
                                // Use guest_info for consistency, but only include key data
                                guest_info: { email: sub.customer_email },
                                total_amount: payment.transaction_amount,
                                subtotal: payment.transaction_amount,
                                status: 'processing',
                                payment_status: 'paid',
                                payment_method: 'mercadopago_subscription',
                                notes: `Recurring Payment for Sub: ${preapproval_id}. Payment ID: ${payment.id}`,
                                external_reference: `RECURRING-${payment.id}`
                            })
                            .select()
                            .single();

                        if (newOrder) {
                            targetOrderId = newOrder.id;
                            // Add order item
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

                // --- SHARED ERP, CRM & LOYALTY LOGIC ---
                if (targetOrderId) {
                    // 1. Fetch full order for descriptive ledger entry and processing
                    const { data: fullOrder } = await supabaseAdmin
                        .from('orders')
                        .select('*, order_items(*), guest_info')
                        .eq('id', targetOrderId)
                        .single();

                    if (fullOrder) {
                        // 2. Create Operation (Sales Ledger/ERP Sync)
                        const itemsSummary = fullOrder.order_items
                            ?.map((it: any) => `${it.quantity}x ${it.product_title || 'Producto'}`)
                            .join(', ');

                        const { error: opError } = await supabaseAdmin.from('operations').insert({
                            category: 'Venta',
                            subcategory: 'Venta Web',
                            description: `Venta Online: ${fullOrder.guest_info?.email || 'Suscripción'} (${itemsSummary})`,
                            total_cost: fullOrder.total_amount,
                            quantity: 1,
                            items: fullOrder.order_items,
                            date: new Date().toISOString().split('T')[0],
                            pano_id: '0' // convention for non-field specific sales
                        });

                        if (opError) console.error('ERP Operation Sync Error:', opError);

                        // 3. Deduct Stock (Using a Supabase function for atomicity)
                        const { error: stockError } = await supabaseAdmin.rpc('deduct_order_stock', {
                            target_order_id: fullOrder.id
                        });

                        if (stockError) console.error('Stock Deduction Error:', stockError);

                        // 4. Update CRM (Ensure customer exists and update metadata)
                        if (fullOrder.guest_info?.email) {
                            const customerName = fullOrder.guest_info.firstName && fullOrder.guest_info.lastName
                                ? `${fullOrder.guest_info.firstName} ${fullOrder.guest_info.lastName}`
                                : fullOrder.guest_info.email;

                            // Check if customer exists first to apply loyalty logic
                            const { data: existingCust } = await supabaseAdmin
                                .from('customers')
                                .select('id, points_locked, missed_points, purchase_count')
                                .eq('email', fullOrder.guest_info.email)
                                .maybeSingle();

                            const { error: crmError } = await supabaseAdmin.from('customers').upsert({
                                email: fullOrder.guest_info.email,
                                name: customerName,
                                phone: fullOrder.guest_info.phone,
                                status: 'Activo'
                            }, { onConflict: 'email' });

                            if (crmError) console.error('CRM Sync Error:', crmError);

                            // 4.5 Send Welcome Email / Create Auth User if new customer
                            const pointsThisPurchase = Math.floor(fullOrder.total_amount / 1000);

                            if (!existingCust) {
                                // Attempt to create Supabase Auth User automatically
                                const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';

                                const { data: newUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
                                    email: fullOrder.guest_info.email,
                                    password: tempPassword,
                                    email_confirm: true,
                                    user_metadata: { is_auto_created: true }
                                });

                                if (!authError && newUser) {
                                    // Set point expiration and unlock status for FIRST purchase
                                    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
                                    await supabaseAdmin.from('customers').update({
                                        points_expires_at: expiresAt,
                                        points_locked: false // Unlocked for the first purchase
                                    }).eq('email', fullOrder.guest_info.email);

                                    // Send Account Creation email with temporary password
                                    await sendAccountCreatedEmail(fullOrder.guest_info.email, tempPassword, pointsThisPurchase);
                                } else {
                                    console.error('Auth Creation Error:', authError);
                                    // Fallback to simple welcome email if auth fails
                                    await sendWelcomeEmail(fullOrder.guest_info.email, customerName);
                                }
                            }

                            // 5. Loyalty Points Allocation / FOMO Campaign

                            // Only allocate points if:
                            // a) It's the first purchase (!existingCust) 
                            // b) OR the account is already UNLOCKED (points_locked === false).
                            if (!existingCust || (existingCust && existingCust.points_locked === false)) {
                                const { error: loyaltyError } = await supabaseAdmin.rpc('earn_loyalty_points', {
                                    target_order_id: fullOrder.id
                                });
                                if (loyaltyError) console.error('Loyalty Allocation Error:', loyaltyError);

                                // Update purchase count
                                await supabaseAdmin.from('customers').update({
                                    purchase_count: (existingCust?.purchase_count || 0) + 1
                                }).eq('email', fullOrder.guest_info.email);

                            } else {
                                // FOMO Campaign: Account is LOCKED, they missed out on points.
                                const newMissed = (existingCust.missed_points || 0) + pointsThisPurchase;
                                const newCount = (existingCust.purchase_count || 0) + 1;

                                await supabaseAdmin.from('customers').update({
                                    missed_points: newMissed,
                                    purchase_count: newCount
                                }).eq('email', fullOrder.guest_info.email);

                                // Send the "Look what you're missing" email
                                await sendMissedPointsEmail(
                                    fullOrder.guest_info.email,
                                    pointsThisPurchase,
                                    newMissed,
                                    newCount
                                );
                            }

                            // 6. Automated Emails (Order Confirmation always sent)
                            await sendOrderConfirmationEmail(
                                fullOrder.guest_info.email,
                                fullOrder.id,
                                fullOrder.total_amount
                            );

                            // Get fresh points balance for the loyalty email
                            const { data: updatedCust } = await supabaseAdmin
                                .from('customers')
                                .select('reward_points')
                                .eq('email', fullOrder.guest_info.email)
                                .single();

                            if (updatedCust) {
                                await sendLoyaltyPointsEmail(
                                    fullOrder.guest_info.email,
                                    pointsThisPurchase,
                                    updatedCust.reward_points
                                );
                            }
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