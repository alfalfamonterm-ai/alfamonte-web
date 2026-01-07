import React from 'react';
import { OperationCategory } from '../../types';

interface ContextSelectorProps {
    startDate: string;
    setStartDate: (v: string) => void;
    endDate: string;
    setEndDate: (v: string) => void;
    panoId: string[];
    setPanoId: (v: string[]) => void;
    corteId: string;
    setCorteId: (v: string) => void;
    category: OperationCategory;
}

export const ContextSelector: React.FC<ContextSelectorProps> = ({
    startDate, setStartDate,
    endDate, setEndDate,
    panoId, setPanoId,
    corteId, setCorteId,
    category
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-200">
            {/* Dates */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ciclo Temporal</label>
                <div className="flex gap-2">
                    <div className="flex-1">
                        <span className="text-[10px] text-gray-400">Inicio</span>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border rounded text-sm font-bold" />
                    </div>
                    <div className="flex-1">
                        <span className="text-[10px] text-gray-400">Fin</span>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 border rounded text-sm font-bold" />
                    </div>
                </div>
            </div>

            {/* Pano Selection */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Ubicación (Paño)
                    {category === 'Costo Operacional' && <span className="text-blue-600 ml-1">(Multi-selección)</span>}
                </label>
                {category === 'Costo Operacional' ? (
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            {[1, 2, 3].map(n => {
                                const isSelected = panoId.includes(String(n));
                                return (
                                    <label key={n} className="flex-1 cursor-pointer">
                                        <div className={`p-2 rounded border-2 font-bold text-center transition-all ${isSelected ? 'bg-[#2D4A3E] text-white border-[#2D4A3E]' : 'bg-white text-gray-600 border-gray-300 hover:border-[#2D4A3E]'}`}>
                                            <input type="checkbox" checked={isSelected} onChange={(e) => {
                                                if (e.target.checked) setPanoId([...panoId, String(n)]);
                                                else setPanoId(panoId.filter(id => id !== String(n)));
                                            }} className="hidden" />
                                            <span>P{n}</span>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                        <button type="button" onClick={() => setPanoId(['1', '2', '3'])} className="w-full text-xs text-blue-600 hover:text-blue-800 font-bold">✓ Seleccionar Todos</button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        {[1, 2, 3].map(n => (
                            <button key={n} type="button" onClick={() => setPanoId([String(n)])} className={`flex-1 py-2 rounded border font-bold transition-all ${panoId[0] === String(n) ? 'bg-[#2D4A3E] text-white border-[#2D4A3E]' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                                P{n}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Corte Selection */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Corte / Ciclo</label>
                <select value={corteId} onChange={e => setCorteId(e.target.value)} className="w-full p-2 border rounded font-bold h-[42px]">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(n => <option key={n} value={n}>Corte #{n}</option>)}
                </select>
            </div>
        </div>
    );
};
