-- Migration: adicionar campos imagem e texto_completo em dicas
ALTER TABLE dicas ADD COLUMN imagem text;
ALTER TABLE dicas ADD COLUMN texto_completo text;
