import { createClient } from '@libsql/client';

async function main() {
  const client = createClient({ url: process.env.DATABASE_URL, authToken: process.env.DATABASE_AUTH_TOKEN });
  const cardCount = await client.execute('SELECT count(*) FROM carteirinhas');
  console.log('carteirinhas_count=', cardCount.rows[0][0]);
  const solicitCount = await client.execute("SELECT count(*) FROM solicitacoes WHERE carteirinha_url IS NOT NULL AND carteirinha_url != ''");
  console.log('solicitacoes_with_url_count=', solicitCount.rows[0][0]);
  const sample = await client.execute("SELECT id, tipo, nome, email, status, carteirinha_url FROM solicitacoes WHERE carteirinha_url IS NOT NULL AND carteirinha_url != '' ORDER BY created_at DESC LIMIT 5");
  console.log('sample_solicitacoes=', JSON.stringify(sample.rows, null,2));
}

main().catch((err) => { console.error(err); process.exit(1); });
