-- Create password history table for colaboradoras
CREATE TABLE IF NOT EXISTS colaboradoras_password_history (
  id TEXT PRIMARY KEY,
  colaboradora_id TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'permanent',
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  FOREIGN KEY (colaboradora_id) REFERENCES colaboradoras(id) ON DELETE CASCADE
);
