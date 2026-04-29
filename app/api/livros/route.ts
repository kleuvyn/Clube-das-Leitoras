import { NextResponse } from 'next/server';
import { db, dbWrite } from '@/lib/db';
import { livros, votacoes } from '@/lib/db/schema';
import { eq, desc, and, sql, ne } from 'drizzle-orm';
import { requireAdminOrColaboradora } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const anoParam = searchParams.get('ano');
    const hasPagination = searchParams.has('page') || searchParams.has('limit');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = hasPagination
      ? Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
      : 1000;
    const offset = hasPagination ? (page - 1) * limit : 0;

    const [results, countResult] = anoParam
      ? await Promise.all([
          db.select().from(livros)
            .where(and(eq(livros.ano, parseInt(anoParam)), ne(livros.tipo, 'candidato')))
            .orderBy(desc(livros.mes), desc(livros.votos))
            .limit(limit)
            .offset(offset),
          db.select({ count: sql<number>`cast(count(*) as integer)` })
            .from(livros)
            .where(and(eq(livros.ano, parseInt(anoParam)), ne(livros.tipo, 'candidato'))),
        ])
      : await Promise.all([
          db.select().from(livros)
            .where(ne(livros.tipo, 'candidato'))
            .orderBy(desc(livros.ano), desc(livros.mes), desc(livros.votos))
            .limit(limit)
            .offset(offset),
          db.select({ count: sql<number>`cast(count(*) as integer)` })
            .from(livros)
            .where(ne(livros.tipo, 'candidato')),
        ]);

    if (!hasPagination) {
      return NextResponse.json(results, { status: 200 });
    }

    const total = countResult[0]?.count || 0;
    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      data: results,
      pagination: { page, limit, total, pages, hasMore: page < pages },
    }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar livros:', error);
    return NextResponse.json({ error: 'Erro ao buscar livros' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { titulo, autor, sinopse, capaUrl, mes, ano, isVotacao, indicadoPor, voterKey } = body;

    if (!titulo || !autor) {
      return NextResponse.json({ error: 'Título e autor são obrigatórios' }, { status: 400 });
    }

    
    if (isVotacao && voterKey) {
      const jaVotou = await db.select().from(votacoes).where(eq(votacoes.usuario_email, voterKey)).limit(1);
      if (jaVotou.length > 0) {
        return NextResponse.json({ error: 'Você já votou nesta rodada.' }, { status: 409 });
      }
    }

    
    const [existing] = await db.select()
      .from(livros)
      .where(and(eq(livros.titulo, titulo), eq(livros.autor, autor)));

    if (existing) {
      
      await dbWrite.update(livros)
        .set({ votos: sql`${livros.votos} + 1` })
        .where(eq(livros.id, existing.id));

      
      if (isVotacao && voterKey) {
        await dbWrite.insert(votacoes).values({ livro_id: existing.id, usuario_email: voterKey });
      }

      return NextResponse.json({ message: 'Voto computado!', livroId: existing.id, data: existing }, { status: 200 });
    }

    
    const slug = `${titulo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^\w-]/g, '-')}-${Date.now()}`;
    const mesStr = mes ? String(mes) : String(new Date().getMonth() + 1);
    const anoInt = ano ? Number(ano) : new Date().getFullYear();

    const [inserted] = await dbWrite.insert(livros).values({
      titulo,
      autor,
      sinopse: sinopse ?? null,
      capaUrl: capaUrl ?? null,
      indicadoPor: indicadoPor ?? null,
      mes: mesStr,
      ano: anoInt,
      slug,
      votos: 1,
      tipo: isVotacao ? 'candidato' : 'clube',
    }).returning();

    
    if (isVotacao && voterKey) {
      await dbWrite.insert(votacoes).values({ livro_id: inserted.id, usuario_email: voterKey });
    }

    return NextResponse.json({ ...inserted, livroId: inserted.id }, { status: 201 });
  } catch (error) {
    console.error('Erro ao processar livro:', error);
    return NextResponse.json({ error: 'Erro ao processar livro' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdminOrColaboradora();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) return NextResponse.json({ error: 'ID necessário' }, { status: 400 });

    const { titulo, autor, sinopse, capaUrl, indicadoPor, linkCompra, tipo } = body;

    const updateData: Record<string, unknown> = {};
    if (titulo !== undefined) updateData.titulo = titulo;
    if (autor !== undefined) updateData.autor = autor;
    if (sinopse !== undefined) updateData.sinopse = sinopse;
    if (capaUrl !== undefined) updateData.capaUrl = capaUrl;
    if (indicadoPor !== undefined) updateData.indicadoPor = indicadoPor;
    if (linkCompra !== undefined) updateData.linkCompra = linkCompra;
    if (tipo !== undefined) updateData.tipo = tipo;

    const updated = await dbWrite.update(livros)
      .set(updateData)
      .where(eq(livros.id, id))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdminOrColaboradora();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'ID necessário' }, { status: 400 });

    await dbWrite.delete(livros).where(eq(livros.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao deletar' }, { status: 500 });
  }
}