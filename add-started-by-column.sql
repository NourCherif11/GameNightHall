-- Add started_by column to counters table
-- Run this in Supabase SQL Editor
-- Date: 2026-03-11

-- Add the started_by column to track who started each counter
ALTER TABLE counters 
ADD COLUMN IF NOT EXISTS started_by TEXT;

-- Verify the migration
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'counters'
ORDER BY ordinal_position;

-- Check current data
SELECT id, name, type, active, started_by FROM counters;
