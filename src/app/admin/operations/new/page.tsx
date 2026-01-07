"use client";

import { OperationsForm } from '@/features/operations/components/OperationsForm/OperationsForm';

export default function NewOperationPage() {
    return (
        <div className="max-w-4xl mx-auto pb-12">
            <h1 className="text-2xl font-bold text-[#2D4A3E] mb-6 font-merriweather">Registro Avanzado de Operaciones</h1>
            <OperationsForm />
        </div>
    );
}
