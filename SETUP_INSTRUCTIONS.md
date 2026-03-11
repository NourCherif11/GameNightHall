# Setup Instructions - PlayStation Controller Options

## Problem
The database has check constraints that only allow old counter types. When trying to save settings for `playstation4` or `playstation5`, you get:
```
Error: new row for relation "counter_settings" violates check constraint "counter_settings_counter_type_check"
```

## Solution
Run these SQL migrations in order to update the database schema.

---

## Step 1: Run PlayStation Types Migration

**File:** `migration-playstation-types.sql`

This migration will:
- Drop old check constraints on all 3 tables (counters, counter_settings, bills)
- Add new check constraints that allow: 'billard', 'playstation', 'playstation4', 'playstation5'
- Update existing 'playstation' records to 'playstation5'

**How to run:**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy the entire contents of `migration-playstation-types.sql`
4. Paste and click "Run"

---

## Step 2: Run Drop Minutes Columns Migration

**File:** `drop-minutes-columns.sql`

This migration will:
- Drop old minute-based columns (increment_interval_minutes, grace_period_minutes)
- Remove NOT NULL constraint on grace_period_seconds
- Clean up the schema to only use seconds

**How to run:**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy the entire contents of `drop-minutes-columns.sql`
4. Paste and click "Run"

---

## Step 3: Add Started By Column Migration

**File:** `add-started-by-column.sql`

This migration will:
- Add `started_by` column to track which user started each counter
- Prevents regular admins from stopping counters started by others

**How to run:**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy the entire contents of `add-started-by-column.sql`
4. Paste and click "Run"

---

## Step 4: Add PlayStation 4 Counters

After running all migrations, you can add PS4 counters:

1. Login as superadmin
2. Go to Compteurs page
3. Scroll to "PlayStation 4" section
4. Click "+ Ajouter" button
5. Add counters: "PS4 - 1", "PS4 - 2"

---

## Step 5: Configure Tariffs

Set pricing for each console type:

1. **PlayStation 5**: Click "Tarifs" button → Set your pricing
2. **PlayStation 4**: Click "Tarifs" button → Set your pricing
3. **Billard**: Verify existing settings

---

## Expected Result

After completing all steps:
- ✅ Can add PS4 and PS5 counters
- ✅ Can configure separate tariffs for PS4 and PS5
- ✅ Controller buttons (3 manettes, 4 manettes) appear on PlayStation counters
- ✅ Pricing multipliers work correctly (1x, 1.5x, 2x)
- ✅ Regular admins cannot stop counters started by others
- ✅ Bills are auto-created for regular admins with option to update client name
- ✅ No more check constraint errors

---

## Troubleshooting

### Still getting check constraint error?
- Make sure you ran ALL migration files in order
- Check that the constraints were actually dropped and recreated
- Run this to verify: `SELECT * FROM information_schema.table_constraints WHERE table_name IN ('counters', 'counter_settings', 'bills');`

### Grace period errors?
- Make sure you ran `drop-minutes-columns.sql`
- Grace period should default to 0 if not provided

### Counters not showing?
- Refresh the page
- Check console for errors
- Verify counters exist: `SELECT * FROM counters ORDER BY type, order_index;`

### Regular admin can't stop counter?
- This is intentional! Regular admins can only stop counters they started
- Check if another user started the counter
- Superadmins can stop any counter
