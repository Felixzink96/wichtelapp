-- Add personal_pin column to participants table
ALTER TABLE participants ADD COLUMN personal_pin TEXT;

-- Add constraint to ensure PIN is exactly 4 digits
ALTER TABLE participants ADD CONSTRAINT personal_pin_format CHECK (personal_pin ~ '^[0-9]{4}$');
