import React from 'react';
import Navbar from '@/components/layout/Navbar';

export default function PrivacidadPage() {
    return (
        <main className="min-h-screen pt-32 pb-20 bg-[#F4F1EA]">
            <Navbar />
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
                    <h1 className="font-merriweather text-4xl font-bold text-[#2D4A3E] mb-8">Política de Privacidad</h1>

                    <div className="prose prose-[#2D4A3E] max-w-none space-y-6 text-gray-700 leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-bold text-[#2D4A3E] mb-4">Introducción</h2>
                            <p>En Agrícola Alfa.Monte SpA, la privacidad de nuestros clientes es prioridad. Esta política describe cómo recopilamos y utilizamos su información cuando utiliza nuestro sitio web y servicios.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2D4A3E] mb-4">Información Recopilada</h2>
                            <p>Recopilamos datos personales como nombre, dirección de envío, correo electrónico y teléfono únicamente para procesar sus pedidos y mejorar su experiencia de usuario. Estos datos se obtienen a través de nuestros formularios de registro, compra y contacto.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2D4A3E] mb-4">Uso de Cookies y Tecnologías de Seguimiento</h2>
                            <p>Utilizamos cookies propias y de terceros (como Google Analytics y Google Ads) para analizar el comportamiento del sitio, medir la efectividad de nuestras campañas y mostrar publicidad relevante basada en visitas anteriores.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2D4A3E] mb-4">Protección de Datos</h2>
                            <p>Sus datos no serán vendidos, intercambiados ni transferidos a terceros sin su consentimiento, excepto para los fines necesarios de logística de envío del producto o cumplimiento legal.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2D4A3E] mb-4">Uso de los Datos</h2>
                            <p>Indicamos que los datos se usan exclusivamente para procesar el envío de la alfalfa, gestionar su cuenta de cliente, ofrecerle soporte técnico y optimizar la publicidad para mostrarle ofertas de su interés.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2D4A3E] mb-4">Derechos del Usuario</h2>
                            <p>Usted puede solicitar el acceso, rectificación o eliminación de sus datos personales en cualquier momento escribiendo al correo de contacto: <a href="mailto:hola@alfamonte.cl" className="text-[#8B5E3C] underline">hola@alfamonte.cl</a>.</p>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}
