const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function main() {
    // 1. Load Environment Variables
    const envPath = path.join(__dirname, '..', '.env.local');
    if (!fs.existsSync(envPath)) {
        console.error('❌ .env.local not found at', envPath);
        process.exit(1);
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    envContent.split('\n').forEach(line => {
        const [key, val] = line.split('=');
        if (key && val) envVars[key.trim()] = val.trim().replace(/"/g, '');
    });

    const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
    const supabaseKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
    // Prefer service role key if available for deletions
    const serviceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'] || supabaseKey;

    if (!supabaseUrl || !serviceKey) {
        console.error('❌ Missing Supabase keys');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    console.log('🔌 Connected to Supabase:', supabaseUrl);

    // 2. Delete Old Products (Category != 'Gallinas')
    console.log('🧹 Clearing old products (Keeping Gallinas)...');
    const { error: delError } = await supabase
        .from('products')
        .delete()
        .neq('category', 'Gallinas');

    if (delError) {
        console.error('❌ Delete failed:', delError.message);
        process.exit(1);
    }
    console.log('✅ Old products removed.');

    // 3. Prepare New Data
    const products = [
        // CONEJOS
        {
            title: 'Gazapo-Grow Premium',
            slug: 'gazapo-grow-premium',
            description: 'Alfalfa de primer corte seleccionada para conejos jóvenes y hembras gestantes. Crecimiento fuerte y desarrollo óseo garantizado.',
            price: 6490,
            weight: '4 Kg',
            category: 'Conejos',
            image_src: '/images/products/rabbit-grow.jpg',
            stock: 50
        },
        {
            title: 'Adult-Wellness Snack',
            slug: 'adult-wellness-snack',
            description: 'Suplemento gourmet de alfalfa en ramas para conejos adultos. Premio saludable bajo en calorías.',
            price: 5490,
            weight: '0.5 Kg',
            category: 'Conejos',
            image_src: '/images/products/rabbit-snack.jpg',
            stock: 50
        },
        // COBAYAS
        {
            title: 'Junior Cavy Force',
            slug: 'junior-cavy-force',
            description: 'Mezcla equilibrada de alfalfa para cobayas en crecimiento. Impulso vital de Calcio y Vitamina C.',
            price: 5990,
            weight: '2 Kg',
            category: 'Cobayas',
            image_src: '/images/products/cavy-junior.jpg',
            stock: 50
        },
        {
            title: 'Cavy-Delice Recover',
            slug: 'cavy-delice-recover',
            description: 'Micro-paquete de alfalfa de alta palatabilidad para recuperación y convalecencia.',
            price: 5490,
            weight: '0.3 Kg',
            category: 'Cobayas',
            image_src: '/images/products/cavy-recover.jpg',
            stock: 30
        },
        // CHINCHILLAS
        {
            title: 'Chin-Luxe Growth',
            slug: 'chin-luxe-growth',
            description: 'Energía pura para chinchillas jóvenes y lactantes. Alfalfa de hoja fina.',
            price: 5990,
            weight: '1.5 Kg',
            category: 'Chinchillas',
            image_src: '/images/products/chin-growth.jpg',
            stock: 40
        },
        {
            title: 'Chin-Fiber Balance',
            slug: 'chin-fiber-balance',
            description: 'Complemento de fibra ideal para mantenimiento dental en chinchillas adultas.',
            price: 5490,
            weight: '0.3 Kg',
            category: 'Chinchillas',
            image_src: '/images/products/chin-fiber.jpg',
            stock: 40
        },
        // ROEDORES
        {
            title: 'Rodent Nesting Fiber',
            slug: 'rodent-nesting-fiber',
            description: 'Alfalfa en ramas largas para construcción de nidos cálidos y picoteo saludable.',
            price: 5490,
            weight: '0.2 Kg',
            category: 'Roedores',
            image_src: '/images/products/rodent-nest.jpg',
            stock: 20
        },
        {
            title: 'Gerbil-Alfalfa Crisp',
            slug: 'gerbil-alfalfa-crisp',
            description: 'Snack proteico crujiente (brotes y hojas) para jerbos y ratones.',
            price: 5490,
            weight: '0.1 Kg',
            category: 'Roedores',
            image_src: '/images/products/rodent-crisp.jpg',
            stock: 20
        },
        // AVES
        {
            title: 'Aviary-Boost Leaves',
            slug: 'aviary-boost-leaves',
            description: 'Multivitamínico natural (Hojas deshidratadas) para mezclar con pasta de cría.',
            price: 5490,
            weight: '0.1 Kg',
            category: 'Aves',
            image_src: '/images/products/bird-boost.jpg',
            stock: 25
        },
        {
            title: 'Agapornis Nest-Stems',
            slug: 'agapornis-nest-stems',
            description: 'Tallos largos seleccionados para construcción de nidos de Inseparables.',
            price: 5490,
            weight: '0.2 Kg',
            category: 'Aves',
            image_src: '/images/products/bird-nest.jpg',
            stock: 25
        }
    ];

    console.log(`📦 Inserting ${products.length} new products...`);
    const { error: insError, data } = await supabase
        .from('products')
        .insert(products)
        .select();

    if (insError) {
        console.error('❌ Insert failed:', insError.message);
        process.exit(1);
    }

    console.log('✨ Success! Products created:', data.length);
}

main().catch(console.error);
