import React from 'react';
import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';

interface BlogRecommendationsProps {
    category: string;
}

export const BlogRecommendations: React.FC<BlogRecommendationsProps> = ({ category }) => {
    const allPosts = getAllPosts();

    // Filter posts by category match (fuzzy)
    const relatedPosts = allPosts.filter(post =>
        post.category.toLowerCase().includes(category.toLowerCase()) ||
        category.toLowerCase().includes(post.category.toLowerCase())
    ).slice(0, 2);

    if (relatedPosts.length === 0) return null;

    return (
        <section className="py-12 bg-[#F4F1EA]/30 rounded-3xl px-8 mb-12">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold font-merriweather text-[#2D4A3E]">Guías de Cuidados para {category}</h2>
                    <p className="text-gray-600">Aprende más sobre cómo alimentar y cuidar a tu mascota.</p>
                </div>
                <Link href="/blog" className="text-[#8B5E3C] font-bold hover:underline">Ir al Blog →</Link>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {relatedPosts.map(post => (
                    <Link key={post.slug} href={`/blog/${post.slug}`} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group transition-all hover:shadow-md">
                        <span className="text-xs font-bold text-[#8B5E3C] uppercase tracking-widest mb-2 block">{post.category}</span>
                        <h3 className="text-lg font-bold text-[#2D4A3E] group-hover:text-[#8B5E3C] transition-colors mb-3">{post.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
                    </Link>
                ))}
            </div>
        </section>
    );
};
