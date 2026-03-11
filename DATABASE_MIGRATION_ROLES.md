# 🔧 Database Migration for Counter System with Roles

## Step 1: Add Role System to Users

Run this SQL in your Supabase SQL Editor:

```sql
-- Add role to user metadata (this will be in user_metadata)
-- For existing users, update their metadata manually in Supabase Dashboard:
-- Go to Authentication → Users → Click on user → Update user metadata
-- Add: {"name": "Saddem", "role": "superadmin"}

-- Or create a new superadmin user via SQL:
-- Note: You'll need to set the password via Supabase Dashboard after creation
```

## Step 2: Create New Counters Table

```sql
-- Drop old table_names table and create new counters table
DROP TABLE IF EXISTS table_names CASCADE;

CREATE TABLE counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('billard', 'playstation')),
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_counters_type ON counters(type);
CREATE INDEX idx_counters_order ON counters(order_index);

-- Insert default counters
-- 4 Billard tables
INSERT INTO counters (name, type, order_index) VALUES
  ('Table 1', 'billard', 1),
  ('Table 2', 'billard', 2),
  ('Table 3', 'billard', 3),
  ('Table 4', 'billard', 4);

-- 9 PlayStation stations
INSERT INTO counters (name, type, order_index) VALUES
  ('PS 1', 'playstation', 5),
  ('PS 2', 'playstation', 6),
  ('PS 3', 'playstation', 7),
  ('PS 4', 'playstation', 8),
  ('PS 5', 'playstation', 9),
  ('PS 6', 'playstation', 10),
  ('PS 7', 'playstation', 11),
  ('PS 8', 'playstation', 12),
  ('PS 9', 'playstation', 13);
```

## Step 3: Create Counter Settings Table

```sql
-- Create counter_settings table for different pricing models
CREATE TABLE counter_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  counter_type TEXT NOT NULL UNIQUE CHECK (counter_type IN ('billard', 'playstation')),
  starting_value NUMERIC DEFAULT 0,
  increment_amount NUMERIC NOT NULL,
  increment_interval_minutes INTEGER NOT NULL,
  grace_period_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
-- Billard: starts at 0, +2 TND every 15 minutes, 5 min grace period
INSERT INTO counter_settings (counter_type, starting_value, increment_amount, increment_interval_minutes, grace_period_minutes)
VALUES ('billard', 0, 2, 15, 5);

-- PlayStation: starts at 1 TND, +1 TND every 10 minutes, no grace period
INSERT INTO counter_settings (counter_type, starting_value, increment_amount, increment_interval_minutes, grace_period_minutes)
VALUES ('playstation', 1, 1, 10, 0);
```

## Step 4: Update Bills Table

```sql
-- Add new columns to bills table
ALTER TABLE bills ADD COLUMN IF NOT EXISTS counter_id UUID REFERENCES counters(id) ON DELETE SET NULL;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS counter_type TEXT;

-- Create index
CREATE INDEX IF NOT EXISTS idx_bills_counter_id ON bills(counter_id);

-- Migrate existing data (map table_number to counter IDs)
-- This assumes table_number 1-4 are billard tables
UPDATE bills SET 
  counter_id = (SELECT id FROM counters WHERE type = 'billard' AND order_index = bills.table_number LIMIT 1),
  counter_type = 'billard'
WHERE table_number <= 4 AND counter_id IS NULL;

-- Keep table_number for now for backward compatibility, but we'll use counter_id moving forward
```

## Step 5: Enable Row Level Security (RLS) - Optional but Recommended

```sql
-- Enable RLS on new tables
ALTER TABLE counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE counter_settings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read (since we check roles in the app)
CREATE POLICY "Allow read access to all authenticated users" ON counters
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access to all authenticated users" ON counter_settings
  FOR SELECT TO authenticated USING (true);

-- Only superadmins can modify (we'll check role in app code)
-- For now, allow all authenticated users to modify
CREATE POLICY "Allow all authenticated users to modify counters" ON counters
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all authenticated users to modify settings" ON counter_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

---

## 🎯 After Running These SQL Commands

### Set Your User as Superadmin

**Method 1: Using SQL (Recommended)**

Run this in Supabase SQL Editor (replace with your user ID):

```sql
-- Update user metadata to add superadmin role
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"superadmin"'
)
WHERE id = 'YOUR-USER-ID-HERE';

-- Verify the update
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE id = 'YOUR-USER-ID-HERE';
```

**To find your user ID:**
- Go to Supabase Dashboard → Authentication → Users
- Find your user and copy the UUID from the ID column

**Method 2: Using Dashboard**

1. Go to Supabase Dashboard → Authentication → Users
2. Click on your admin user
3. In "User Metadata" section, add/update:
   ```json
   {
     "name": "Saddem",
     "role": "superadmin"
   }
   ```
4. Click "Save"

### Create a Regular Admin for Testing (Optional)

- Create new user with email/password
- Set user metadata to:
```json
{
  "name": "Admin Name",
  "role": "admin"
}
```

---

## ✅ Verification

After running these commands, verify:
- `counters` table has 13 rows (4 billard + 9 playstation)
- `counter_settings` table has 2 rows (billard and playstation settings)
- Your user has `"role": "superadmin"` in metadata

**Ready to proceed!** Once you've run these SQL commands in Supabase, let me know and I'll update the frontend code.
