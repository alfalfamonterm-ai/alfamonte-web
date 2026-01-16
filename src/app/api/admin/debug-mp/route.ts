import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig } from 'mercadopago';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const token = process.env.MP_ACCESS_TOKEN || '';
        
        if (!token) {
            return NextResponse.json({ error: 'MP_ACCESS_TOKEN no está definido en el servidor.' });
        }

        const client = new MercadoPagoConfig({ accessToken: token });
        
        // Fetch user info from Mercado Pago API manually since SDK might not expose "users/me" directly cleanly
        const response = await fetch('https://api.mercadopago.com/users/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            return NextResponse.json({ 
                error: 'Error al consultar Mercado Pago', 
                status: response.status,
                details: await response.text()
            });
        }

        const userData = await response.json();

        return NextResponse.json({
            environment: token.startsWith('TEST-') ? 'SANDBOX (Pruebas)' : 'PRODUCTION (Dinero Real)',
            owner_name: `${userData.first_name} ${userData.last_name}`,
            email: userData.email,
            site_id: userData.site_id,
            nickname: userData.nickname,
            token_prefix: token.substring(0, 10) + '...'
        });

    } catch (error: any) {
        return NextResponse.json({ 
            error: 'Error interno', 
            details: error.message 
        });
    }
}
