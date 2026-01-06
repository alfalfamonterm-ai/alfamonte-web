"use client";

import React, { useEffect, useState } from 'react';
import { getAuditLogs, AuditLog } from '@/lib/database/audit.db';
import Link from 'next/link';

export default function AuditPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalRows, setTotalRows] = useState(0);
    const pageSize = 20;
    const [tableFilter, setTableFilter] = useState('');

    useEffect(() => {
        fetchLogs();
    }, [page, tableFilter]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const { data, totalRows } = await getAuditLogs(page, pageSize, tableFilter || undefined);
            setLogs(data);
            setTotalRows(totalRows);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatAction = (action: string) => {
        switch (action) {
            case 'INSERT': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">CREAR</span>;
            case 'UPDATE': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-bold">EDITAR</span>;
            case 'DELETE': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-bold">BORRAR</span>;
            default: return action;
        }
    };

    const renderDiff = (oldData: any, newData: any) => {
        if (!oldData && newData) return <div className="text-gray-500 italic">Registro nuevo</div>;
        if (oldData && !newData) return <div className="text-red-500 italic">Datos eliminados</div>;

        // Find modified keys
        const allKeys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);
        const changes: React.ReactNode[] = [];

        allKeys.forEach(key => {
            const oldVal = oldData?.[key];
            const newVal = newData?.[key];

            // Deep comparison for JSON
            if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
                changes.push(
                    <div key={key} className="mb-1 text-xs">
                        <span className="font-semibold text-gray-600">{key}:</span>{" "}
                        <span className="text-red-500 line-through mr-1">{JSON.stringify(oldVal)}</span>
                        <span className="text-green-600 font-bold">→ {JSON.stringify(newVal)}</span>
                    </div>
                );
            }
        });

        return changes.length > 0 ? (
            <div className="space-y-1">{changes}</div>
        ) : (
            <div className="text-gray-400 italic">Sin cambios detectados en campos principales</div>
        );
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#2D4A3E]">Registro de Auditoría</h1>
                    <p className="text-gray-500 mt-1">Historial completo de cambios en el sistema</p>
                </div>
                <Link href="/admin" className="text-sm font-semibold text-gray-500 hover:text-[#2D4A3E]">
                    ← Volver al Panel
                </Link>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b flex gap-4">
                    <select
                        className="p-2 border rounded-lg text-sm"
                        value={tableFilter}
                        onChange={(e) => { setTableFilter(e.target.value); setPage(1); }}
                    >
                        <option value="">Todas las tablas</option>
                        <option value="operations">Operaciones</option>
                        <option value="customers">Clientes</option>
                        <option value="inventory_items">Inventario</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider font-semibold">
                            <tr>
                                <th className="px-6 py-4">Fecha/Hora</th>
                                <th className="px-6 py-4">Acción</th>
                                <th className="px-6 py-4">Tabla</th>
                                <th className="px-6 py-4">ID Registro</th>
                                <th className="px-6 py-4">Cambios</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        Cargando logs...
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        No se encontraron registros.
                                    </td>
                                </tr>
                            ) : logs.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                        {new Date(log.created_at).toLocaleString('es-CL')}
                                    </td>
                                    <td className="px-6 py-4">{formatAction(log.action)}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                                            {log.table_name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-mono text-gray-400">
                                        {log.record_id.substring(0, 8)}...
                                    </td>
                                    <td className="px-6 py-4">
                                        {renderDiff(log.old_data, log.new_data)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
                    <span className="text-xs text-gray-400">
                        Página {page} de {Math.ceil(totalRows / pageSize) || 1} ({totalRows} logs)
                    </span>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1 border rounded bg-white disabled:opacity-30 text-xs font-bold"
                        >
                            Anterior
                        </button>
                        <button
                            disabled={page >= Math.ceil(totalRows / pageSize)}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 border rounded bg-white disabled:opacity-30 text-xs font-bold"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
