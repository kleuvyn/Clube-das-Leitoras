import { NextResponse } from 'next/server';
import { requireAdminOrColaboradora, requireAdmin, requireMember } from '@/lib/auth';
import { db } from '@/lib/db';
import { cronograma } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { notificarLeitoras } from '@/lib/notificacao-email';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const cacheHeaders = {
      'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
    };

    const { searchParams } = new URL(request.url);
    const anoParam = searchParams.get('ano');
    const todosParam = searchParams.get('todos');
    const hasPagination = searchParams.has('page') || searchParams.has('limit');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = hasPagination
      ? Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
      : 1000;
    const offset = hasPagination ? (page - 1) * limit : 0;

    
    if (anoParam) {
      const rows = await db.select()
        .from(cronograma)
        .where(eq(cronograma.ano, Number(anoParam)))
        .orderBy(desc(cronograma.createdAt))
        .limit(1);
      return NextResponse.json(rows[0] || null, { headers: cacheHeaders });
    }

    
    if (todosParam) {
      const rows = await db.select().from(cronograma).orderBy(desc(cronograma.createdAt));
      return NextResponse.json(rows, { headers: cacheHeaders });
    }

    const [rows, countResult] = await Promise.all([
      db.select().from(cronograma).orderBy(desc(cronograma.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`cast(count(*) as integer)` }).from(cronograma),
    ]);

    const total = countResult[0]?.count || 0;
    const pages = Math.ceil(total / limit);

    if (!hasPagination) {
      return NextResponse.json(rows, { headers: cacheHeaders });
    }

    return NextResponse.json({
      data: rows,
      pagination: { page, limit, total, pages, hasMore: page < pages },
    }, { headers: cacheHeaders });
  } catch (err: any) {
    console.error('Erro GET /api/cronograma:', err);
    return NextResponse.json({ error: 'Erro ao carregar cronograma' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    
    await requireAdminOrColaboradora();
    const body = await request.json();

    const [inserted] = await db.insert(cronograma).values({
      title: body.title || 'Cronograma',
      notes: body.notes || null,
      imageUrl: body.imageUrl || null,
      ano: body.ano ? Number(body.ano) : new Date().getFullYear(),
      status: body.status || 'ativo',
    }).returning();

    notificarLeitoras({
      secao: 'cronograma',
      tituloConteudo: body.title ?? 'Cronograma',
      descricaoConteudo: body.notes ?? '',
    }).catch(console.error);

    return NextResponse.json(inserted, { status: 201 });
  } catch (err: any) {
    
    console.error('--- ERRO NO POST /api/cronograma ---');
    console.error('Mensagem:', err.message);
    console.error('Detalhes:', err);
    return NextResponse.json({ error: err.message || 'Erro ao criar item' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdminOrColaboradora(); 
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) return NextResponse.json({ error: 'ID necessário para atualizar' }, { status: 400 });

    const updated = await db.update(cronograma)
      .set({
        title: body.title,
        notes: body.notes || null,
        imageUrl: body.imageUrl || null,
        ano: body.ano ? Number(body.ano) : undefined,
        status: body.status || 'ativo',
      })
      .where(eq(cronograma.id, id))
      .returning();

    if (updated.length === 0) {
        return NextResponse.json({ error: 'Cronograma não encontrado' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (err: any) {
    console.error('Erro PATCH /api/cronograma:', err);
    return NextResponse.json({ error: err.message || 'Erro ao atualizar' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
   await requireAdminOrColaboradora();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

    await db.delete(cronograma).where(eq(cronograma.id, id)); 
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Erro DELETE /api/cronograma:', err);
    return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 });
  }
}