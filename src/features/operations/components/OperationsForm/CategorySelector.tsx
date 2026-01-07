import React from 'react';
import { OperationCategory } from '../../types';

interface CategorySelectorProps {
    category: OperationCategory;
    setCategory: (c: OperationCategory) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({ category, setCategory }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button type="button" onClick={() => setCategory('Rendimiento')} className={`p-4 rounded-xl border-2 transition-all text-center ${category === 'Rendimiento' ? 'border-green-500 bg-green-50 text-green-900 scale-105 shadow' : 'border-gray-100 hover:border-gray-300'}`}>
                <div className="text-3xl">🍏</div>
                <div className="font-bold text-sm">Rendimiento</div>
            </button>
            <button type="button" onClick={() => setCategory('Venta')} className={`p-4 rounded-xl border-2 transition-all text-center ${category === 'Venta' ? 'border-blue-500 bg-blue-50 text-blue-900 scale-105 shadow' : 'border-gray-100 hover:border-gray-300'}`}>
                <div className="text-3xl">💰</div>
                <div className="font-bold text-sm">Venta</div>
            </button>
            <button type="button" onClick={() => setCategory('Costo Operacional')} className={`p-4 rounded-xl border-2 transition-all text-center ${category === 'Costo Operacional' ? 'border-red-500 bg-red-50 text-red-900 scale-105 shadow' : 'border-gray-100 hover:border-gray-300'}`}>
                <div className="text-3xl">💸</div>
                <div className="font-bold text-sm">Costo Op.</div>
            </button>
            <button type="button" onClick={() => setCategory('Retiro de Utilidad')} className={`p-4 rounded-xl border-2 transition-all text-center ${category === 'Retiro de Utilidad' ? 'border-indigo-500 bg-indigo-50 text-indigo-900 scale-105 shadow' : 'border-gray-100 hover:border-gray-300'}`}>
                <div className="text-3xl">🏦</div>
                <div className="font-bold text-sm">Utilidad</div>
            </button>
        </div>
    );
};
