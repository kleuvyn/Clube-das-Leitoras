-- Adiciona coluna must_change_password à tabela colaboradoras
ALTER TABLE colaboradoras
  ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT true;
