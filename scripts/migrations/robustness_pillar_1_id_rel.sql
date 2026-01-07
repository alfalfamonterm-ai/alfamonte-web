-- Migration: Pillar 1 - Real Relationships
-- Adds physical customer_id link to operations table

-- 1. Add column
ALTER TABLE operations 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id);

-- 2. Backfill customer_id from existing text matches
-- We use the same logic as the view (matching description/client_name)
WITH customer_matches AS (
  SELECT 
    o.id as op_id,
    c.id as cust_id
  FROM operations o
  JOIN customers c ON (
    LOWER(TRIM(REPLACE(o.description, 'Venta a ', ''))) = LOWER(TRIM(c.name))
    OR LOWER(TRIM(o.description)) = LOWER(TRIM(c.name))
  )
  WHERE o.category = 'Venta'
)
UPDATE operations
SET customer_id = customer_matches.cust_id
FROM customer_matches
WHERE operations.id = customer_matches.op_id;

-- 3. Update the purchase history view to join on ID
-- This makes it 100x faster and immune to name changes
CREATE OR REPLACE VIEW customer_purchase_history AS
SELECT 
  c.id as customer_id,
  c.customer_number,
  c.name,
  c.phone,
  c.email,
  c.data_complete,
  COUNT(o.id) as total_purchases,
  COALESCE(SUM(o.total_cost), 0) as total_spent,
  COALESCE(AVG(o.total_cost), 0) as avg_order_value,
  MAX(o.date) as last_purchase_date,
  MIN(o.date) as first_purchase_date,
  CASE 
    WHEN MAX(o.date) IS NOT NULL 
    THEN CURRENT_DATE - MAX(o.date)::date 
    ELSE NULL 
  END as days_since_last_purchase
FROM customers c
LEFT JOIN operations o ON o.customer_id = c.id AND o.category = 'Venta'
GROUP BY c.id, c.customer_number, c.name, c.phone, c.email, c.data_complete;
