import { createClient } from '@libsql/client';

async function main() {
  const client = createClient({ url: process.env.DATABASE_URL, authToken: process.env.DATABASE_AUTH_TOKEN });
  const solicitacoes = await client.execute("SELECT id, email, carteirinha_url FROM solicitacoes WHERE status = 'aprovada' AND carteirinha_url IS NOT NULL AND carteirinha_url != ''");
  console.log('found approved solicitacoes with card url:', solicitacoes.rows.length);

  for (const row of solicitacoes.rows) {
    const [solicitacaoId, email, url] = Array.isArray(row)
      ? row
      : [row.id, row.email, row.carteirinha_url];
    const existing = await client.execute('SELECT count(*) FROM carteirinhas WHERE solicitacao_id = ?', [solicitacaoId]);
    if (existing.rows[0][0] > 0) {
      console.log('skip already migrated:', solicitacaoId);
      continue;
    }
    const collaborator = await client.execute('SELECT id FROM colaboradoras WHERE lower(email) = lower(?) LIMIT 1', [email]);
    const colaboradoraId = collaborator.rows.length > 0 ? collaborator.rows[0][0] : null;
    const newId = globalThis.crypto.randomUUID();
    await client.execute('INSERT INTO carteirinhas (id, solicitacao_id, colaboradora_id, url, created_at) VALUES (?, ?, ?, ?, strftime(\'%s\', \'now\'))', [newId, solicitacaoId, colaboradoraId, url]);
    console.log('inserted card for solicitacao', solicitacaoId, 'collaboradora', colaboradoraId);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
