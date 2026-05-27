import 'dotenv/config';
import crypto from 'crypto';
import { createClient } from '@libsql/client';

function extractMensagemValue(mensagem: string | null | undefined, labels: string[]) {
  if (!mensagem) return '';
  const lines = mensagem.split('\n').map((line) => line.trim()).filter(Boolean);
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    for (const label of labels) {
      const lowerLabel = `${label.toLowerCase()}:`;
      if (lowerLine.startsWith(lowerLabel)) {
        return line.slice(lowerLabel.length).trim();
      }
    }
  }
  return '';
}

async function main() {
  const client = createClient({ url: process.env.DATABASE_URL, authToken: process.env.DATABASE_AUTH_TOKEN });

  const solicitacoes = await client.execute({
    sql: `SELECT id, nome, mensagem, instagram, site, foto_url FROM solicitacoes WHERE tipo = 'escritora' AND status = 'aprovada' ORDER BY created_at ASC`,
  });

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of solicitacoes.rows) {
    const nome = (row.nome || '').toString().trim();
    const livroTitulo = extractMensagemValue(row.mensagem as string, ['Título do Livro']);
    if (!nome || !livroTitulo) {
      console.warn('[backfill-escritoras] pulando solicitação sem nome ou título:', row.id);
      skipped += 1;
      continue;
    }

    const genero = extractMensagemValue(row.mensagem as string, ['Gênero Literário']);
    const linkCompra = extractMensagemValue(row.mensagem as string, ['Link de Compra']);
    const site = extractMensagemValue(row.mensagem as string, ['Site / Blog']);
    const sinopse = extractMensagemValue(row.mensagem as string, ['Sinopse do Livro']);
    const bio = extractMensagemValue(row.mensagem as string, ['Bio da Escritora']);
    const capaUrl = extractMensagemValue(row.mensagem as string, ['Capa']) || row.foto_url || null;

    const existing = await client.execute({
      sql: `SELECT id FROM escritoras WHERE lower(nome) = lower(?) AND lower(livro_titulo) = lower(?) LIMIT 1`,
      args: [nome, livroTitulo],
    });

    if (existing.rows.length > 0) {
      const existingId = existing.rows[0].id;
      await client.execute({
        sql: `UPDATE escritoras SET genero = ?, sinopse = ?, instagram = ?, link_compra = ?, capa_url = ?, site = ?, bio = ? WHERE id = ?`,
        args: [genero || null, sinopse || null, row.instagram || null, linkCompra || null, capaUrl, site || row.site || null, bio || null, existingId],
      });
      updated += 1;
      console.log('[backfill-escritoras] atualizado', nome, livroTitulo);
    } else {
      const id = crypto.randomUUID();
      console.log('[backfill-escritoras] inserting', { id, nome, livroTitulo });
      await client.execute({
        sql: `INSERT INTO escritoras (id, nome, livro_titulo, genero, sinopse, instagram, link_compra, capa_url, site, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
        args: [id, nome, livroTitulo, genero || null, sinopse || null, row.instagram || null, linkCompra || null, capaUrl, site || row.site || null, bio || null],
      });
      created += 1;
      console.log('[backfill-escritoras] criado', nome, livroTitulo);
    }
  }

  console.log(`done: created=${created} updated=${updated} skipped=${skipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
