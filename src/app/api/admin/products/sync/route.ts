import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { MercadoPagoConfig, PreApprovalPlan } from 'mercadopago';

export const dynamic = 'force-dynamic';

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || '',
});


export async function POST(req: NextRequest) {
    const supabaseAdmin = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    try {
        const product = await req.json();

        if (!product.is_subscription_enabled) {
            return NextResponse.json({ message: 'Sincronización no requerida (no es suscripción)' });
        }

        const plan = new PreApprovalPlan(client);
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://alfamonte.cl';

        let mpPlanId = product.mp_plan_id;

        if (mpPlanId) {
            // Update existing plan (Mercado Pago only allows certain fields to be updated)
            console.log('Updating existing MP plan:', mpPlanId);
            // Updating a plan in MP v2 SDK might require plan.update({ id, body })
            // Note: Many fields in MP plans are immutable after creation.
            // For now, we mainly create if missing.
        } else {
            // Create new plan
            console.log('Creating new MP plan for:', product.title);
            const body = {
                reason: `Suscripción Mensual: ${product.title}`,
                auto_enrollment: true,
                back_url: `${baseUrl}/shop`,
                payment_methods_allowed: {
                    payment_types: [
                        { id: 'credit_card' },
                        { id: 'debit_card' }
                    ]
                },
                auto_recurring: {
                    frequency: 1,
                    frequency_type: 'months',
                    transaction_amount: Number(product.price),
                    currency_id: 'CLP',
                    free_trial: undefined
                }
            };

            const result = await plan.create({ body });
            mpPlanId = result.id;
        }

        return NextResponse.json({ mp_plan_id: mpPlanId });

    } catch (error: any) {
        console.error('Error syncing with Mercado Pago:', error);
        return NextResponse.json({
            error: 'Error de sincronización con Mercado Pago',
            details: error.message
        }, { status: 500 });
    }
}
