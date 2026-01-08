export interface Product {
    id: string;
    slug: string;
    title: string;
    price: number;
    weight?: string;
    description?: string;
    image_src?: string;
    category?: string;
    features?: string[];
    stock: number;
    created_at?: string;
}

export interface CreateProductDTO {
    title: string;
    slug: string; // usually auto-generated from title
    price: number;
    stock: number;
    description?: string;
    category?: string;
    image_src?: string;
}