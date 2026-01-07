import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/mercadopago';
import supabase from '@/lib/supabase';
import { Preference } from 'mercadopago';
import { calculatePrice, calculateTotal } from '@/lib/pricing';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { items, customer } = body;

        if (!items || items.length === 0 || !customer) {
            return NextResponse.json({ error: 'Falta información del pedido' }, { status: 400 });
        }

        // Initialize Preference resource
        const preference = new Preference(client);

        // Generate unique Order ID
        const externalRef = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Recalculate total on server for security
        const totalAmount = calculateTotal(items);

        // Map items for Mercado Pago
        const mpItems = items.map((item: any) => ({
            id: item.product.id,
            title: `${item.product.title}${item.isSubscription ? ' (Suscripción)' : ''}`,
            description: item.product.description?.substring(0, 250) || 'Alimento Premium',
            quantity: Number(item.quantity),
            unit_price: calculatePrice(item.product.price, item.isSubscription),
            currency_id: 'CLP',
        }));

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

        // Create preference
        const result = await preference.create({
            body: {
                items: mpItems,
                payer: {
                    name: customer.firstName,
                    surname: customer.lastName,
                    email: customer.email,
                    phone: {
                        number: customer.phone,
                    },
                    address: {
                        street_name: customer.street,
                        street_number: String(customer.number),
                    },
                },
                back_urls: {
                    success: `${baseUrl}/success`,
                    failure: `${baseUrl}/failure`,
                    pending: `${baseUrl}/pending`,
                },
                auto_return: 'approved',
                statement_descriptor: 'ALFA MONTE',
                external_reference: externalRef,
                metadata: {
                    order_id: externalRef,
                    customer_email: customer.email,
                    is_guest: true
                }
            },
        });

        // 1. Insert into Orders table
        const { data: order, error: orderError } = await supabase.from('orders').insert({
            guest_info: {
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                phone: customer.phone,
                rut: customer.rut,
                address: {
                    region: customer.region,
                    comuna: customer.comuna,
                    street: customer.street,
                    number: customer.number,
                    apartment: customer.apartment,
                    additionalInfo: customer.additionalInfo
                }
            },
            total_amount: totalAmount.toString(),
            subtotal: totalAmount.toString(),
            shipping_cost: "0",
            status: 'pending',
            payment_status: 'pending',
            payment_method: 'mercadopago',
            shipping_address: `${customer.street} ${customer.number}, ${customer.comuna}, ${customer.region}`,
            notes: `MP Preference: ${result.id}`,
            external_reference: externalRef,
            mp_preference_id: result.id
        }).select().single();

        if (orderError) throw orderError;

        // 2. Insert into Order Items
        const orderItems = items.map((item: any) => ({
            order_id: order.id,
            product_id: item.product.id,
            quantity: item.quantity,
            unit_price: calculatePrice(item.product.price, item.isSubscription),
            total_price: calculatePrice(item.product.price, item.isSubscription) * item.quantity,
            product_title: item.product.title
        }));

        const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
        if (itemsError) throw itemsError;

        return NextResponse.json({
            id: result.id,
            orderId: order.id,
            init_point: result.init_point,
            sandbox_init_point: result.sandbox_init_point
        });

    } catch (error: any) {
        console.error('Error procesando checkout:', error);
        return NextResponse.json({
            error: 'Error al procesar el pedido',
            details: error.message
        }, { status: 500 });
    }
}
<<<<<<< HEAD
=======

>>>>>>> 4af7fc6 (Fix: Aplicado downgrade de Next.js y React a versiones estables)
