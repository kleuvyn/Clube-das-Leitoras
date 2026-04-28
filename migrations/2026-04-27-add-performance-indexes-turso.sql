-- Indices focados nas consultas mais frequentes em Turso (SQLite/libSQL)

-- Autenticacao e lookup de colaboradoras
CREATE INDEX IF NOT EXISTS idx_colaboradoras_email_lower
  ON colaboradoras(lower(email));
CREATE INDEX IF NOT EXISTS idx_colaboradoras_created_at
  ON colaboradoras(created_at DESC);

-- Votacao
CREATE INDEX IF NOT EXISTS idx_votacoes_usuario_email
  ON votacoes(usuario_email);
CREATE INDEX IF NOT EXISTS idx_votacoes_livro_id
  ON votacoes(livro_id);
CREATE INDEX IF NOT EXISTS idx_livros_tipo_created_at
  ON livros(tipo, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_livros_tipo_ano_mes_votos
  ON livros(tipo, ano DESC, mes DESC, votos DESC);
CREATE INDEX IF NOT EXISTS idx_livros_titulo_autor
  ON livros(titulo, autor);

-- Confirmacoes de eventos
CREATE INDEX IF NOT EXISTS idx_evento_confirmacoes_evento_usuario
  ON evento_confirmacoes(evento_id, usuario_email);
CREATE INDEX IF NOT EXISTS idx_evento_confirmacoes_evento_status
  ON evento_confirmacoes(evento_id, status);

-- Comentarios e reflexoes (filtros por FK + ordenacao temporal)
CREATE INDEX IF NOT EXISTS idx_comentarios_livro_mes_created_at
  ON comentarios(livro_do_mes_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comentarios_resenha_created_at
  ON comentarios(resenha_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reflexoes_roda_roda_id_created_at
  ON reflexoes_roda_online(roda_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reflexoes_lobos_leitura_id_created_at
  ON reflexoes_lobos(leitura_id, created_at DESC);

-- Listagens paginadas por created_at
CREATE INDEX IF NOT EXISTS idx_resenhas_created_at ON resenhas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dicas_created_at ON dicas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_escritoras_created_at ON escritoras(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_podcasts_created_at ON podcasts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rodaonline_created_at ON rodaonline(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_created_at ON solicitacoes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_encontros_created_at ON encontros(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cronograma_created_at ON cronograma(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leituras_created_at ON leituras(created_at DESC);

-- Ordenacoes e filtros especificos
CREATE INDEX IF NOT EXISTS idx_parcerias_name ON parcerias(name);
CREATE INDEX IF NOT EXISTS idx_empreendedoras_name ON empreendedoras(name);
CREATE INDEX IF NOT EXISTS idx_livro_do_mes_ano_updated_at
  ON livro_do_mes(ano, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_cronograma_ano_created_at
  ON cronograma(ano, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_votacoes_historico_encerrado_em
  ON votacoes_historico(encerrado_em DESC);
