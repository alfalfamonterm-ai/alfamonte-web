import { useEffect, useState } from 'react';
import { getCustomers } from '@/lib/database/crm.db';
import { Customer } from '../types';

export const useCustomerSearch = (searchTerm: string = '') => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            setLoading(true);
            const data = await getCustomers(500); // Increased limit for search
            setCustomers(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Filter customers based on search term
    const filteredCustomers = customers.filter(customer => {
        if (!searchTerm) return true;

        const search = searchTerm.toLowerCase();
        const matchName = customer.name?.toLowerCase().includes(search);
        const matchPhone = customer.phone?.toLowerCase().includes(search);
        const matchNumber = customer.customer_number?.toLowerCase().includes(search);
        const matchEmail = customer.email?.toLowerCase().includes(search);

        return matchName || matchPhone || matchNumber || matchEmail;
    });

    // Sort: incomplete first, then by name
    const sortedCustomers = [...filteredCustomers].sort((a, b) => {
        // Incomplete customers first
        if (a.data_complete !== b.data_complete) {
            return a.data_complete ? 1 : -1;
        }
        // Then alphabetically
        return (a.name || '').localeCompare(b.name || '');
    });

    return {
        customers: sortedCustomers,
        allCustomers: customers,
        loading,
        error,
        refresh: loadCustomers
    };
};
