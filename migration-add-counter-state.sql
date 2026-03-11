-- Migration: Add state columns to counters table
-- This allows counters to persist their active state, start time, and drinks in the database
-- instead of using unreliable localStorage

-- Add columns for counter state
ALTER TABLE counters
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS drinks JSONB DEFAULT '[]'::jsonb;

-- Create index for active counters (for faster queries)
CREATE INDEX IF NOT EXISTS idx_counters_active ON counters(active) WHERE active = TRUE;

-- Add comment for documentation
COMMENT ON COLUMN counters.active IS 'Whether the counter is currently running';
COMMENT ON COLUMN counters.start_time IS 'When the counter was started (null if not active)';
COMMENT ON COLUMN counters.drinks IS 'Array of drinks added during the current session';
