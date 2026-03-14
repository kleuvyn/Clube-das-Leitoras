import postgres from 'postgres';
import { config } from 'dotenv';

config();

async function run() {
  const sql = postgres(process.env.DATABASE_URL!);
  const rows = await sql`SELECT email, role, must_change_password, active FROM colaboradoras ORDER BY created_at DESC`;
  console.table(rows);
  await sql.end();
}

run().catch((e) => { console.error('ERRO:', e.message); process.exit(1); });
