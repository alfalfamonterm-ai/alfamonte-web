export type CustomerType = 'particular' | 'empresa' | 'distribuidor';
export type CustomerStatus = 'active' | 'inactive' | 'blocked';

export interface Customer {
    id: string;
<<<<<<< HEAD
    customer_number?: string;
=======
    customer_number?: string; // NEW: C-0001, C-0002, etc.
>>>>>>> 4af7fc6 (Fix: Aplicado downgrade de Next.js y React a versiones estables)
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    rut?: string;
    type: CustomerType;
    status: CustomerStatus;
    total_purchased: number;
    last_purchase_date?: string;
    created_at?: string;
    notes?: string;
<<<<<<< HEAD
    data_complete?: boolean;
=======
    data_complete?: boolean; // NEW: Flag for incomplete customer data
>>>>>>> 4af7fc6 (Fix: Aplicado downgrade de Next.js y React a versiones estables)
}

export interface CreateCustomerDTO {
    name: string;
    email?: string;
    phone?: string;
    type?: CustomerType;
    rut?: string;
    notes?: string;
}
