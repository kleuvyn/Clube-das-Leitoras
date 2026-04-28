import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { livros } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const offset = (page - 1) * limit;

    const [results, countResult] = await Promise.all([
      db.select().from(livros)
        .where(eq(livros.tipo, 'curadoria'))
        .orderBy(desc(livros.ano), livros.mes)
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`cast(count(*) as integer)` })
        .from(livros)
        .where(eq(livros.tipo, 'curadoria')),
    ]);

    const hasPagination = searchParams.has('page') || searchParams.has('limit');

    
    const porAno: Record<number, typeof results> = {};
    for (const livro of results) {
      if (!porAno[livro.ano]) porAno[livro.ano] = [];
      porAno[livro.ano].push(livro);
    }

    const grupos = Object.entries(porAno)
      .map(([ano, livros]) => ({ ano: Number(ano), livros }))
      .sort((a, b) => b.ano - a.ano);

    const total = countResult[0]?.count || 0;
    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      data: grupos,
      pagination: { page, limit, total, pages, hasMore: page < pages },
    }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar curadoria:', error);
    return NextResponse.json({ error: 'Erro ao buscar curadoria' }, { status: 500 });
  }
}
