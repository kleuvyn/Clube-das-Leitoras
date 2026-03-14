import { db } from './lib/db';
import { colaboradoras } from './lib/db/schema';
import { sql } from 'drizzle-orm';

async function main() {
  const users = await db.select({
    email: colaboradoras.email,
    name: colaboradoras.name,
    role: colaboradoras.role,
    active: colaboradoras.active,
    mustChange: colaboradoras.mustChangePassword,
    createdAt: colaboradoras.createdAt,
  }).from(colaboradoras);

  console.log('=== USUÁRIOS ===');
  console.table(users);

  const cols = await db.execute(sql`
    SELECT column_name, data_type, column_default, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'colaboradoras'
    ORDER BY ordinal_position
  `);
  console.log('\n=== COLUNAS DA TABELA colaboradoras ===');
  console.table(cols.rows);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
