import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/mercadopago';
import { PreApproval } from 'mercadopago';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { planId, customer, productTitle } = body;

        if (!planId || !customer) {
            return NextResponse.json({ error: 'Falta información de la suscripción' }, { status: 400 });
        }

        const preApproval = new PreApproval(client);

        const externalRef = `SUB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

        const result = await preApproval.create({
            body: {
                preapproval_plan_id: planId,
                payer_email: customer.email,
                back_url: `${baseUrl}/success_subscription`,
                reason: `Suscripción: ${productTitle}`,
                external_reference: externalRef,
                auto_recurring: {
                    currency_id: 'CLP',
                    transaction_amount: body.amount,
                    frequency: 1,
                    frequency_type: 'months'
                },
                status: 'pending'
            }
        });

        return NextResponse.json({
            id: result.id,
            init_point: result.init_point,
            sandbox_init_point: (result as any).sandbox_init_point
        });

    } catch (error: any) {
        console.error('Error creando suscripción:', error);
        return NextResponse.json({
            error: 'Error al procesar la suscripción',
            details: error.message
        }, { status: 500 });
    }
}
