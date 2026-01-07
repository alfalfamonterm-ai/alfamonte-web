import React from 'react';
import Navbar from '@/components/layout/Navbar';

export default function EnviosPage() {
    return (
        <main className="min-h-screen pt-32 pb-20 bg-[#F4F1EA]">
            <Navbar />
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
                    <h1 className="font-merriweather text-4xl font-bold text-[#2D4A3E] mb-8">Envíos y Devoluciones</h1>

                    <div className="prose prose-[#2D4A3E] max-w-none space-y-10 text-gray-700 leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-bold text-[#2D4A3E] border-b pb-2 mb-4">1. Políticas de Envío</h2>
                            <ul className="space-y-4 list-disc pl-5">
                                <li><strong>Zonas de Cobertura:</strong> Realizamos envíos a toda la Región Metropolitana y regiones seleccionadas de Chile.</li>
                                <li><strong>Tiempos de Entrega:</strong> El tiempo estimado de despacho es de 2 a 5 días hábiles tras la confirmación satisfactoria del pago.</li>
                                <li><strong>Costos de Envío:</strong> El valor del despacho se calcula automáticamente en el checkout antes de finalizar la compra y es de responsabilidad del comprador, salvo promociones vigentes de "envío gratis".</li>
                                <li><strong>Seguimiento:</strong> Una vez que su pedido sea despachado, recibirá un enlace de seguimiento en tiempo real vía correo electrónico para monitorear su estado.</li>
                            </ul>
                        </section>

                        <section className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                            <h2 className="text-2xl font-bold text-[#2D4A3E] mb-4">2. Cambios y Devoluciones</h2>
                            <p className="mb-4">Dada la naturaleza agrícola y orgánica de nuestros productos, hemos establecido las siguientes condiciones para garantizar la salud animal y la bioseguridad:</p>
                            <ul className="space-y-4 list-disc pl-5">
                                <li><strong>Plazo:</strong> Usted cuenta con <strong>10 días corridos</strong> desde la recepción para solicitar un cambio o devolución si el producto presenta fallas evidentes de origen.</li>
                                <li><strong>Fallas de Origen Aceptadas:</strong> Humedad excesiva (moho), presencia de plagas o daños graves en el empaque que comprometan la integridad del producto.</li>
                                <li><strong>Condiciones de Higiene:</strong> Por seguridad de las mascotas de otros clientes, <strong>no se aceptarán devoluciones de sacos o bolsas que hayan sido abiertos</strong> o manipulados, a excepción de que el defecto de fabricación solo sea detectable tras la apertura.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2D4A3E] mb-4">3. Proceso de Reembolso</h2>
                            <p>Una vez que la solicitud de devolución sea aceptada y el producto retornado a nuestras bodegas:</p>
                            <ul className="space-y-4 list-disc pl-5">
                                <li>El reembolso se gestionará en un plazo máximo de <strong>5 a 7 días hábiles</strong>.</li>
                                <li>La devolución del dinero se realizará mediante el mismo método de pago utilizado en la transacción original (Mercado Pago, transferencia o reversa de tarjeta).</li>
                            </ul>
                        </section>

                        <div className="bg-[#2D4A3E] text-white p-6 rounded-2xl text-center">
                            <p className="font-bold">¿Necesitas ayuda con un pedido?</p>
                            <p className="text-sm opacity-90">Escríbenos a hola@alfamonte.cl o por nuestro canal oficial de WhatsApp.</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
