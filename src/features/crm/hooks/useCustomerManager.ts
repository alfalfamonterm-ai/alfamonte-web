import { useState, useEffect } from 'react';
import { Customer } from '../types';
import { getCustomers, createCustomer } from '@/lib/database/crm.db';

export const useCustomerManager = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    // Add Form State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const data = await getCustomers();
            setCustomers(data);
        } catch (err: any) {
            console.error("Failed to fetch customers", err);
        } finally {
            setLoading(false);
        }
    };

    const addCustomer = async (data: any) => {
        try {
            await createCustomer(data);
            await fetchCustomers();
            setIsAddModalOpen(false);
            return true;
        } catch (err: any) {
            alert('Error creating customer: ' + err.message);
            return false;
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    return {
        customers,
        loading,
        refresh: fetchCustomers,
        isAddModalOpen,
        setIsAddModalOpen,
        addCustomer
    };
};
