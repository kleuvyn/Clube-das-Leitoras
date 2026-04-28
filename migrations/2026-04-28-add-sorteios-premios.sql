-- Add prizes table for monthly sorteios
CREATE TABLE IF NOT EXISTS sorteios_premios (
  id TEXT PRIMARY KEY,
  premio TEXT NOT NULL,
  mes_base TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);
