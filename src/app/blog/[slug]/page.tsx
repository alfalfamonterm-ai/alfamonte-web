import Navbar from "@/components/layout/Navbar";
import { getPostBySlug } from "@/lib/posts";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductAdBanner } from "@/components/blog/ProductAdBanner";

// Next.js 15+ Async Params
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    return (
        <main className="min-h-screen pt-24 pb-12 bg-white">
            <Navbar />

            <article className="container mx-auto px-4 max-w-3xl">
                <Link href="/blog" className="text-[#8B5E3C] font-semibold hover:underline mb-8 inline-block">
                    ← Volver al Blog
                </Link>

                <header className="mb-8">
                    <span className="inline-block px-3 py-1 bg-[#E8F5E9] text-[#2D4A3E] font-bold rounded-full text-sm mb-4">
                        {post.category}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold font-merriweather text-[#2D4A3E] mb-6 leading-tight">
                        {post.title}
                    </h1>
                    <div className="flex items-center gap-4 text-gray-500 text-sm">
                        <span>Por {post.author}</span>
                        <span>•</span>
                        <span>{post.date}</span>
                    </div>
                </header>

                <div className="prose prose-lg prose-green max-w-none text-gray-700">
                    <p className="lead text-xl text-gray-600 italic mb-8 border-l-4 border-[#8B5E3C] pl-4">
                        {post.excerpt}
                    </p>

                    {/* Render HTML content safely */}
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </div>

                <ProductAdBanner category={post.category} />

                <div className="mt-16 pt-8 border-t border-gray-100 text-center">
                    <p className="font-bold text-[#2D4A3E] mb-4">¿Te gustó este artículo?</p>
                    <Link href={`/shop?category=${encodeURIComponent(post.category)}`} className="inline-block px-8 py-3 bg-[#2D4A3E] text-white rounded-lg font-bold hover:bg-[#3E6052] transition-colors">
                        Ver Catálogo Especial para {post.category}
                    </Link>
                </div>
            </article>
        </main>
    );
}
