-- Generate random 4-digit PINs for all participants without a PIN
UPDATE participants
SET personal_pin = LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0')
WHERE personal_pin IS NULL;

-- Show all participants with their PINs (so you can inform them)
SELECT
  name,
  email,
  personal_pin,
  created_at
FROM participants
ORDER BY created_at DESC;
