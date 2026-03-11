-- Drop old minute-based columns from counter_settings and update constraints
-- Run this in Supabase SQL Editor to clean up the schema
-- Date: 2026-03-11

-- Drop the old columns that are no longer used
ALTER TABLE counter_settings 
DROP COLUMN IF EXISTS increment_interval_minutes,
DROP COLUMN IF EXISTS grace_period_minutes;

-- Drop NOT NULL constraint on grace_period_seconds
ALTER TABLE counter_settings 
ALTER COLUMN grace_period_seconds DROP NOT NULL;

-- Verify the migration
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'counter_settings'
ORDER BY ordinal_position;

-- Check current data
SELECT * FROM counter_settings;
