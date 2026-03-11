-- Migration: Update PlayStation counter types
-- Description: Rename 'playstation' type to 'playstation5' and prepare for playstation4
-- Date: 2026-03-11

-- Step 1: Drop the old check constraints
ALTER TABLE counters 
DROP CONSTRAINT IF EXISTS counters_type_check;

ALTER TABLE counter_settings 
DROP CONSTRAINT IF EXISTS counter_settings_counter_type_check;

-- Step 2: Add new check constraints with all valid types
ALTER TABLE counters 
ADD CONSTRAINT counters_type_check 
CHECK (type IN ('billard', 'playstation', 'playstation4', 'playstation5'));

ALTER TABLE counter_settings 
ADD CONSTRAINT counter_settings_counter_type_check 
CHECK (counter_type IN ('billard', 'playstation', 'playstation4', 'playstation5'));

-- Step 3: Update existing playstation counters to playstation5
UPDATE counters 
SET type = 'playstation5' 
WHERE type = 'playstation';

-- Step 4: Update existing counter_settings with playstation type
UPDATE counter_settings 
SET counter_type = 'playstation5' 
WHERE counter_type = 'playstation';

-- Step 5: Update existing bills with playstation counter type
UPDATE bills 
SET counter_type = 'playstation5' 
WHERE counter_type = 'playstation';

-- Step 6: Update bills table constraint if it exists
ALTER TABLE bills 
DROP CONSTRAINT IF EXISTS bills_counter_type_check;

ALTER TABLE bills 
ADD CONSTRAINT bills_counter_type_check 
CHECK (counter_type IN ('billard', 'playstation', 'playstation4', 'playstation5'));

-- Add PlayStation 4 counters (optional - run if you want default PS4 counters)
-- INSERT INTO counters (name, type, order_index, active, start_time, drinks) 
-- VALUES 
--   ('PS4 - 1', 'playstation4', 1, false, NULL, '[]'),
--   ('PS4 - 2', 'playstation4', 2, false, NULL, '[]');

-- Verify the changes
SELECT id, name, type FROM counters ORDER BY type, order_index;
