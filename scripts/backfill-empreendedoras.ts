import crypto from 'crypto';
import { createClient } from '@libsql/client';

type Row = { id: string; nome: string; mensagem: string; instagram: string | null; site: string | null; foto_url: string | null };

function extractMensagemValue(mensagem: string | null | undefined, labels: string[]) {
  if (!mensagem) return '';
  const lines = mensagem
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

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
  const client = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  const solicitacoes = await client.execute({
    sql: `SELECT id, nome, mensagem, instagram, site FROM solicitacoes WHERE tipo='empreendedora' AND status='aprovada' ORDER BY created_at ASC`,
  });

  const rows = solicitacoes.rows as Row[];
  console.log(`Found ${rows.length} approved empreendedora solicitacoes.`);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    const businessName = row.nome?.trim() || '';
    if (!businessName) {
      console.warn('[backfill-empreendedoras] pulando solicitação sem nome do negócio:', row.id);
      skipped += 1;
      continue;
    }

    const feitoPor = extractMensagemValue(row.mensagem, ['Empreendedora']) || null;
    const categoria = extractMensagemValue(row.mensagem, ['Categoria']) || null;
    const frase = extractMensagemValue(row.mensagem, ['A Essência (Frase de impacto)']) || null;
    const logoUrl = extractMensagemValue(row.mensagem, ['Logo']) || row.foto_url || null;
    const website = row.site || null;

    const whereClause = feitoPor
      ? `WHERE lower(name)=lower(?) AND lower(feito_por)=lower(?) LIMIT 1`
      : `WHERE lower(name)=lower(?) LIMIT 1`;
    const args = feitoPor ? [businessName, feitoPor] : [businessName];

    const exists = await client.execute({
      sql: `SELECT id FROM empreendedoras ${whereClause}`,
      args,
    });

    if (exists.rows.length > 0) {
      const existingId = exists.rows[0].id;
      await client.execute({
        sql: `UPDATE empreendedoras SET feito_por = ?, frase = ?, categoria = ?, instagram = ?, logo_url = ?, website = ? WHERE id = ?`,
        args: [feitoPor, frase, categoria, row.instagram || null, logoUrl, website, existingId],
      });
      updated += 1;
      console.log('[backfill-empreendedoras] atualizado:', businessName, feitoPor || '(sem empreendedora)');
    } else {
      await client.execute({
        sql: `INSERT INTO empreendedoras (id, name, feito_por, frase, categoria, instagram, logo_url, website, bio, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, strftime('%s','now'))`,
        args: [
          crypto.randomUUID(),
          businessName,
          feitoPor,
          frase,
          categoria,
          row.instagram || null,
          logoUrl,
          website,
        ],
      });
      inserted += 1;
      console.log('[backfill-empreendedoras] criado:', businessName, feitoPor || '(sem empreendedora)');
    }
  }

  console.log(`done: inserted=${inserted} updated=${updated} skipped=${skipped}`);

  console.log(`Inserted ${inserted} new empreendedoras.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
