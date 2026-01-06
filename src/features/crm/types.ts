export type CustomerType = 'particular' | 'empresa' | 'distribuidor';
export type CustomerStatus = 'active' | 'inactive' | 'blocked';

export interface Customer {
    id: string;
    customer_number?: string; // NEW: C-0001, C-0002, etc.
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
    data_complete?: boolean; // NEW: Flag for incomplete customer data
}

export interface CreateCustomerDTO {
    name: string;
    email?: string;
    phone?: string;
    type?: CustomerType;
    rut?: string;
    notes?: string;
}
