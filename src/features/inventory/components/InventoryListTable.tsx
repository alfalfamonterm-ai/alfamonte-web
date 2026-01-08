import React from 'react';
import { InventoryItem } from '../types'; // ¡CORRECCIÓN DE RUTA A '../types' EN LUGAR DE '../../types'!
import { Edit, AlertTriangle, CheckCircle, Wrench } from 'lucide-react';

interface InventoryListTableProps {
    items: InventoryItem[];
    loading: boolean;
}

export const InventoryListTable: React.FC<InventoryListTableProps> = ({ items, loading }) => {
    if (loading) return <div className="p-8 text-center text-gray-500">Cargando inventario...</div>;
    if (items.length === 0) return <div className="p-8 text-center text-gray-500">No hay items registrados.</div>;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle size={16} className="text-green-500" />;
            case 'maintenance': return <Wrench size={16} className="text-orange-500" />;
            case 'broken': return <AlertTriangle size={16} className="text-red-500" />;
            default: return <span className="w-4 h-4 rounded-full bg-gray-300" />;
        }
    };

    return (
        <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
            <table className="w-full text-left text-sm">
                <thead className="bg-[#2D4A3E] text-white uppercase text-xs">
                    <tr>
                        <th className="p-4">Código</th>
                        <th className="p-4">Nombre</th>
                        <th className="p-4">Tipo</th>
                        <th className="p-4 text-center">Estado</th>
                        <th className="p-4 text-right">Disponible</th>
                        <th className="p-4 text-right">Valor Total</th>
                        <th className="p-4 text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-mono text-xs text-gray-500">{item.item_code}</td>
                            <td className="p-4 font-medium text-gray-900">
                                {item.name}
                                <div className="text-xs text-gray-400">{item.category}</div>
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold
                                    ${item.item_type === 'material' ? 'bg-blue-100 text-blue-700' : ''}
                                    ${item.item_type === 'equipment' ? 'bg-purple-100 text-purple-700' : ''}
                                    ${item.item_type === 'tool' ? 'bg-orange-100 text-orange-700' : ''}
                                `}>
                                    {item.item_type}
                                </span>
                            </td>
                            <td className="p-4 flex justify-center items-center gap-2">
                                {getStatusIcon(item.status)}
                                <span className="capitalize text-xs">{item.status}</span>
                            </td>
                            <td className="p-4 text-right font-bold">
                                {item.quantity_available} <span className="text-xs font-normal text-gray-400">{item.unit}</span>
                            </td>
                            <td className="p-4 text-right text-gray-600">
                                ${(item.unit_cost * item.quantity_available).toLocaleString()}
                            </td>
                            <td className="p-4 text-center">
                                <button className="p-2 text-gray-400 hover:text-[#2D4A3E] transition-colors">
                                    <Edit size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};