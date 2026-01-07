-- Migration: Pillar 2 - Inventory Automation
-- Automatically create inventory entries for asset purchases

-- 1. Function to handle trigger
CREATE OR REPLACE FUNCTION handle_asset_purchase_auto_inventory()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if it's an asset purchase
    IF NEW.subcategory = 'Compra de Activos' OR (NEW.items->>'is_asset_purchase')::boolean = true THEN
        
        -- Insert into inventory_items
        INSERT INTO inventory_items (
            name,
            type,
            quantity_available,
            unit,
            unit_cost,
            total_value,
            status,
            created_at
        ) VALUES (
            NEW.description,
            'asset',
            COALESCE(NEW.quantity, 1),
            'unidades',
            COALESCE(NEW.unit_cost, NEW.total_cost),
            NEW.total_cost,
            'active',
            NEW.created_at
        );
        
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create the trigger
DROP TRIGGER IF EXISTS trg_asset_purchase_inventory ON operations;
CREATE TRIGGER trg_asset_purchase_inventory
AFTER INSERT ON operations
FOR EACH ROW
EXECUTE FUNCTION handle_asset_purchase_auto_inventory();
