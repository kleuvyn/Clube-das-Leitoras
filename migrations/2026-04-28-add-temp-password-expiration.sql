-- Add expiration timestamp for temporary passwords on colaboradoras
ALTER TABLE colaboradoras ADD COLUMN IF NOT EXISTS temp_password_expires_at integer;
