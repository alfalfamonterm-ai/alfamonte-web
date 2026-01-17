import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase';

export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image_url?: string;
}

export const useCategories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('product_categories')
                .select('*')
                .order('name');

            if (error) throw error;
            setCategories(data || []);
        } catch (err) {
            console.error('Error fetching categories:', err);
            // Fallback to initial hardcoded ones if table not ready
            setCategories([
                { id: '1', name: 'Fardos', slug: 'fardos' },
                { id: '2', name: 'Pellets', slug: 'pellets' },
                { id: '3', name: 'Semillas', slug: 'semillas' },
                { id: '4', name: 'Servicios', slug: 'servicios' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const addCategory = async (name: string) => {
        const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
        const { data, error } = await supabase
            .from('product_categories')
            .insert([{ name, slug }])
            .select()
            .single();

        if (!error && data) {
            setCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
            return data;
        }
        return null;
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return { categories, loading, addCategory, refreshCategories: fetchCategories };
};
