export type Category = 'conejo-junior' | 'conejo-adulto' | 'cuyi' | 'aves' | 'universal';

export interface Product {
    id: string;
    slug: string;
    title: string;
    price: number;
    weight: string;
    description: string;
    features: string[];
    imageSrc: string;
    category: Category;
    categoryLabel: string; // Human readable category
    recommended?: boolean; // Highlighted product
}

export const products: Product[] = [
    // UNIVERSAL / BASIC
    {
        id: '1',
        slug: 'bolsa-1kg',
        title: 'La Bolsita Diaria',
        price: 3990,
        weight: '1 Kg',
        description: 'Formato práctico para hámsters o pruebas iniciales. Alfalfa premium seleccionada a mano.',
        features: ['Hojas verdes seleccionadas', 'Sin polvo', 'Bolsa resellable'],
        imageSrc: '/images/product-1kg.jpg',
        category: 'universal',
        categoryLabel: 'Todo Tipo de Mascota'
    },
    // CONEJO JUNIOR (Crecimiento - Consumo Ilimitado)
    {
        id: 'junior-1',
        slug: 'pack-crecimiento-junior',
        title: 'Pack Crecimiento Junior',
        price: 9990,
        weight: '3 Kg',
        description: 'Especial para conejos menores de 7 meses. calcio y proteínas extra para huesos fuertes.',
        features: ['Alto en Calcio', 'Proteína esencial', 'Corte tierno para dientes jóvenes'],
        imageSrc: '/images/product-2_5kg.jpg', // Placeholder
        category: 'conejo-junior',
        categoryLabel: 'Conejo Junior (< 7 meses)',
        recommended: true
    },
    // CONEJO ADULTO (Treats - Consumo Moderado)
    {
        id: 'adult-1',
        slug: 'treat-mix-adulto',
        title: 'Alfalfa Treat Mix',
        price: 4990,
        weight: '500g',
        description: 'Un "postre" saludable para conejos adultos. Ideal para dar 1 vez a la semana como premio.',
        features: ['Porción controlada', 'Estimulo mental', 'Complemento al heno de ballica'],
        imageSrc: '/images/product-1kg.jpg',
        category: 'conejo-adulto',
        categoryLabel: 'Conejo Adulto'
    },
    // CUYI / COBAYA (Necesidad de Vitamina C)
    {
        id: 'cuyi-1',
        slug: 'cuyi-power-pack',
        title: 'Cuyi Power Pack',
        price: 8490,
        weight: '2 Kg',
        description: 'Selección especial para cobayas. Hojas ricas en nutrientes para complementar su dieta.',
        features: ['Selección de hoja ancha', 'Estimula el apetito', 'Ideal para gestantes'],
        imageSrc: '/images/product-2_5kg.jpg',
        category: 'cuyi',
        categoryLabel: 'Cobayas / Cuyes'
    },
    // AVES (Gallinas Felices)
    {
        id: 'aves-1',
        slug: 'bloque-gallinas-felices',
        title: 'Bloque Picoteo Aves',
        price: 12990,
        weight: '4 Kg',
        description: 'Alfalfa compactada para colgar. Reduce el estrés en gallinas y mejora el color de las yemas.',
        features: ['Entretenimiento (Anti-picaje)', 'Mejora huevos', 'Alto en fibra'],
        imageSrc: '/images/product-5kg.jpg',
        category: 'aves',
        categoryLabel: 'Gallinas y Aves'
    },
    // BULK
    {
        id: 'bulk-1',
        slug: 'caja-familiar-5kg',
        title: 'Caja Familiar Multi-Mascota',
        price: 15990,
        weight: '5 Kg',
        description: 'Para hogares con varias mascotas o refugios. Máxima economía.',
        features: ['Máximo ahorro', 'Envío optimizado', 'Caja resistente'],
        imageSrc: '/images/product-5kg.jpg',
        category: 'universal',
        categoryLabel: 'Familiar / Refugio'
    }
];

export function getProductBySlug(slug: string): Product | undefined {
    return products.find(p => p.slug === slug);
}

export function getProductsByCategory(category: Category): Product[] {
    return products.filter(p => p.category === category || p.category === 'universal');
}
