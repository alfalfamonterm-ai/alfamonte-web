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

export interface Order {
    id: string;
    customer_id?: string;
<<<<<<< HEAD
    customer?: { name: string, email: string };
    guest_info?: any;
    total_amount: number;
    subtotal: number;
    shipping_cost: number;
    status: OrderStatus;
    payment_status: PaymentStatus;
    payment_method?: string;
    shipping_address?: string;
    shipping_method?: string;
    created_at: string;
    updated_at: string;
    notes?: string;
    items?: OrderItem[];
=======
    customer?: { name: string, email: string }; // joined
    guest_info?: any;

    total_amount: number;
    subtotal: number;
    shipping_cost: number;

    status: OrderStatus;
    payment_status: PaymentStatus;
    payment_method?: string;

    shipping_address?: string;
    shipping_method?: string;

    created_at: string;
    updated_at: string;
    notes?: string;

    items?: OrderItem[]; // Joined
}

export interface CreateOrderDTO {
    customer_id?: string;
    guest_info?: any;
    items: { product_id: string, quantity: number, unit_price: number, product_title: string }[];
    shipping_cost?: number;
    shipping_method?: string;
    shipping_address?: string;
    notes?: string;
>>>>>>> 4af7fc6 (Fix: Aplicado downgrade de Next.js y React a versiones estables)
}
