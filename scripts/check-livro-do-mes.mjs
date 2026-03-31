import { createClient } from "@libsql/client";

async function main() {
  const url = process.env.DATABASE_URL;
  const auth = process.env.DATABASE_AUTH_TOKEN;
  if (!url) {
    console.error('Por favor defina DATABASE_URL no ambiente (ex: libsql://...)');
    process.exit(1);
  }
  const client = createClient({ url, authToken: auth });
  try {
    const res = await client.execute({
      sql: `SELECT id, mes, num, ano, livro, autora, foto, sinopse, confirmado, updated_at FROM livro_do_mes ORDER BY updated_at DESC LIMIT 50;`,
    });
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('Erro ao consultar Turso:', err);
    process.exit(1);
  } finally {
    try { await client.end(); } catch (e) { /* ignore */ }
  }
}

main();
