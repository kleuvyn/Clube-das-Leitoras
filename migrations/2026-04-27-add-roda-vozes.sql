-- Tabela para sessões de roda de vozes
CREATE TABLE IF NOT EXISTS roda_vozes (
  id TEXT PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  titulo TEXT DEFAULT 'Roda de Vozes',
  status TEXT DEFAULT 'ativa',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para participantes de cada sessão de roda
CREATE TABLE IF NOT EXISTS participantes_roda_vozes (
  id TEXT PRIMARY KEY,
  roda_id TEXT NOT NULL,
  nome TEXT NOT NULL,
  ordem INTEGER NOT NULL,
  falou INTEGER DEFAULT 0,
  tempo_utilizado INTEGER DEFAULT 0,
  minutos_adicionais_usados INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (roda_id) REFERENCES roda_vozes(id) ON DELETE CASCADE
);

-- Índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_participantes_roda_id ON participantes_roda_vozes(roda_id);
CREATE INDEX IF NOT EXISTS idx_roda_vozes_status ON roda_vozes(status);
