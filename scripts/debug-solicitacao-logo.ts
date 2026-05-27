import { createClient } from '@libsql/client';

async function main() {
  const client = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  const email = 'liviabsousa@gmail.com';
  const result = await client.execute({
    sql: `
      SELECT id, nome, email, tipo, status, created_at, foto_url, mensagem
      FROM solicitacoes
      WHERE lower(email) = lower(?)
      ORDER BY created_at DESC
      LIMIT 5
    `,
    args: [email],
  });

  for (const row of result.rows as any[]) {
    const mensagem = (row.mensagem ?? '') as string;
    console.log('---');
    console.log('id:', row.id);
    console.log('nome:', row.nome);
    console.log('tipo:', row.tipo, 'status:', row.status);
    console.log('foto_url:', row.foto_url ? String(row.foto_url).slice(0, 120) : null);
    console.log('mensagem_has_logo_label:', /Logo:/i.test(mensagem));
    console.log('mensagem_has_data_image:', /data:image\//i.test(mensagem));
    console.log('mensagem_len:', mensagem.length);
    console.log('mensagem_preview:', mensagem.slice(0, 300));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
