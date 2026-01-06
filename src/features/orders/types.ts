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
}
