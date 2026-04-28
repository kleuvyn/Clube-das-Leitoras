import { db } from '@/lib/db';
import { solicitacoes } from '@/lib/db/schema';
import { and, eq, lt } from 'drizzle-orm';

async function main() {
  const now = new Date();
  const threshold = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); // 90 dias

  const deleted = await db.delete(solicitacoes).where(and(eq(solicitacoes.status, 'pendente'), lt(solicitacoes.createdAt, threshold)));
  console.log(`Cleanup executado. ${deleted} solicitações pendentes > 90 dias foram removidas.`);
}

main().catch((err) => {
  console.error('Erro no cleanup de solicitações:', err);
  process.exit(1);
});