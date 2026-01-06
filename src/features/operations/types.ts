export type OperationCategory = 'Rendimiento' | 'Venta' | 'Costo Operacional' | 'Retiro de Utilidad';

export interface OperationItem {
    startDate?: string;
    endDate?: string;
    product_id?: string;
    product_title?: string;
    is_web_sale?: boolean;
    [key: string]: any;
}

export interface CreateOperationDTO {
    date: string;
    category: OperationCategory;
    subcategory: string;
    description: string;
    quantity: number;
    unit_cost: number;
    total_cost: number;
    pano_id: string;
    corte_id: string;
    performer: string;
    customer_id?: string;
    amount_paid?: number;
    payment_status?: 'pending' | 'partial' | 'paid';
    payment_due_date?: string | null;
    items?: OperationItem;
}

export interface Operation extends CreateOperationDTO {
    id: string;
    created_at: string;
}
