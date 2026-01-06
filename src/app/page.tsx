import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/ui/ProductCard";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen pt-16">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center bg-[#2D4A3E] text-white">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <div className="absolute inset-0 z-0 opacity-50">
          <Image
            src="/images/hero.jpg"
            alt="Fondo de campo de alfalfa"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>

        <div className="container relative z-20 text-center">
          <div className="max-w-4xl mx-auto bg-black/30 backdrop-blur-sm p-8 md:p-12 rounded-3xl shadow-2xl border border-white/10">
            <span className="inline-block py-1 px-3 rounded-full bg-[#8B5E3C] text-white text-sm font-bold mb-6 tracking-wide uppercase shadow-lg">
              Directo del Valle del Maipo (El Monte)
            </span>
            <h1 className="text-5xl md:text-7xl font-bold font-merriweather mb-6 leading-tight drop-shadow-lg">
              La Alfalfa Más Fresca <br /> para tu Mascota
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-gray-100 drop-shadow-md">
              Cosechada a mano en El Monte. Sin procesar, 100% natural y llena de nutrientes para tu conejo o cobaya.
            </p>
            <div className="flex gap-4 justify-center">
              <Button className="text-lg px-8 py-4 shadow-xl hover:scale-105 transition-transform">
                Ver Packs Disponibles
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Pet Category */}
      <section className="py-20 bg-[#E8F5E9]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-[#2D4A3E] mb-12 font-merriweather">Busca por Mascota</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Conejo Junior", icon: "🐰", desc: "Crecimiento" },
              { name: "Conejo Adulto", icon: "🐇", desc: "Mantención" },
              { name: "Cuyes", icon: "🐹", desc: "Vit. C Boost" },
              { name: "Aves", icon: "🐔", desc: "Anti-Estrés" },
            ].map((pet, i) => (
              <a href="/shop" key={i} className="bg-white p-6 rounded-xl hover:shadow-lg transition-all hover:scale-105 block group">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{pet.icon}</div>
                <h3 className="font-bold text-[#2D4A3E]">{pet.name}</h3>
                <p className="text-sm text-gray-500">{pet.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white">

        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#2D4A3E] mb-4">¿Por qué Alfa.Monte?</h2>
            <p className="text-lg text-gray-600">No es solo heno, es salud para tu pequeño amigo.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: "🌿",
                title: "100% Frescura de Campo",
                desc: "Cosechada y empacada localmente. Evita el heno seco y polvoriento que viaja meses en contenedores."
              },
              {
                icon: "🐇",
                title: "Selección Manual",
                desc: "Revisamos cada pack para asegurar hojas verdes y tallos crujientes. 0% malezas nocivas."
              },
              {
                icon: "🚛",
                title: "A la Puerta de tu Casa",
                desc: "Despacho propio en RM. Olvídate de cargar fardos pesados o bolsas incómodas."
              }
            ].map((feature, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-[#F9F9F9] hover:bg-[#F4F1EA] transition-colors">
                <div className="text-6xl mb-6">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-[#2D4A3E] mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Highlight Section */}
      <section className="py-24 bg-[#F4F1EA]">
        <div className="container">
          <h2 className="text-4xl font-bold text-[#2D4A3E] mb-12 text-center">Nuestros Formatos</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <ProductCard
              id="bolsa-1kg"
              title="La Bolsita Diaria"
              price={3990}
              weight="1 Kg"
              slug="bolsa-1kg"
              imageSrc="/images/product-1kg.jpg"
              description="Ideal para una semana de frescura."
              category="Alfalfa"
              stock={100}
            />
            <ProductCard
              id="pack-2-5kg"
              title="Pack Semanal (Estrella)"
              price={8990}
              weight="2.5 Kg"
              slug="pack-2-5kg"
              imageSrc="/images/product-2_5kg.jpg"
              description="Nuestro formato más vendido."
              category="Alfalfa"
              stock={100}
            />
            <ProductCard
              id="caja-5kg"
              title="Caja Familiar"
              price={15990}
              weight="5 Kg"
              slug="caja-5kg"
              imageSrc="/images/product-5kg.jpg"
              description="Para familias con múltiples mascotas."
              category="Alfalfa"
              stock={100}
            />
          </div>

          <div className="text-center mt-12">
            <p className="text-[#8B5E3C] font-bold mb-4">¿Tienes un refugio o necesitas más?</p>
            <Button variant="outline">Contáctanos por Mayor</Button>
          </div>
        </div>
      </section>
      {/* Blog Teaser */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#2D4A3E] mb-12 text-center font-merriweather">Aprende con Alfa.Monte</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "¿Cuánto come un conejo bebé?", cat: "Conejos", img: "🐰" },
              { title: "Huevos naranjas: El secreto", cat: "Aves", img: "🥚" },
              { title: "La importancia de la fibra", cat: "Nutrición", img: "🌾" }
            ].map((post, i) => (
              <article key={i} className="group cursor-pointer">
                <div className="bg-gray-100 h-48 rounded-2xl mb-4 flex items-center justify-center text-6xl group-hover:bg-[#E8F5E9] transition-colors">
                  {post.img}
                </div>
                <span className="text-xs font-bold text-[#8B5E3C] uppercase tracking-wider">{post.cat}</span>
                <h3 className="text-xl font-bold text-[#2D4A3E] group-hover:text-[#3E6052] transition-colors">{post.title}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
