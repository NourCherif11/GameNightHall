-- Update counter_settings table to use seconds instead of minutes
-- Run this in Supabase SQL Editor AFTER you've already run DATABASE_MIGRATION_ROLES.md

-- Step 1: Add new columns for seconds
ALTER TABLE counter_settings 
ADD COLUMN IF NOT EXISTS increment_interval_seconds NUMERIC,
ADD COLUMN IF NOT EXISTS grace_period_seconds NUMERIC;

-- Step 2: Convert existing data from minutes to seconds
UPDATE counter_settings 
SET increment_interval_seconds = increment_interval_minutes * 60,
    grace_period_seconds = grace_period_minutes * 60;

-- Step 3: Make new columns NOT NULL after data migration
ALTER TABLE counter_settings 
ALTER COLUMN increment_interval_seconds SET NOT NULL,
ALTER COLUMN grace_period_seconds SET NOT NULL;

-- Step 4: Drop old minute columns
ALTER TABLE counter_settings 
DROP COLUMN IF EXISTS increment_interval_minutes,
DROP COLUMN IF EXISTS grace_period_minutes;

-- Verify the migration
SELECT * FROM counter_settings;
