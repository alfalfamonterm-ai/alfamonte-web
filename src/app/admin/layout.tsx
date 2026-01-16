import Link from 'next/link';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-[#2D4A3E] text-white flex-shrink-0 hidden md:block">
                <div className="p-6">
                    <h2 className="text-xl font-bold font-merriweather">Admin Alfa.Monte</h2>
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    <Link href="/admin" className="block px-4 py-3 rounded-lg hover:bg-white/10 transition-colors">
                        📊 Panel de Control
                    </Link>
                    <Link href="/admin/operations" className="block px-4 py-3 rounded-lg hover:bg-white/10 transition-colors">
                        🚜 Operaciones (ERP)
                    </Link>
                    <Link href="/admin/inventory" className="block px-4 py-3 rounded-lg hover:bg-white/10 transition-colors">
                        📦 Inventario de Activos
                    </Link>
                    <Link href="/admin/inventory/inputs" className="block px-4 py-3 rounded-lg hover:bg-white/10 transition-colors pl-8 text-sm opacity-80">
                        🚜 Control de Insumos
                    </Link>
                    <Link href="/admin/alerts" className="block px-4 py-3 rounded-lg hover:bg-white/10 transition-colors">
                        🔔 Centro de Alertas
                    </Link>
                    <Link href="/admin/orders" className="block px-4 py-3 rounded-lg hover:bg-white/10 transition-colors">
                        🛒 Pedidos
                    </Link>
                    <Link href="/admin/logistics" className="block px-4 py-3 rounded-lg hover:bg-white/10 transition-colors">
                        🚚 Logística
                    </Link>
                    <Link href="/admin/sales/products" className="block px-4 py-3 rounded-lg hover:bg-white/10 transition-colors">
                        🏷️ Productos Web
                    </Link>
                    <Link href="/admin/crm" className="block px-4 py-3 rounded-lg hover:bg-white/10 transition-colors">
                        👥 CRM Clientes
                    </Link>
                    <Link href="/admin/reviews" className="block px-4 py-3 rounded-lg hover:bg-white/10 transition-colors">
                        ⭐ Reseñas
                    </Link>
                    <Link href="/admin/audit" className="block px-4 py-3 rounded-lg hover:bg-white/10 transition-colors">
                        🛡️ Registro de Auditoría
                    </Link>
                    <Link href="/admin/settings" className="block px-4 py-3 rounded-lg hover:bg-white/10 transition-colors">
                        ⚙️ Configuración Web
                    </Link>
                    <div className="pt-8 border-t border-white/10 mt-8">
                        <Link href="/" className="block px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-yellow-200 text-sm">
                            ← Volver al Sitio
                        </Link>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
