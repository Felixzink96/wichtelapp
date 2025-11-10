-- Add admin_pin column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS admin_pin text NOT NULL DEFAULT '0000';

-- Create unique index on admin_pin for faster lookups
CREATE INDEX IF NOT EXISTS idx_events_admin_pin ON events(admin_pin);
