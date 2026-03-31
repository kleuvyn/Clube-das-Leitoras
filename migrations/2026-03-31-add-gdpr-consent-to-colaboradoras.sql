-- Migração LGPD: registra consentimento no perfil da colaboradora
ALTER TABLE colaboradoras ADD COLUMN IF NOT EXISTS gdpr_consentido boolean NOT NULL DEFAULT false;
ALTER TABLE colaboradoras ADD COLUMN IF NOT EXISTS gdpr_consentido_em integer;
ALTER TABLE colaboradoras ADD COLUMN IF NOT EXISTS gdpr_consentimento_versao text;
ALTER TABLE colaboradoras ADD COLUMN IF NOT EXISTS gdpr_consentimento_finalidade text;

-- Opcional: tabela de trilha de consentimento (audit trail)
CREATE TABLE IF NOT EXISTS consentimentos (
  id text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  colaboradora_id text NOT NULL,
  acao text NOT NULL,
  finalidade text,
  versao text,
  aceito boolean NOT NULL DEFAULT false,
  created_at integer NOT NULL DEFAULT (strftime('%s','now')),
  FOREIGN KEY(colaboradora_id) REFERENCES colaboradoras(id) ON DELETE CASCADE
);
