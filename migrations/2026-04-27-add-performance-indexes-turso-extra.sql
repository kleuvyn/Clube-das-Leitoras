-- Complemento de índices para consultas de todas as páginas (Turso/libSQL)

-- Encontros: listagem com filtro por tipo e ordenação por status/data
CREATE INDEX IF NOT EXISTS idx_encontros_tipo_status_data
  ON encontros(tipo, status DESC, data DESC);
CREATE INDEX IF NOT EXISTS idx_encontros_status_data
  ON encontros(status DESC, data DESC);

-- Livros: filtros e ordenações por ano/mes/votos (fora votação)
CREATE INDEX IF NOT EXISTS idx_livros_ano_tipo_mes_votos
  ON livros(ano, tipo, mes DESC, votos DESC);

-- Comentários: feed global por data
CREATE INDEX IF NOT EXISTS idx_comentarios_created_at
  ON comentarios(created_at DESC);

-- Reflexões: feed global por data
CREATE INDEX IF NOT EXISTS idx_reflexoes_roda_created_at
  ON reflexoes_roda_online(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reflexoes_lobos_created_at
  ON reflexoes_lobos(created_at DESC);
