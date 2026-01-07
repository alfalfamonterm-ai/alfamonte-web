import Link from 'next/link';
import Navbar from "@/components/layout/Navbar";
import { blogPosts } from "@/lib/posts";

export default function BlogIndexPage() {
    return (
        <main className="min-h-screen pt-24 pb-12 bg-[#F4F1EA]">
            <Navbar />

            <div className="container mx-auto px-4">
                <header className="text-center mb-16">
                    <h1 className="text-4xl font-bold font-merriweather text-[#2D4A3E] mb-4">
                        Blog Alfa.Monte
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Consejos, guías y secretos de campo para el bienestar de tus pequeños amigos.
                    </p>
                </header>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogPosts.map((post) => (
                        <Link href={`/blog/${post.slug}`} key={post.id} className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="h-48 bg-gray-200 overflow-hidden">
                                <div className="w-full h-full bg-[#E8F5E9] flex items-center justify-center text-4xl group-hover:scale-105 transition-transform">
                                    {post.category === 'Conejos' ? '🐰' : post.category === 'Aves' ? '🐔' : '🐹'}
                                </div>
                            </div>
                            <div className="p-6">
                                <span className="text-xs font-bold text-[#8B5E3C] uppercase tracking-wider mb-2 block">
                                    {post.category}
                                </span>
                                <h2 className="text-xl font-bold text-[#2D4A3E] mb-3 group-hover:text-[#3E6052] transition-colors">
                                    {post.title}
                                </h2>
                                <p className="text-gray-600 mb-4 line-clamp-2">
                                    {post.excerpt}
                                </p>
                                <div className="flex justify-between items-center text-sm text-gray-500">
                                    <span>{post.date}</span>
                                    <span>Ler más →</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}
