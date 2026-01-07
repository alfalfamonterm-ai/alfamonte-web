const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

console.log('--- Available Env Keys ---');
Object.keys(process.env).forEach(key => {
    if (key.includes('SUPABASE') || key.includes('MP_') || key.includes('KEY') || key.includes('TOKEN')) {
        console.log(key);
    }
});
console.log('--------------------------');
