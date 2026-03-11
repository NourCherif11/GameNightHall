# Database Migration: Counter State Persistence

## Overview
This migration moves counter state persistence from localStorage to the Supabase database, fixing issues with:
- Counters restoring to old states after page refresh
- Unreliable localStorage data
- States not syncing properly

## What Changed

### Database
Added 3 new columns to the `counters` table:
- `active` (boolean) - Whether the counter is currently running
- `start_time` (timestamptz) - When the counter was started
- `drinks` (jsonb) - Array of drinks added during the session

### Code Changes
- **storage.js**: Added `updateCounterState()` function, updated `getCounters()` to include state fields
- **AppContext.jsx**: Removed localStorage logic, counter state now syncs with database
- Counters now calculate elapsed time from `start_time` on every render (accurate across refreshes)
- State updates persist immediately to database

## How to Run Migration

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file `migration-add-counter-state.sql`
4. Copy and paste the SQL into the editor
5. Click **Run** to execute the migration

### Option 2: Supabase CLI
```bash
supabase db push
```

## After Migration

### What Happens:
1. All existing counters will have `active = false` by default
2. Old localStorage data will be ignored
3. When you start a counter, its state is saved to the database
4. Page refreshes will maintain exact counter state from DB

### Testing:
1. Start a counter
2. Refresh the page multiple times
3. Counter should continue from the exact same time
4. Stop the counter and refresh - it should stay stopped

## Cleanup (Optional)
After verifying everything works, you can clear old localStorage data:
```javascript
// Run in browser console
localStorage.removeItem('poolclub_tables')
localStorage.removeItem('poolclub_last_clear_date')
```

## Rollback (if needed)
If you need to revert:
```sql
ALTER TABLE counters
DROP COLUMN IF EXISTS active,
DROP COLUMN IF EXISTS start_time,
DROP COLUMN IF EXISTS drinks;
```
Note: This will lose any active counter sessions.
