CREATE TABLE IF NOT EXISTS sorteios_config (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  mes_base text NOT NULL,
  urna_aberta integer NOT NULL DEFAULT 1,
  updated_at integer DEFAULT (cast(strftime('%s', 'now') as int)) NOT NULL
);
