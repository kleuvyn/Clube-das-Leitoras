-- Add a field to store the final carteirinha URL for colaboradoras and solicitacoes
ALTER TABLE colaboradoras ADD COLUMN carteirinha_url TEXT;
ALTER TABLE solicitacoes ADD COLUMN carteirinha_url TEXT;
