"use client";

import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                    {/* Column 1: Contact */}
                    <div>
                        <h4 className="font-merriweather text-xl font-bold text-[#2D4A3E] mb-6">Contacto</h4>
                        <ul className="space-y-4 text-gray-600">
                            <li className="flex items-center gap-3">
                                <span>📧</span>
                                <a href="mailto:hola@alfamonte.cl" className="hover:text-[#8B5E3C] transition-colors">hola@alfamonte.cl</a>
                            </li>
                            <li className="flex items-center gap-3">
                                <span>📱</span>
                                <a href="https://wa.me/56900000000" className="hover:text-[#8B5E3C] transition-colors">+56 9 XXXX XXXX</a>
                            </li>
                            <li className="flex items-center gap-3">
                                <span>📍</span>
                                <span>El Monte, Región Metropolitana, Chile</span>
                            </li>
                        </ul>
                    </div>

                    {/* Column 2: Legal */}
                    <div>
                        <h4 className="font-merriweather text-xl font-bold text-[#2D4A3E] mb-6">Legal</h4>
                        <ul className="space-y-4 text-gray-600">
                            <li>
                                <Link href="/politica-de-privacidad" className="hover:text-[#8B5E3C] transition-colors">Política de Privacidad</Link>
                            </li>
                            <li>
                                <Link href="/terminos-y-condiciones" className="hover:text-[#8B5E3C] transition-colors">Términos y Condiciones</Link>
                            </li>
                            <li>
                                <Link href="/envios-y-devoluciones" className="hover:text-[#8B5E3C] transition-colors">Políticas de Reembolso</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Navigation */}
                    <div>
                        <h4 className="font-merriweather text-xl font-bold text-[#2D4A3E] mb-6">Navegación</h4>
                        <ul className="space-y-4 text-gray-600">
                            <li>
                                <Link href="/" className="hover:text-[#8B5E3C] transition-colors">Inicio</Link>
                            </li>
                            <li>
                                <Link href="/shop" className="hover:text-[#8B5E3C] transition-colors">Catálogo de Alfalfa</Link>
                            </li>
                            <li>
                                <Link href="/about" className="hover:text-[#8B5E3C] transition-colors">Preguntas Frecuentes</Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Trust Signals & Legal Name */}
                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-gray-400 text-sm">
                        <p className="font-bold text-[#2D4A3E]">Agrícola Alfa.Monte SpA</p>
                        <p>RUT: 77.XXX.XXX-X | © 2026 Todos los derechos reservados.</p>
                    </div>

                    <div className="flex items-center gap-4 opacity-50 grayscale">
                        {/* Simple text placeholders for logos or simple emoji representations for now */}
                        <div className="flex gap-4">
                            <span className="text-xs font-bold border rounded px-2 py-1">WEBPAY</span>
                            <span className="text-xs font-bold border rounded px-2 py-1">MERCADO PAGO</span>
                            <span className="text-xs font-bold border rounded px-2 py-1">VISA/MASTER</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
