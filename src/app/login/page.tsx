"use client";

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import supabase from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/account`,
                }
            });

            if (error) throw error;
            setMessage({ type: 'success', text: '¡Enlace enviado! Revisa tu correo para ingresar.' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Error al enviar el enlace.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen pt-32 pb-12 bg-[#F4F1EA]">
            <Navbar />
            <div className="container mx-auto px-4">
                <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
                    <div className="bg-[#2D4A3E] p-8 text-white text-center">
                        <h1 className="text-3xl font-bold font-merriweather mb-2">Mi Cuenta</h1>
                        <p className="opacity-80 text-sm font-medium">Ingresa para ver tus puntos y pedidos</p>
                    </div>

                    <div className="p-8">
                        {message && (
                            <div className={`p-4 rounded-xl mb-6 text-sm font-bold ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tu Correo Electrónico</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="ejemplo@correo.com"
                                    className="w-full p-4 bg-gray-50 border-0 rounded-2xl font-medium focus:ring-2 focus:ring-[#2D4A3E]/20 outline-none transition-all"
                                />
                            </div>

                            <Button fullWidth disabled={loading}>
                                {loading ? 'Enviando...' : 'Enviar Enlace de Acceso'}
                            </Button>
                        </form>

                        <div className="mt-8 pt-8 border-t text-center space-y-4">
                            <button
                                onClick={() => {
                                    localStorage.setItem('dev_demo_email', 'alfalfa.monte.rm@gmail.com');
                                    router.push('/account');
                                }}
                                className="text-sm font-bold text-[#2D4A3E] bg-[#2D4A3E]/10 px-6 py-3 rounded-2xl hover:bg-[#2D4A3E]/20 transition-all w-full"
                            >
                                🧪 Acceder como Test User (Demo)
                            </button>
                            <p className="text-xs text-gray-400 font-medium">
                                Usamos "Magic Links". Te enviaremos un correo con un enlace especial para entrar sin contraseña, manteniendo tu cuenta segura.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
