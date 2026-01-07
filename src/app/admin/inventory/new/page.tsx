"use client";

import { AddItemForm } from '@/features/inventory/components/AddItemForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewInventoryPage() {
    return (
        <div className="max-w-4xl mx-auto pb-12">

            <div className="mb-6">
                <Link href="/admin/inventory" className="text-gray-500 hover:text-[#2D4A3E] flex items-center gap-2 text-sm font-bold mb-4 transition-colors">
                    <ArrowLeft size={16} />
                    Volver al Inventario
                </Link>
                <h1 className="text-2xl font-bold text-[#2D4A3E] font-merriweather">Registrar Nueva Compra / Ítem</h1>
                <p className="text-gray-500 text-sm">Ingresa materiales, herramientas o maquinaria. Esto registrará automáticamente el gasto en el sistema financiero.</p>
            </div>

            <AddItemForm />
        </div>
    );
}
