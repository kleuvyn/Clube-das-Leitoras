CREATE TABLE IF NOT EXISTS reflexoes_roda_online (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roda_id text NOT NULL,
  autora_nome text NOT NULL,
  autora_email text,
  texto text NOT NULL,
  created_at timestamp DEFAULT now()
);
