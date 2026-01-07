export type InventoryItemType = 'material' | 'tool' | 'equipment';
export type ItemStatus = 'active' | 'broken' | 'maintenance' | 'retired';

export interface InventoryItem {
    id: string;
    item_code: string;
    name: string;
    description?: string;
    item_type: InventoryItemType;
    category?: string;
    subcategory?: string;
    unit: string;
    quantity_total: number;
    quantity_available: number;
    quantity_in_use: number;
    unit_cost: number;
    total_value?: number;
    purchase_date?: string;
    supplier?: string;
    status: ItemStatus;
    location?: string;
    last_maintenance_date?: string;
    next_maintenance_date?: string;
    maintenance_interval_days?: number;
    notes?: string;
    created_at?: string;
}

export type MovementType = 'purchase' | 'usage' | 'loss' | 'transfer' | 'adjustment';

export interface InventoryMovement {
    id: string;
    item_id: string;
    movement_type: MovementType;
    quantity: number;
    operation_id?: string;
    pano_id?: string;
    performed_by?: string;
    reason?: string;
    unit_cost?: number;
    total_cost?: number;
    created_at?: string;
    notes?: string;
<<<<<<< HEAD
=======
    // Joined fields
>>>>>>> 4af7fc6 (Fix: Aplicado downgrade de Next.js y React a versiones estables)
    item?: {
        name: string;
        unit: string;
    };
}
