import { NextResponse } from 'next/server';
import { requireAdminOrColaboradora, requireAdmin, requireMember } from '@/lib/auth';
import { db, dbWrite } from '@/lib/db';
import { livroDoMes, resenhas } from '@/lib/db/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { notificarLeitoras } from '@/lib/notificacao-email';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const anoParam = searchParams.get('ano');
    const idParam = searchParams.get('id');
    const summaryParam = searchParams.get('summary') === '1';
    const hasPagination = searchParams.has('page') || searchParams.has('limit');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = hasPagination
      ? Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
      : 200;
    const offset = hasPagination ? (page - 1) * limit : 0;
    const listCacheHeaders = {
      'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
    };

    if (idParam) {
      const rows = await db
        .select()
        .from(livroDoMes)
        .where(eq(livroDoMes.id, idParam))
        .limit(1);
      return NextResponse.json(rows[0] ?? null, {
        headers: {
          'Cache-Control': 'public, max-age=30, s-maxage=120, stale-while-revalidate=300',
        },
      });
    }

    let rows;
    let total = 0;
    if (summaryParam) {
      const baseSelect = db
        .select({
          id: livroDoMes.id,
          mes: livroDoMes.mes,
          num: livroDoMes.num,
          ano: livroDoMes.ano,
          livro: livroDoMes.livro,
          autora: livroDoMes.autora,
          foto: livroDoMes.foto,
          sinopse: livroDoMes.sinopse,
          tag: livroDoMes.tag,
          updatedAt: livroDoMes.updatedAt,
        })
        .from(livroDoMes);

      const baseCount = db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(livroDoMes);

      const [resultRows, countResult] = anoParam
        ? await Promise.all([
            baseSelect.where(eq(livroDoMes.ano, Number(anoParam))).orderBy(desc(livroDoMes.updatedAt)).limit(limit).offset(offset),
            baseCount.where(eq(livroDoMes.ano, Number(anoParam))),
          ])
        : await Promise.all([
            baseSelect.orderBy(desc(livroDoMes.updatedAt)).limit(limit).offset(offset),
            baseCount,
          ]);

      rows = resultRows;
      total = countResult[0]?.count || 0;
    } else {
      const baseSelect = db.select().from(livroDoMes);
      const baseCount = db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(livroDoMes);

      const [resultRows, countResult] = anoParam
        ? await Promise.all([
            baseSelect.where(eq(livroDoMes.ano, Number(anoParam))).orderBy(desc(livroDoMes.updatedAt)).limit(limit).offset(offset),
            baseCount.where(eq(livroDoMes.ano, Number(anoParam))),
          ])
        : await Promise.all([
            baseSelect.orderBy(desc(livroDoMes.updatedAt)).limit(limit).offset(offset),
            baseCount,
          ]);

      rows = resultRows;
      total = countResult[0]?.count || 0;
    }

    if (!hasPagination) {
      return NextResponse.json(rows, { headers: listCacheHeaders });
    }

    const pages = Math.ceil(total / limit);
    return NextResponse.json({
      data: rows,
      pagination: { page, limit, total, pages, hasMore: page < pages },
    }, { headers: listCacheHeaders });
  } catch (err: any) {
    console.error('Erro GET /api/livro-do-mes:', err);
    return NextResponse.json({ error: 'Erro ao carregar o livro do mês' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminOrColaboradora();
    const body = await request.json();

    if (!body.livro || !body.autora) {
      return NextResponse.json({ error: 'Livro e autora são obrigatórios' }, { status: 400 });
    }

    const [inserted] = await dbWrite.insert(livroDoMes).values({
      mes: body.mes ?? null,
      num: body.num ?? null,
      ano: body.ano ? Number(body.ano) : new Date().getFullYear(),
      livro: body.livro,
      autora: body.autora,
      foto: body.foto ?? null,
      sinopse: body.sinopse ?? null,
      tag: body.tag ?? null,
      diaEncontro: body.diaEncontro ?? null,
      horarioEncontro: body.horarioEncontro ?? null,
      confirmado: body.confirmado ?? false,
    }).returning();

    
    const mesAno = [body.mes, body.ano ? String(body.ano) : String(new Date().getFullYear())]
      .filter(Boolean).join('/');
    await dbWrite.insert(resenhas).values({
      title: `Resenha: ${body.livro}`,
      book: body.livro,
      author: body.autora,
      content: body.sinopse ?? '',
      rating: 5,
      imageUrl: body.foto ?? null,
      publishedAt: mesAno,
    });

    // Notifica leitoras em background
    notificarLeitoras({
      secao: 'livro-do-mes',
      tituloConteudo: `${body.livro} — ${body.autora}`,
      descricaoConteudo: body.sinopse ?? '',
    }).catch(console.error);

    return NextResponse.json({ success: true, data: inserted }, { status: 201 });
  } catch (err: any) {
    console.error('Erro POST /api/livro-do-mes:', err);
    return NextResponse.json({ error: 'Erro ao criar livro do mês' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

    const body = await request.json();

    const [updated] = await dbWrite.update(livroDoMes)
      .set({
        mes: body.mes ?? null,
        num: body.num ?? null,
        ano: body.ano ? Number(body.ano) : null,
        livro: body.livro ?? null,
        autora: body.autora ?? null,
        foto: body.foto ?? null,
        sinopse: body.sinopse ?? null,
        tag: body.tag ?? null,
        diaEncontro: body.diaEncontro ?? null,
        horarioEncontro: body.horarioEncontro ?? null,
        confirmado: body.confirmado ?? false,
        updatedAt: new Date(),
      })
      .where(eq(livroDoMes.id, id))
      .returning();

    if (!updated) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error('Erro PATCH /api/livro-do-mes:', err);
    const status = err?.status === 401 ? 401 : err?.status === 403 ? 403 : 500;
    return NextResponse.json({ error: err?.message || 'Erro ao atualizar' }, { status });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

    await dbWrite.delete(livroDoMes).where(eq(livroDoMes.id, id));
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Erro DELETE /api/livro-do-mes:', err);
    const status = err?.status === 401 ? 401 : err?.status === 403 ? 403 : 500;
    return NextResponse.json({ error: err?.message || 'Erro ao remover' }, { status });
  }
}