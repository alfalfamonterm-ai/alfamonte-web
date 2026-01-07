import React, { useState, useRef, useEffect } from 'react';
import { useCustomerSearch } from '../hooks/useCustomerSearch';
import { Customer } from '../types';
import { Search, AlertCircle, Plus } from 'lucide-react';

interface CustomerSelectorProps {
    value: string; // Customer name
    onChange: (customer: Customer | null, isNew: boolean) => void;
    onSearchChange?: (name: string) => void;
    onNewCustomer?: () => void;
}

export const CustomerSelector: React.FC<CustomerSelectorProps> = ({
    value,
    onChange,
    onSearchChange,
    onNewCustomer
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { customers, loading } = useCustomerSearch(searchTerm);

    // Sync searchTerm with value prop (parent state)
    useEffect(() => {
        if (!isOpen) { // Only sync if dropdown is closed to avoid interrupting typing
            setSearchTerm(value || '');
        }
    }, [value, isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setSearchTerm(customer.name);
        setIsOpen(false);
        onChange(customer, false);
    };

    const handleNewCustomer = () => {
        setIsOpen(false);
        setSearchTerm(''); // Fix: Clear search term for new customer
        setSelectedCustomer(null); // Ensure no customer is selected
        onChange(null, true);
        if (onNewCustomer) onNewCustomer();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Cliente
            </label>

            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search size={18} />
                </div>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                        const val = e.target.value;
                        setSearchTerm(val);
                        setIsOpen(true);
                        if (onSearchChange) onSearchChange(val);
                        // If we are typing and have a customer selected, but start typing something else, deselect
                        if (selectedCustomer && val !== selectedCustomer.name) {
                            setSelectedCustomer(null);
                            onChange(null, true);
                        }
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Buscar por nombre, teléfono o ID..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-lg text-green-800 font-bold focus:ring-2 focus:ring-green-500 outline-none"
                />
                {selectedCustomer && !selectedCustomer.data_complete && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <AlertCircle size={20} className="text-orange-500" />
                    </div>
                )}
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-gray-500">Cargando...</div>
                    ) : customers.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            No se encontraron clientes
                        </div>
                    ) : (
                        <>
                            {customers.map((customer) => (
                                <button
                                    key={customer.id}
                                    type="button"
                                    onClick={() => handleSelectCustomer(customer)}
                                    className={`w-full text-left px-4 py-3 hover:bg-green-50 border-b border-gray-100 transition-colors ${!customer.data_complete ? 'bg-orange-50' : ''
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-800">
                                                    {customer.name}
                                                </span>
                                                {!customer.data_complete && (
                                                    <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded font-bold">
                                                        ⚠️ Incompleto
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                {customer.phone || 'Sin teléfono'}
                                            </div>
                                            {customer.email && (
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    {customer.email}
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-3">
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono font-bold">
                                                {customer.customer_number || 'Sin ID'}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </>
                    )}

                    {/* Create New Customer Option */}
                    <button
                        type="button"
                        onClick={handleNewCustomer}
                        className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 border-t-2 border-blue-200 transition-colors flex items-center gap-2 text-blue-700 font-bold"
                    >
                        <Plus size={18} />
                        <span>Crear Cliente Nuevo</span>
                    </button>
                </div>
            )}

            {/* Helper text */}
            {selectedCustomer && !selectedCustomer.data_complete && (
                <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    Este cliente tiene datos incompletos. Se solicitarán al guardar la venta.
                </p>
            )}
        </div>
    );
};
