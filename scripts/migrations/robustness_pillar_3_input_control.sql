-- Migration: Pillar 3 - Input Control
-- Creates tables for granular tracking of seeds, fuel, and other consumables

-- 1. Inputs Master Table
CREATE TABLE IF NOT EXISTS inputs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Fuel', 'Seeds', 'Fertilizer', etc.
    stock_quantity DECIMAL DEFAULT 0,
    unit TEXT NOT NULL, -- 'Liters', 'Sacks', 'Kg'
    avg_unit_cost DECIMAL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Input Usage Table
CREATE TABLE IF NOT EXISTS input_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    input_id UUID REFERENCES inputs(id),
    operation_id UUID REFERENCES operations(id),
    quantity_used DECIMAL NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    performed_by TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Initial Data (Seeds and Fuel categories if they don't exist in logic)
-- This is just structural for now.
