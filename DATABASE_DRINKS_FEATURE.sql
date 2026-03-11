-- Database Migration for Drinks Feature
-- Run this in Supabase SQL Editor

-- Step 1: Create drinks table
CREATE TABLE IF NOT EXISTS drinks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  category TEXT DEFAULT 'other',
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create bill_items table (line items for bills)
CREATE TABLE IF NOT EXISTS bill_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('counter', 'drink')),
  item_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_drinks_available ON drinks(available);
CREATE INDEX IF NOT EXISTS idx_bill_items_bill_id ON bill_items(bill_id);

-- Step 3: Insert sample drinks
INSERT INTO drinks (name, price, category, available) VALUES
  ('Coca Cola', 2.00, 'soft_drinks', true),
  ('Pepsi', 2.00, 'soft_drinks', true),
  ('Fanta', 2.00, 'soft_drinks', true),
  ('Sprite', 2.00, 'soft_drinks', true),
  ('Eau Minérale', 1.00, 'water', true),
  ('Café', 1.50, 'hot_drinks', true),
  ('Cappuccino', 2.50, 'hot_drinks', true),
  ('Thé', 1.00, 'hot_drinks', true),
  ('Jus d''Orange', 3.00, 'juices', true),
  ('Jus de Pomme', 3.00, 'juices', true),
  ('Red Bull', 4.00, 'energy_drinks', true),
  ('Monster', 4.00, 'energy_drinks', true);

-- Step 4: Add temporary_items column to counters for drinks added during session
ALTER TABLE bills ADD COLUMN IF NOT EXISTS has_items BOOLEAN DEFAULT false;

-- Step 5: Enable RLS on new tables
ALTER TABLE drinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_items ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read and modify
CREATE POLICY "Allow all authenticated users to read drinks" ON drinks
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow all authenticated users to modify drinks" ON drinks
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all authenticated users to read bill_items" ON bill_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow all authenticated users to modify bill_items" ON bill_items
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Verify
SELECT 'Drinks created:', COUNT(*) FROM drinks;
SELECT 'Bill items table ready' as status;
