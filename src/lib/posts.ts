export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string; // HTML or Markdown content
    author: string;
    date: string;
    imageSrc: string;
    category: string;
}

export const blogPosts: BlogPost[] = [
    {
        id: '1',
        slug: 'importancia-fibra-larga-dental',
        title: 'La importancia de la fibra larga en la salud dental de tu conejo',
        excerpt: '¿Sabías que los dientes de tu conejo nunca dejan de crecer? Descubre el secreto del desgaste natural.',
        content: `
            <p>A diferencia de nosotros, los conejos tienen dientes de crecimiento continuo. Si no se desgastan, pueden causar dolorosos abscesos y problemas para comer.</p>
            <h3>El mito del pan duro</h3>
            <p>Muchos creen que el pan duro desgasta los dientes. ¡Falso! Al mojarse con la saliva, se vuelve blando. Lo único que realmente funciona es la <strong>abrasión mecánica</strong>.</p>
            <h3>La Solución: Fibra Larga</h3>
            <p>El heno de alfalfa en ramas (no molido) obliga al conejo a realizar un movimiento de masticación lateral ("grinding"). Este movimiento es la lima natural perfecta.</p>
            <p>En Alfa.Monte, mantenemos el tallo largo intencionalmente para fomentar este hábito saludable.</p>
        `,
        author: 'Dra. Vet. Sofia M.',
        date: '28 Dic 2025',
        imageSrc: '/images/products/rabbit-snack.jpg',
        category: 'Conejos'
    },
    {
        id: '2',
        slug: 'alfalfa-vital-primeros-meses',
        title: 'Por qué el Heno de Alfalfa es vital en los primeros 6 meses',
        excerpt: 'El "superfood" que define el futuro de sus huesos y músculos.',
        content: `
            <p>Un gazapo (conejo bebé) duplica su tamaño en semanas. Para lograr esto, necesita ladrillos de construcción: <strong>Calcio y Proteína</strong>.</p>
            <h3>¿Heno de Alfalfa o Heno de Ballica?</h3>
            <p>La ballica es excelente para adultos, pero pobre para bebés. La alfalfa contiene hasta 3 veces más calcio, esencial para calcificar esos huesos en crecimiento rápido.</p>
            <p>Nuestra regla: <strong>Alfalfa ilimitada hasta los 7 meses</strong>. Luego, hacemos la transición a henos de gramíneas.</p>
        `,
        author: 'Equipo Alfa.Monte',
        date: '27 Dic 2025',
        imageSrc: '/images/products/rabbit-grow.jpg',
        category: 'Conejos'
    },
    {
        id: '3',
        slug: 'guia-alimentacion-natural-cobayas',
        title: 'Guía de alimentación natural para cobayas y vitamina C',
        excerpt: 'Los cobayas son como pequeños marineros: propensos al escorbuto si no comen bien.',
        content: `
            <p>Los cuyes (cobayas) tienen una particularidad genética: <strong>no pueden fabricar su propia Vitamina C</strong>. Deben obtenerla de la dieta diaria.</p>
            <h3>El rol de la Alfalfa</h3>
            <p>Aunque la fuente principal son los vegetales frescos (pimiento rojo, kiwi), la alfalfa de alta calidad aporta un soporte nutricional robusto y energía para su metabolismo acelerado.</p>
            <p>Combina nuestro "Junior Cavy Force" con una taza diaria de vegetales frescos para un pelaje brillante y sistema inmune de acero.</p>
        `,
        author: 'Nutricionista Animal C.',
        date: '26 Dic 2025',
        imageSrc: '/images/products/cavy-junior.jpg',
        category: 'Cuyes'
    },
    {
        id: '4',
        slug: 'alfalfa-para-gallinas',
        title: 'Huevos más naranjas y gallinas más felices',
        excerpt: 'El secreto de los criadores expertos: Bloques de alfalfa para picoteo.',
        content: `
            <p>¿Sabías que las gallinas se aburren? El estrés puede llevarlas a picarse entre ellas.</p>
            <h3>El Bloque Anti-Estrés</h3>
            <p>Colgar un bloque de alfalfa compactada no solo las entretiene, sino que los carotenos naturales de la planta pasan directamente a la yema del huevo, logrando ese color anaranjado intenso que todos buscamos.</p>
            <p>Además, ¡es un premio delicioso que las mantiene activas y curiosas!</p>
        `,
        author: 'Juan El Granjero',
        date: '08 Dic 2025',
        imageSrc: '/images/products/bird-boost.jpg',
        category: 'Aves'
    }
];

export function getPostBySlug(slug: string): BlogPost | undefined {
    return blogPosts.find(p => p.slug === slug);
}

export function getAllPosts(): BlogPost[] {
    return blogPosts;
}
