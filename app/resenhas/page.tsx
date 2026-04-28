import { db } from '@/lib/db';
import { resenhas } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import ResenhasClient from './ResenhasClient';

export const dynamic = 'force-static';
export const revalidate = 300;

export default async function ResenhasPage() {
  const rows = await db
    .select({
      id: resenhas.id,
      title: resenhas.title,
      book: resenhas.book,
      author: resenhas.author,
      content: resenhas.content,
      rating: resenhas.rating,
      publishedAt: resenhas.publishedAt,
      createdAt: resenhas.createdAt,
      // Não incluir o imageUrl aqui para evitar carregar MBs de dados no servidor inicial
    })
    .from(resenhas)
    .orderBy(desc(resenhas.createdAt));

  const initialResenhas = rows.map((r) => ({
    ...r,
    imageUrl: null, // placeholder
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt ?? ''),
  }));

  return <ResenhasClient initialResenhas={initialResenhas} />;
}
