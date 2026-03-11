-- Set user as superadmin
-- Run this in Supabase Dashboard → SQL Editor

-- Update user metadata to add superadmin role
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"superadmin"'
)
WHERE id = 'f05b2c6d-9b86-4056-baed-398dbb414d9b';

-- Verify the update
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE id = 'f05b2c6d-9b86-4056-baed-398dbb414d9b';
