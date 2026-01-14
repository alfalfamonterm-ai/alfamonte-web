import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendPasswordChangedConfirmationEmail, sendLoyaltyWelcomeEmail } from '@/lib/resend';

export const dynamic = 'force-dynamic';


export async function POST(req: NextRequest) {
    const supabaseAdmin = createClient(
        process.env.SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
    try {
        const { email } = await req.json();

        const { data: customer, error } = await supabaseAdmin
            .from('customers')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !customer) throw new Error('Customer not found');

        // Send confirmation of password change
        await sendPasswordChangedConfirmationEmail(email);

        // If points were locked just now (or already locked), send the loyalty welcome
        // In the UI we trigger this only if it was the first time
        await sendLoyaltyWelcomeEmail(email, customer.name || email.split('@')[0], customer.reward_points || 0);

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
