-- Migration: Add customer_number and data_complete fields to customers table
-- This migration adds a customer ID system and data validation flags

-- Step 1: Add new columns
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS customer_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS data_complete BOOLEAN DEFAULT false;

-- Step 2: Generate customer numbers for existing customers
-- Format: C-0001, C-0002, etc.
WITH numbered_customers AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY created_at NULLS LAST, name) as row_num
  FROM customers
  WHERE customer_number IS NULL
)
UPDATE customers
SET customer_number = 'C-' || LPAD(numbered_customers.row_num::TEXT, 4, '0')
FROM numbered_customers
WHERE customers.id = numbered_customers.id;

-- Step 3: Mark customers as complete if they have required fields
UPDATE customers
SET data_complete = true
WHERE 
  name IS NOT NULL 
  AND name != '' 
  AND phone IS NOT NULL 
  AND phone != ''
  AND email IS NOT NULL 
  AND email != '';

-- Step 4: Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_customers_number ON customers(customer_number);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);

-- Step 5: Create a view for customer purchase history
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
  -- Calculate days since last purchase
  CASE 
    WHEN MAX(o.date) IS NOT NULL 
    THEN CURRENT_DATE - MAX(o.date)::date 
    ELSE NULL 
  END as days_since_last_purchase
FROM customers c
LEFT JOIN operations o ON LOWER(TRIM(o.client_name)) = LOWER(TRIM(c.name)) AND o.category = 'Venta'
GROUP BY c.id, c.customer_number, c.name, c.phone, c.email, c.data_complete;

-- Verification queries
-- SELECT customer_number, name, phone, data_complete FROM customers ORDER BY customer_number;
-- SELECT * FROM customer_purchase_history ORDER BY total_spent DESC LIMIT 10;
