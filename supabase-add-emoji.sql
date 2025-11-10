-- Add avatar_emoji column to participants table
ALTER TABLE participants ADD COLUMN IF NOT EXISTS avatar_emoji text DEFAULT '🎅';

-- Update existing participants to have a default emoji
UPDATE participants SET avatar_emoji = '🎅' WHERE avatar_emoji IS NULL;
