const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

// Try to read API KEY from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKeyMatch = envContent.match(/RESEND_API_KEY=(.*)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : null;

if (!apiKey) {
    console.error('RESEND_API_KEY not found in .env.local');
    process.exit(1);
}

const resend = new Resend(apiKey);

async function test() {
    console.log('Using API Key (first 5 chars):', apiKey.substring(0, 5) + '...');
    try {
        const { data, error } = await resend.emails.send({
            from: 'Alfa.Monte <onboarding@resend.dev>',
            to: 'alfalfa.monte.rm@gmail.com',
            subject: 'Test Diagnostico',
            html: '<p>Este es un correo de prueba diagnostico.</p>'
        });

        if (error) {
            console.error('DIAGNOSTIC ERROR:', JSON.stringify(error, null, 2));
        } else {
            console.log('DIAGNOSTIC SUCCESS:', JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error('UNEXPECTED ERROR:', e);
    }
}

test();
