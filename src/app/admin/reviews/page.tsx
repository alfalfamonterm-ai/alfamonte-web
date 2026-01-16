"use client";

import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Star, CheckCircle, XCircle, Trash2, MessageSquare } from 'lucide-react';

export default function ReviewsAdminPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('reviews')
            .select('*, orders(external_reference)')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setReviews(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleUpdateStatus = async (id: string, status: string) => {
        const { error } = await supabase
            .from('reviews')
            .update({ status })
            .eq('id', id);

        if (!error) {
            fetchReviews();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta reseña?')) return;
        const { error } = await supabase.from('reviews').delete().eq('id', id);
        if (!error) fetchReviews();
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-[#2D4A3E] font-merriweather">Gestión de Reseñas</h1>
                    <p className="text-gray-500">Modera y responde a las opiniones de tus clientes.</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                    <span className="text-2xl font-bold text-[#2D4A3E]">{reviews.length}</span>
                    <span className="text-xs text-gray-500 ml-2 uppercase font-bold">Total Reseñas</span>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#2D4A3E] text-white">
                            <tr>
                                <th className="p-4 text-sm font-semibold">Fecha</th>
                                <th className="p-4 text-sm font-semibold">Cliente</th>
                                <th className="p-4 text-sm font-semibold">Rating</th>
                                <th className="p-4 text-sm font-semibold">Comentario</th>
                                <th className="p-4 text-sm font-semibold">Estado</th>
                                <th className="p-4 text-sm font-semibold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={6} className="p-8 text-center text-gray-400">Cargando reseñas...</td></tr>
                            ) : reviews.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-gray-400">No hay reseñas aún.</td></tr>
                            ) : (
                                reviews.map((review) => (
                                    <tr key={review.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="p-4 text-sm text-gray-600">
                                            {new Date(review.created_at).toLocaleDateString()}
                                            <div className="text-xs text-gray-400 font-mono mt-1">
                                                {review.orders?.external_reference || 'S/ Orden'}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-gray-800">{review.customer_name || 'Anónimo'}</div>
                                            <div className="text-xs text-gray-500">{review.customer_email}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex text-yellow-500">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-gray-300"} />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600 max-w-xs italic">
                                            "{review.comment}"
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${review.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                    review.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {review.status === 'approved' ? 'Aprobada' : review.status === 'rejected' ? 'Rechazada' : 'Pendiente'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                {review.status !== 'approved' && (
                                                    <button onClick={() => handleUpdateStatus(review.id, 'approved')} title="Aprobar" className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100">
                                                        <CheckCircle size={18} />
                                                    </button>
                                                )}
                                                {review.status !== 'rejected' && (
                                                    <button onClick={() => handleUpdateStatus(review.id, 'rejected')} title="Rechazar" className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                                                        <XCircle size={18} />
                                                    </button>
                                                )}
                                                <button onClick={() => handleDelete(review.id)} title="Eliminar" className="p-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
