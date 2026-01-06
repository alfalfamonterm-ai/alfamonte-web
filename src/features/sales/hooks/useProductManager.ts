import { useState, useEffect } from 'react';
import { Product, CreateProductDTO } from '../types';
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/lib/database/products.db';

export const useProductManager = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (err) {
            console.error("Error fetching products:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const saveProduct = async (formData: Partial<Product>) => {
        try {
            if (editingProduct) {
                await updateProduct(editingProduct.id, formData);
            } else {
                // New Product
                const slug = formData.title?.toLowerCase().replace(/ /g, '-') || 'item-' + Date.now();
                await createProduct({ ...formData, slug } as CreateProductDTO);
            }
            await fetchProducts();
            setIsModalOpen(false);
            setEditingProduct(null);
            return true;
        } catch (err: any) {
            alert('Error saving product: ' + err.message);
            return false;
        }
    };

    const removeProduct = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;
        try {
            await deleteProduct(id);
            await fetchProducts();
        } catch (err: any) {
            alert('Error deleting product: ' + err.message);
        }
    };

    const openEdit = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const openNew = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    return {
        products,
        loading,
        isModalOpen,
        setIsModalOpen,
        editingProduct,
        openEdit,
        openNew,
        saveProduct,
        removeProduct
    };
};
