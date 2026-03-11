-- Verify and Fix Bills Storage Issue
-- Run this in Supabase SQL Editor to ensure bills table has correct columns

-- Step 1: Check current structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'bills';

-- Step 2: Ensure counter columns exist and allow NULL
ALTER TABLE bills 
ALTER COLUMN counter_id DROP NOT NULL,
ALTER COLUMN counter_type DROP NOT NULL,
ALTER COLUMN table_number DROP NOT NULL;

-- Step 3: Check if there are any constraints preventing inserts
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'bills'::regclass;

-- Step 4: Test insert directly
INSERT INTO bills (
  counter_id, 
  counter_type, 
  player_name, 
  start_time, 
  end_time, 
  duration, 
  price, 
  paid
) VALUES (
  (SELECT id FROM counters LIMIT 1),
  'billard',
  'Test Client',
  NOW() - INTERVAL '30 minutes',
  NOW(),
  1800,
  4.00,
  false
) RETURNING *;

-- Step 5: Check RLS policies aren't blocking inserts
SELECT * FROM pg_policies WHERE tablename = 'bills';

-- If RLS is blocking, temporarily disable for testing:
-- ALTER TABLE bills DISABLE ROW LEVEL SECURITY;
-- Then test bill creation in your app
-- Re-enable when done:
-- ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
