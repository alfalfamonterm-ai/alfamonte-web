"use client";

import { useInventoryList } from '@/features/inventory/hooks/useInventoryList';
import { InventoryListTable } from '@/features/inventory/components/InventoryListTable';
import { PlusCircle, Package, Wrench, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function InventoryPage() {
    const { items, loading, stats } = useInventoryList();

    return (
        <div className="max-w-6xl mx-auto pb-12">

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#2D4A3E] font-merriweather">Inventario & Activos</h1>
                    <p className="text-gray-500">Gestión de materiales, herramientas y maquinaria.</p>
                </div>
                <Link href="/admin/inventory/new" className="flex items-center gap-2 px-6 py-3 bg-[#2D4A3E] text-white rounded-xl font-bold hover:bg-[#1a2f26] transition-colors shadow-lg">
                    <PlusCircle size={20} />
                    Nueva Compra / Item
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-4 bg-blue-50 text-blue-700 rounded-full"><Package size={24} /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-bold uppercase">Total Items</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.totalItems}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-4 bg-green-50 text-green-700 rounded-full"><span className="text-xl font-bold">$</span></div>
                    <div>
                        <p className="text-sm text-gray-500 font-bold uppercase">Valorización</p>
                        <p className="text-2xl font-bold text-gray-800">${stats.totalValue.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-4 bg-orange-50 text-orange-700 rounded-full"><AlertCircle size={24} /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-bold uppercase">Stock Bajo</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.lowStockCount}</p>
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <InventoryListTable items={items} loading={loading} />
        </div>
    );
}
