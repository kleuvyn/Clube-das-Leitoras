-- Add approvedAt timestamp to solicitacoes so curadoria saiba quando cada cadastro foi aprovado
ALTER TABLE solicitacoes ADD COLUMN approved_at INTEGER;
