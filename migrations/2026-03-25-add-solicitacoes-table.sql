CREATE TABLE IF NOT EXISTS solicitacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL,
  nome text NOT NULL,
  email text NOT NULL,
  telefone text,
  site text,
  instagram text,
  mensagem text,
  status text DEFAULT 'pendente',
  created_at timestamp DEFAULT now()
);
