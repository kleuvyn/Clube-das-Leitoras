import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { livros } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const results = await db.select().from(livros)
      .where(eq(livros.tipo, 'curadoria'))
      .orderBy(desc(livros.ano), livros.mes);

    
    const porAno: Record<number, typeof results> = {};
    for (const livro of results) {
      if (!porAno[livro.ano]) porAno[livro.ano] = [];
      porAno[livro.ano].push(livro);
    }

    const grupos = Object.entries(porAno)
      .map(([ano, livros]) => ({ ano: Number(ano), livros }))
      .sort((a, b) => b.ano - a.ano);

    return NextResponse.json(grupos, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar curadoria:', error);
    return NextResponse.json({ error: 'Erro ao buscar curadoria' }, { status: 500 });
  }
}
