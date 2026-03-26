ALTER TABLE colaboradoras
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'pendente',
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS birthdate date,
  ADD COLUMN IF NOT EXISTS tempo_clube text,
  ADD COLUMN IF NOT EXISTS endereco_completo text,
  ADD COLUMN IF NOT EXISTS carta_mimo boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS envios_realizados integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ultima_interacao timestamp;

UPDATE colaboradoras SET status = 'ativa' WHERE status IS NULL AND active = true;
UPDATE colaboradoras SET status = 'pendente' WHERE status IS NULL AND active = false;
