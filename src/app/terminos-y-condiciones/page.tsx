import React from 'react';
import Navbar from '@/components/layout/Navbar';

export default function TerminosPage() {
    return (
        <main className="min-h-screen pt-32 pb-20 bg-[#F4F1EA]">
            <Navbar />
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
                    <h1 className="font-merriweather text-4xl font-bold text-[#2D4A3E] mb-8">Términos y Condiciones</h1>

                    <div className="prose prose-[#2D4A3E] max-w-none space-y-6 text-gray-700 leading-relaxed">
                        <p>Al utilizar este sitio web y realizar una compra en Alfa.Monte, usted acepta los siguientes términos y condiciones de uso:</p>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2D4A3E] mb-4">Naturaleza del Producto</h2>
                            <p>La alfalfa es un producto agrícola natural. Las variaciones de color (de verde intenso a dorado), textura o aroma son normales según la temporada de cosecha, el secado al sol y factores climáticos. Estas variaciones no comprometen la calidad nutricional del producto.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2D4A3E] mb-4">Uso del Sitio</h2>
                            <p>Este sitio está destinado a la venta de forraje y complementos para animales domésticos (conejos, cobayas, chinchillas y similares). No se garantiza que el contenido sea apto para fines medicinales o veterinarios específicos sin la supervisión de un profesional calificado.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2D4A3E] mb-4">Exactitud de Precios y Stock</h2>
                            <p>Agrícola Alfa.Monte SpA se reserva el derecho de modificar precios y disponibilidad de stock sin previo aviso debido a la naturaleza estacional de la producción. Sin embargo, el precio confirmado al momento de finalizar la compra será respetado íntegramente.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2D4A3E] mb-4">Limitación de Responsabilidad</h2>
                            <p>Alfa.Monte no se hace responsable por el uso inadecuado del producto por parte del cliente o por reacciones alérgicas individuales de las mascotas. Se recomienda siempre realizar una transición gradual en la dieta de su animal.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2D4A3E] mb-4">Propiedad Intelectual</h2>
                            <p>Todo el contenido de este sitio (textos, imágenes, logos y diseño) es propiedad exclusiva de Agrícola Alfa.Monte SpA y está protegido por las leyes de propiedad intelectual de Chile.</p>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}
