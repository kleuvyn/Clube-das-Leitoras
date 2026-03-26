import postgres from 'postgres';
import { createClient } from '@libsql/client';

const neonUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
if (!neonUrl) throw new Error('NEON_DATABASE_URL (or DATABASE_URL) not set');
const neon = postgres(neonUrl, { ssl: 'require' });

const tursoUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
const tursoAuth = process.env.TURSO_DATABASE_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN;
if (!tursoUrl) throw new Error('TURSO_DATABASE_URL (or DATABASE_URL) not set');
if (!tursoAuth) throw new Error('TURSO_DATABASE_AUTH_TOKEN (or DATABASE_AUTH_TOKEN) not set');

const turso = createClient({
  url: tursoUrl,
  authToken: tursoAuth,
});

const tables = [
  'livros',
  'encontros',
  'evento_confirmacoes',
  'votacoes',
  'colaboradoras',
  'permissoes_seccao',
  'parcerias',
  'empreendedoras',
  'solicitacoes',
  'escritoras',
  'cronograma',
  'votacao_config',
  'votacoes_historico',
  'resenhas',
  'podcasts',
  'rodaonline',
  'reflexoes_roda_online',
  'livro_do_mes',
  'dicas',
  'leituras',
  'reflexoes_lobos',
  'comentarios',
  'config_moderacao',
];

async function getColumns(table) {
  const rows = await neon`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = ${table}
    ORDER BY ordinal_position
  `;
  return rows.map((r) => r.column_name);
}

function renderInsert(table, columns, row) {
  const names = columns.join(',');
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(',');
  const values = columns.map((c) => row[c]);

  const nonId = columns.filter((c) => c !== 'id');
  const updates = nonId.length
    ? nonId.map((c) => `${c}=EXCLUDED.${c}`).join(',')
    : 'id=id';

  return {
    sql: `INSERT INTO ${table} (${names}) VALUES (${placeholders}) ON CONFLICT(id) DO UPDATE SET ${updates}`,
    values,
  };
}

async function migrateTable(table) {
  console.log(`> Migrating ${table}`);
  const columns = await getColumns(table);
  if (!columns.length) {
    console.log(`  - no columns found; skip ${table}`);
    return;
  }

  const rows = await neon.unsafe(`SELECT * FROM ${table}`);
  console.log(`  - ${rows.length} rows to migrate`);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const { sql, values } = renderInsert(table, columns, row);
    await turso.execute({ sql, args: values });
    if ((i + 1) % 1000 === 0) {
      console.log(`    ${i + 1}/${rows.length}`);
    }
  }
  console.log(`  - done ${table}`);
}

async function main() {
  if (!process.env.NEON_DATABASE_URL) throw new Error('NEON_DATABASE_URL missing');
  if (!process.env.TURSO_DATABASE_URL) throw new Error('TURSO_DATABASE_URL missing');
  if (!process.env.TURSO_DATABASE_AUTH_TOKEN) throw new Error('TURSO_DATABASE_AUTH_TOKEN missing');

  for (const table of tables) {
    try {
      await migrateTable(table);
    } catch (error) {
      console.error(`ERROR migrating ${table}:`, error);
    }
  }

  await neon.end();
  console.log('Migration completed.');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  neon.end();
  process.exit(1);
});
