export default function AdminDashboard() {
    // Mock Data for Dashboard
    const stats = [
        { label: "Ventas Totales", value: "$1.250.000", trend: "+15%", color: "bg-blue-500" },
        { label: "Pedidos Mes", value: "45", trend: "+8%", color: "bg-green-500" },
        { label: "Suscriptores Activos", value: "12", trend: "+2", color: "bg-purple-500" },
        { label: "Tasa de Retención", value: "92%", trend: "Estable", color: "bg-orange-500" },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold text-[#2D4A3E] mb-8 font-merriweather">Panel de Control</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-gray-500 text-sm font-medium mb-2">{stat.label}</h3>
                        <div className="flex items-end justify-between">
                            <span className="text-3xl font-bold text-[#2D4A3E]">{stat.value}</span>
                            <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full font-medium">
                                {stat.trend}
                            </span>
                        </div>
                        <div className={`h-1 w-full mt-4 rounded-full ${stat.color} opacity-20`}>
                            <div className={`h-1 rounded-full ${stat.color} w-[70%]`}></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity Section */}
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold text-[#2D4A3E] mb-6">Últimos Pedidos</h2>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((order) => (
                            <div key={order} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100 last:border-0">
                                <div>
                                    <p className="font-bold text-[#2D4A3E]">Pedido #100{order}</p>
                                    <p className="text-sm text-gray-500">Hace {order * 2} horas</p>
                                </div>
                                <span className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full font-medium">
                                    Completado
                                </span>
                                <span className="font-bold text-[#8B5E3C]">$8.990</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold text-[#2D4A3E] mb-6">Próximos Despachos</h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map((route) => (
                            <div key={route} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                                <div className="text-2xl">🚛</div>
                                <div>
                                    <p className="font-bold text-[#2D4A3E]">Ruta Santiago Centro</p>
                                    <p className="text-sm text-gray-500">Mañana, 09:00 AM</p>
                                    <p className="text-xs text-[#8B5E3C] mt-1 font-semibold">{5 + route} Entregas pendientes</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
