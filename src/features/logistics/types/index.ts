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

export const LOGISTICS_STATUS_LABELS: Record<LogisticsStatus, { label: string; color: string; icon: string }> = {
    processing: { label: 'En Proceso', color: 'bg-blue-100 text-blue-800', icon: '⚙️' },
    warehouse: { label: 'En Bodega', color: 'bg-orange-100 text-orange-800', icon: '📦' },
    dispatched: { label: 'Despachado', color: 'bg-purple-100 text-purple-800', icon: '🚚' },
    in_transit: { label: 'En Camino', color: 'bg-indigo-100 text-indigo-800', icon: '🛣️' },
    delivered: { label: 'Entregado', color: 'bg-green-100 text-green-800', icon: '✅' },
    cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: '❌' },
};
