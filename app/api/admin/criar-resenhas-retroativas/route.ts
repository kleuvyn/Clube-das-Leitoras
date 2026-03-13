import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { livroDoMes, resenhas } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    
    await db.execute(sql`ALTER TABLE resenhas ADD COLUMN IF NOT EXISTS published_at text`);

    const livros = await db.select().from(livroDoMes);
    const resenhasExistentes = await db.select().from(resenhas);

    
    const jaCriados = new Set(
      resenhasExistentes
        .map(r => r.book?.toLowerCase().trim())
        .filter(Boolean)
    );

    const criados: string[] = [];
    const ignorados: string[] = [];

    for (const livro of livros) {
      if (!livro.livro) continue;

      const chave = livro.livro.toLowerCase().trim();
      if (jaCriados.has(chave)) {
        ignorados.push(livro.livro);
        continue;
      }

      const mesAno = [livro.mes, livro.ano ? String(livro.ano) : '']
        .filter(Boolean).join('/');

      await db.insert(resenhas).values({
        title: `Resenha: ${livro.livro}`,
        book: livro.livro,
        author: livro.autora ?? null,
        content: livro.sinopse ?? '',
        rating: 5,
        imageUrl: livro.foto ?? null,
        publishedAt: mesAno || null,
      });

      criados.push(livro.livro);
      jaCriados.add(chave);
    }

    return NextResponse.json({
      ok: true,
      criados: criados.length,
      livros_criados: criados,
      ignorados_ja_existiam: ignorados,
    });
  } catch (err: any) {
    console.error('Erro criar-resenhas-retroativas:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
