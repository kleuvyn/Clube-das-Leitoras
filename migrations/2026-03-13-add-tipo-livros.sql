ALTER TABLE livros ADD COLUMN IF NOT EXISTS tipo text DEFAULT 'candidato';
ALTER TABLE livros ADD COLUMN IF NOT EXISTS slug text;
UPDATE livros SET slug = concat(lower(regexp_replace(titulo, '[^a-zA-Z0-9]', '-', 'g')), '-', extract(epoch from created_at)::bigint) WHERE slug IS NULL;
