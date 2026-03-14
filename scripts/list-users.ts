import postgres from 'postgres';
import { config } from 'dotenv';
config();

async function run() {
  const sql = postgres(process.env.DATABASE_URL!);
  const rows = await sql`SELECT email, role, active FROM colaboradoras ORDER BY created_at DESC LIMIT 10`;
  console.table(rows);
  await sql.end();
}
run().catch(e => console.error(e.message));
