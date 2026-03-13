-- Migration: Remover tabelas 'artigos' e 'autoras'
-- Data: 2026-03-10
-- ATENÇÃO: Faça backup do banco antes de aplicar. Estas operações removem objetos do schema.
-- Recomendações:
-- 1) Fazer dump/backup: `pg_dump --schema=public --format=custom -f backup_before_remove_artigos_autoras.dump $DATABASE_URL`
-- 2) Testar em ambiente de staging antes de aplicar em produção
-- 3) Rodar este arquivo com psql: `psql "$DATABASE_URL" -f migrations/2026-03-10-remove-artigos-autoras.sql`

BEGIN;

-- Remover colunas que podem referenciar as tabelas (se existirem)
ALTER TABLE IF EXISTS colaboradoras DROP COLUMN IF EXISTS autora_id;
ALTER TABLE IF EXISTS livros DROP COLUMN IF EXISTS artigo_id;

-- Tentar remover constraints conhecidas (nomes genéricos) — se não existirem, são ignoradas
ALTER TABLE IF EXISTS artigos DROP CONSTRAINT IF EXISTS artigos_autora_id_fkey;
ALTER TABLE IF EXISTS artigos DROP CONSTRAINT IF EXISTS artigos_livro_id_fkey;

-- Remover índices/constraints adicionais se existirem
DROP INDEX IF EXISTS idx_artigos_autora_id;
DROP INDEX IF EXISTS idx_artigos_livro_id;

-- Por fim, remover as tabelas (somente se existirem)
DROP TABLE IF EXISTS artigos;
DROP TABLE IF EXISTS autoras;

COMMIT;

-- Observação: este migration usa `IF EXISTS` para evitar falhas quando o schema
-- já foi alterado no código. Se você preferir uma remoção com auditoria, gere
-- primeiro um DDL de dependências e revise manualmente antes de aplicar.
