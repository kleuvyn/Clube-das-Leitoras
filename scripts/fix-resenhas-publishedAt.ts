import { db } from '../lib/db';
import { resenhas } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import { normalizeDateValue, formatMonthYear } from '../lib/utils';

async function run() {
  const rows = await db.select().from(resenhas);

  console.log('Registros totais:', rows.length);

  let updated = 0;

  for (const row of rows) {
    const currentPublished = row.publishedAt ?? '';
    const hasPublished = typeof currentPublished === 'string' && currentPublished.trim() !== '';
    if (!hasPublished) {
      const createdDate = normalizeDateValue((row as any).createdAt);
      const fallback = formatMonthYear(createdDate);
      await db.update(resenhas).set({ publishedAt: fallback }).where(eq(resenhas.id, row.id));
      updated += 1;
      console.log(`Atualizado ${row.id}: publishedAt -> ${fallback}`);
      continue;
    }

    const normalized = normalizeDateValue(currentPublished);
    const normalizedPublished = formatMonthYear(normalized);
    if (normalizedPublished !== currentPublished) {
      await db.update(resenhas).set({ publishedAt: normalizedPublished }).where(eq(resenhas.id, row.id));
      updated += 1;
      console.log(`Padronizado ${row.id}: ${currentPublished} -> ${normalizedPublished}`);
    }
  }

  console.log('Total de registros atualizados:', updated);
}

run().catch((error) => {
  console.error('Erro ao atualizar resenhas:', error);
  process.exit(1);
});
