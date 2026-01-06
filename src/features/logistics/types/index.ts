export type LogisticsStatus = 'processing' | 'warehouse' | 'dispatched' | 'in_transit' | 'delivered' | 'cancelled';

export interface OrderLogistics {
    id: string;
    customer_id?: string;
    guest_info?: any;
    total_amount: number;
    status: string;
    payment_status: string;
    logistics_status: LogisticsStatus;
    tracking_number?: string;
    shipping_provider?: string;
    estimated_delivery_date?: string;
    logistics_notes?: string;
    shipping_address?: string;
    created_at: string;
    updated_at: string;
    order_items?: any[];
}
