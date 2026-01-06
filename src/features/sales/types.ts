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
