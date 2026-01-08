export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product_title: string;
    created_at?: string;
}

// Interfaz para el cliente (ya corregida)
interface CustomerInfo {
    name: string;
    email: string;
    phone: string; 
}

// NUEVA INTERFAZ: Define la estructura de la dirección de envío
export interface ShippingAddress {
    address: string; // El campo que faltaba
    city: string;
    region: string;
    // Agrega aquí cualquier otro campo que uses (ej: postalCode)
}

export interface Order {
    id: string;
    customer_id?: string;
    customer?: CustomerInfo; 
    guest_info?: any;

    total_amount: number;
    subtotal: number;
    shipping_cost: number;

    status: OrderStatus;
    payment_status: PaymentStatus;
    payment_method?: string;

    // CORRECCIÓN CLAVE: shipping_address ahora es un objeto, no un string
    shipping_address?: ShippingAddress; 
    
    shipping_method?: string;

    created_at: string;
    updated_at: string;
    notes?: string;

    items?: OrderItem[]; 
}

export interface CreateOrderDTO {
    customer_id?: string;
    guest_info?: any;
    items: { product_id: string, quantity: number, unit_price: number, product_title: string }[];
    shipping_cost?: number;
    shipping_method?: string;
    // ASUMIMOS que el DTO también usa la nueva estructura
    shipping_address?: ShippingAddress; 
    notes?: string;
}