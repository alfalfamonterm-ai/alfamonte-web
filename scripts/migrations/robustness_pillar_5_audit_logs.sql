-- Migration: Pillar 5 - Change Audit
-- Tracks all INSERT, UPDATE, and DELETE actions on critical tables

-- 1. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    old_data JSONB,
    new_data JSONB,
    user_id UUID, -- For future auth integration
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Generic Audit Trigger Function
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_data)
        VALUES (TG_TABLE_NAME, OLD.id::text, TG_OP, to_jsonb(OLD));
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data)
        VALUES (TG_TABLE_NAME, NEW.id::text, TG_OP, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_data)
        VALUES (TG_TABLE_NAME, NEW.id::text, TG_OP, to_jsonb(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Apply Audit to Tables
-- Operations
DROP TRIGGER IF EXISTS audit_operations ON operations;
CREATE TRIGGER audit_operations
AFTER INSERT OR UPDATE OR DELETE ON operations
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Customers
DROP TRIGGER IF EXISTS audit_customers ON customers;
CREATE TRIGGER audit_customers
AFTER INSERT OR UPDATE OR DELETE ON customers
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Inventory
DROP TRIGGER IF EXISTS audit_inventory_items ON inventory_items;
CREATE TRIGGER audit_inventory_items
AFTER INSERT OR UPDATE OR DELETE ON inventory_items
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
