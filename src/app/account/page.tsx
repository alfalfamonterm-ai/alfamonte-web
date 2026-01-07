"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { getCustomerProfile, getCustomerOrders, getLoyaltyHistory } from '@/features/account/lib/account.db';
import supabase from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AccountDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [loyaltyHistory, setLoyaltyHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showLoyaltyModal, setShowLoyaltyModal] = useState(false);
    const [isSecurityLoading, setIsSecurityLoading] = useState(false);
    const [newPass, setNewPass] = useState('');
    const [passMessage, setPassMessage] = useState('');

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                // Check if we are in demo mode (local testing only)
                const demoEmail = localStorage.getItem('dev_demo_email');
                if (demoEmail) {
                    const mockUser = { email: demoEmail, is_demo: true };
                    setUser(mockUser);
                    try {
                        const p = await getCustomerProfile(demoEmail);
                        setProfile(p);
                        const o = await getCustomerOrders(demoEmail);
                        setOrders(o);
                    } catch (err) { console.error(err); }
                    setLoading(false);
                } else {
                    router.push('/login');
                }
                return;
            }
            setUser(user);

            try {
                const p = await getCustomerProfile(user.email!);
                setProfile(p);
                const o = await getCustomerOrders(user.email!);
                setOrders(o);
                if (p?.id) {
                    const h = await getLoyaltyHistory(p.id);
                    setLoyaltyHistory(h);
                }
            } catch (err) {
                console.error("Error loading profile", err);
            } finally {
                setLoading(false);
            }
        };
        checkUser();
    }, [router]);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSecurityLoading(true);
        setPassMessage('');
        try {
            const { error } = await supabase.auth.updateUser({ password: newPass });
            if (error) throw error;

            // Lock points in DB if this was a temp account
            if (profile && !profile.points_locked) {
                await supabase.from('customers').update({
                    points_locked: true,
                    points_expires_at: null
                }).eq('id', profile.id);

                // Fetch the API to send notification emails
                await fetch('/api/account/security-notify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: user.email })
                });

                setProfile({ ...profile, points_locked: true, points_expires_at: null });
            }

            setPassMessage('✅ Contraseña actualizada correctamente.');
            setNewPass('');
        } catch (err: any) {
            setPassMessage(`❌ Error: ${err.message}`);
        } finally {
            setIsSecurityLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    if (loading) return <div className="min-h-screen py-32 text-center text-gray-400 font-medium italic">Cargando tu cuenta...</div>;

    return (
        <main className="min-h-screen bg-gray-50 pt-24 pb-20">
            <Navbar />
            <div className="container mx-auto px-4 max-w-5xl">
                <header className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-[#2D4A3E] font-merriweather mb-1">
                            Hola, {profile?.name || user?.email?.split('@')[0]}
                        </h1>
                        <p className="text-gray-500 font-medium italic">Bienvenido a tu rincón Alfa.Monte</p>
                    </div>
                    <button onClick={handleLogout} className="text-sm font-bold text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl transition-all">
                        Cerrar Sesión
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-[#2D4A3E]">
                    {/* Left Column: Loyalty & Quick Stats */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Loyalty Card */}
                        <div className="bg-[#2D4A3E] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-[#2D4A3E]/30">
                            <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">🌿</div>
                            <h2 className="text-xs font-bold uppercase tracking-widest opacity-70 mb-6 font-sans">Club Alfa.Monte</h2>
                            <div className="flex items-baseline gap-2">
                                <span className="text-6xl font-black font-merriweather">{profile?.reward_points || 0}</span>
                                <span className="text-xl font-bold opacity-80">pts</span>
                            </div>

                            {profile?.points_expires_at && !profile?.points_locked && (
                                <div className="mt-4 p-3 bg-yellow-400/20 border border-yellow-400/30 rounded-xl">
                                    <p className="text-[10px] font-bold uppercase text-yellow-100 mb-1 animate-pulse">⚠️ Puntos Provisorios</p>
                                    <p className="text-xs opacity-90">Asegura tus puntos cambiando tu contraseña antes de 24h.</p>
                                </div>
                            )}

                            <div className="mt-8 flex flex-col gap-3">
                                <button
                                    onClick={() => setShowLoyaltyModal(true)}
                                    className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all"
                                >
                                    Ver Mi Historial
                                </button>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-yellow-400" style={{ width: `${Math.min((profile?.reward_points || 0) / 5, 100)}%` }}></div>
                                </div>
                                <p className="text-[10px] uppercase font-bold tracking-tighter opacity-60">Próximo premio a los 500 pts</p>
                            </div>
                        </div>

                        {/* Security Card */}
                        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">Seguridad</h3>
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Nueva Contraseña</p>
                                    <input
                                        type="password"
                                        value={newPass}
                                        onChange={(e) => setNewPass(e.target.value)}
                                        required
                                        className="w-full p-3 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-[#2D4A3E]/10"
                                        placeholder="Min. 6 caracteres"
                                    />
                                </div>
                                <button
                                    disabled={isSecurityLoading}
                                    className="w-full py-3 bg-[#2D4A3E] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#2D4A3E]/20 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                                >
                                    {isSecurityLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                                </button>
                                {passMessage && <p className="text-[10px] font-bold text-center mt-2">{passMessage}</p>}
                            </form>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm space-y-4">
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-2">Mi Gestión</h3>
                            <Link href="/account/subscriptions" className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group hover:bg-[#2D4A3E]/5 transition-all">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">📅</span>
                                    <span className="font-bold">Mis Suscripciones</span>
                                </div>
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </Link>
                            <Link href="/shop" className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group hover:bg-[#2D4A3E]/5 transition-all">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">🛒</span>
                                    <span className="font-bold">Volver a la Tienda</span>
                                </div>
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Order History */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm min-h-[500px]">
                            <h2 className="text-2xl font-bold mb-6 font-merriweather">Historial de Pedidos</h2>

                            {orders.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                    <span className="text-5xl mb-4 grayscale opacity-50">🌾</span>
                                    <p className="text-gray-400 font-medium">Aún no tienes pedidos registrados.</p>
                                    <Link href="/shop" className="mt-4 text-[#2D4A3E] font-bold underline">¡Empieza a comprar!</Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map(order => (
                                        <div key={order.id} className="border border-gray-50 rounded-2xl p-6 hover:border-gray-200 transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Orden #{order.id.slice(0, 8).toUpperCase()}</p>
                                                    <p className="font-bold text-lg">{new Date(order.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                                </div>
                                                <Link
                                                    href={`/track/${order.id}`}
                                                    className="bg-green-50 text-green-700 px-4 py-2 rounded-xl text-xs font-bold border border-green-100 hover:bg-green-100 transition-all"
                                                >
                                                    Hacer Seguimiento
                                                </Link>
                                            </div>

                                            <div className="flex gap-4 items-center">
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-600 italic">
                                                        {order.order_items?.map((it: any) => `${it.quantity}x ${it.product_title}`).join(', ')}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total</p>
                                                    <p className="font-bold text-xl">${Number(order.total_amount).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Loyalty Modal */}
            {showLoyaltyModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="bg-[#2D4A3E] p-8 text-white relative">
                            <button onClick={() => setShowLoyaltyModal(false)} className="absolute top-4 right-4 text-2xl opacity-50 hover:opacity-100">×</button>
                            <h3 className="text-2xl font-bold font-merriweather">Historial de Puntos</h3>
                            <p className="text-white/60 text-sm">Tu camino en el club Alfa.Monte</p>
                        </div>
                        <div className="p-8 max-h-[60vh] overflow-y-auto">
                            {loyaltyHistory.length === 0 ? (
                                <p className="text-center text-gray-400 italic py-12">Aún no hay transacciones de puntos.</p>
                            ) : (
                                <div className="space-y-6">
                                    {loyaltyHistory.map(item => (
                                        <div key={item.id} className="flex justify-between items-center pb-4 border-b border-gray-50">
                                            <div>
                                                <p className="font-bold text-[#2D4A3E]">{item.reason || 'Compra'}</p>
                                                <p className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString('es-CL')}</p>
                                            </div>
                                            <span className={`font-black text-lg ${item.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                {item.amount > 0 ? `+${item.amount}` : item.amount}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
