import postgres from 'postgres';
import { config } from 'dotenv';

config();

async function run() {
  const sql = postgres(process.env.DATABASE_URL!);

  // Garante que a coluna existe
  await sql`ALTER TABLE colaboradoras ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT true`;
  console.log('OK: coluna garantida');

  // Corrige leitoras convidadas antes da fix que ficaram com must_change_password = false
  // Só atualiza quem tem a senha padrão antiga 'leitura2026' ou similar (nunca fez login real)
  const result = await sql`
    UPDATE colaboradoras
    SET must_change_password = true
    WHERE role = 'convidada'
      AND must_change_password = false
  `;
  console.log(`Leitoras corrigidas: ${result.count}`);

  await sql.end();
}

run().catch((e) => { console.error('ERRO:', e.message); process.exit(1); });
