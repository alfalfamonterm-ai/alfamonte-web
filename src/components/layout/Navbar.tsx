"use client";

import Link from 'next/link';
import NextImage from 'next/image';
import { useCart } from '@/contexts/CartContext';

export default function Navbar() {
    const { getItemCount } = useCart();
    const itemCount = getItemCount();

    return (
        <nav className="w-full py-4 px-6 fixed top-0 left-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo Section */}
                <Link href="/" className="flex items-center gap-3">
                    <div className="relative w-12 h-12">
                        <NextImage
                            src="/images/logo.png"
                            alt="Alfa.Monte Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <span className="text-xl font-bold text-[#2D4A3E] font-merriweather hidden md:block">
                        Alfa.Monte
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex gap-8 items-center">
                    <Link href="/shop" className="text-[#2D4A3E] hover:text-[#8B5E3C] transition-colors font-medium">
                        Tienda
                    </Link>
                    <Link href="/suscription" className="text-[#2D4A3E] hover:text-[#8B5E3C] transition-colors font-medium">
                        Suscripción
                    </Link>
                    <Link href="/blog" className="text-[#2D4A3E] hover:text-[#8B5E3C] transition-colors font-medium">
                        Blog
                    </Link>
                    <Link href="/about" className="text-[#2D4A3E] hover:text-[#8B5E3C] transition-colors font-medium">
                        Nosotros
                    </Link>
                </div>

                {/* Icons */}
                <div className="flex items-center gap-4">
                    <Link href="/account" className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Mi Cuenta">
                        <span className="text-2xl">👤</span>
                    </Link>
                    <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <span className="text-2xl">🛒</span>
                        {itemCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-[#8B5E3C] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {itemCount}
                            </span>
                        )}
                    </Link>
                    <Link href="/admin" className="px-4 py-2 bg-[#2D4A3E] text-white rounded-md hover:bg-[#3E6052] transition-colors">
                        Admin
                    </Link>
                </div>
            </div>
        </nav>
    );
}
