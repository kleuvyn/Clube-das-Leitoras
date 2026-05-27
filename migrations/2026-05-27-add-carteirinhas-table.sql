-- Create a separate table for generated carteirinhas
CREATE TABLE IF NOT EXISTS carteirinhas (
  id TEXT PRIMARY KEY,
  solicitacao_id TEXT REFERENCES solicitacoes(id) ON DELETE CASCADE,
  colaboradora_id TEXT REFERENCES colaboradoras(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);
