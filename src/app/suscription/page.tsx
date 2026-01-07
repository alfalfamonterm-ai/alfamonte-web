import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";

export default function SubscriptionPage() {
    const plans = [
        {
            name: "Plan Quincenal",
            discount: "10% OFF",
            description: "Recibe tu heno fresco cada 2 semanas. Ideal para 1-2 conejos.",
            frequency: "Cada 15 días",
            popular: true,
        },
        {
            name: "Plan Mensual",
            discount: "5% OFF",
            description: "Una entrega grande al mes. Perfecto para quienes tienen espacio de almacenamiento.",
            frequency: "Cada 30 días",
            popular: false,
        }
    ];

    return (
        <main className="min-h-screen pt-24 pb-12 bg-[#F4F1EA]">
            <Navbar />

            <div className="container">
                <header className="text-center mb-16">
                    <span className="inline-block py-1 px-3 rounded-full bg-[#E8F5E9] text-[#2D4A3E] text-sm font-bold mb-4 tracking-wide uppercase">
                        Club Alfa.Monte
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold font-merriweather text-[#2D4A3E] mb-6">
                        Nunca te quedes sin heno
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Suscríbete y olvídate de pedir. Nosotros nos encargamos de que tu mascota siempre tenga lo mejor del campo.
                    </p>
                </header>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {plans.map((plan, i) => (
                        <div key={i} className={`bg-white p-8 rounded-2xl shadow-sm border-2 ${plan.popular ? 'border-[#2D4A3E] relative' : 'border-transparent'}`}>
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#2D4A3E] text-white px-4 py-1 rounded-full text-sm font-bold">
                                    Más Popular
                                </div>
                            )}

                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-[#2D4A3E] mb-2">{plan.name}</h3>
                                <p className="text-[#8B5E3C] font-bold text-lg">{plan.discount}</p>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-start gap-3">
                                    <span className="text-green-500 text-xl">✓</span>
                                    <p className="text-gray-600">Despacho automático {plan.frequency}</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-green-500 text-xl">✓</span>
                                    <p className="text-gray-600">Sin contratos, cancela cuando quieras</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-green-500 text-xl">✓</span>
                                    <p className="text-gray-600">Cobro automático vía Mercado Pago</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-green-500 text-xl">✓</span>
                                    <p className="text-gray-600">{plan.description}</p>
                                </div>
                            </div>

                            <Button fullWidth variant={plan.popular ? 'primary' : 'outline'}>
                                Elegir {plan.name}
                            </Button>
                        </div>
                    ))}
                </div>

                <section className="mt-24 text-center">
                    <h2 className="text-3xl font-bold text-[#2D4A3E] mb-8 font-merriweather">¿Cómo funciona?</h2>
                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            { step: "1", title: "Elige tu Plan", desc: "Define la frecuencia y la cantidad de heno." },
                            { step: "2", title: "Pago Automático", desc: "Nosotros gestionamos el cobro de forma segura." },
                            { step: "3", title: "Recibe Feliz", desc: "Tu heno llega fresco a tu puerta." }
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full bg-[#2D4A3E] text-white flex items-center justify-center text-2xl font-bold mb-4">
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-bold text-[#2D4A3E] mb-2">{item.title}</h3>
                                <p className="text-gray-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
