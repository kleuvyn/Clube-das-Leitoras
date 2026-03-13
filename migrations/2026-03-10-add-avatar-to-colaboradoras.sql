-- Migration: adicionar coluna avatar_url em colaboradoras
ALTER TABLE IF EXISTS colaboradoras
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Nota: Antes de rodar em produção faça backup do banco.
-- Exemplo: pg_dump --format=p --dbname="$DATABASE_URL" > backup.sql
