import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { encontros } from '@/lib/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { requireAdminOrColaboradora } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hasPagination = searchParams.has('page') || searchParams.has('limit');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = hasPagination
      ? Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
      : 1000;
    const offset = hasPagination ? (page - 1) * limit : 0;

    const [rows, countResult] = await Promise.all([
          db
            .select()
            .from(encontros)
            .orderBy(desc(encontros.data))
            .limit(limit)
            .offset(offset),
          db.select({ count: sql<number>`cast(count(*) as integer)` }).from(encontros),
        ]);

    const total = countResult[0]?.count || 0;
    const pages = Math.ceil(total / limit);

    if (!hasPagination) {
      return NextResponse.json(rows, { status: 200 });
    }

    return NextResponse.json({
      data: rows,
      pagination: { page, limit, total, pages, hasMore: page < pages },
    }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar encontros:', error);
    return NextResponse.json({ error: 'Erro ao buscar encontros' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminOrColaboradora();
    const body = await request.json();
    
    // Removing the missing schema columns
    const { 
      titulo, descricao, local, data, horaInicio, horaFim, imagemUrl, valor, telefone, linkInscricao
    } = body;

    if (!titulo || !data) {
      return NextResponse.json({ error: 'Título e data são obrigatórios' }, { status: 400 });
    }

    const slug = `${titulo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^\w-]/g, '-')}-${Date.now()}`;

    const inserted = await db.insert(encontros).values({
      titulo,
      descricao,
      local,
      data: new Date(data),
      horaInicio,
      horaFim,
      imagemUrl,
      valor,
      telefone,
      linkInscricao,
      slug,
    }).returning();

    return NextResponse.json(inserted[0], { status: 201 });
  } catch (error) {
    console.error('Erro ao criar encontro:', error);
    return NextResponse.json({ error: 'Erro ao criar encontro' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdminOrColaboradora();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) return NextResponse.json({ error: 'ID necessário' }, { status: 400 });

    const updated = await db.update(encontros)
      .set({
        ...body,
        data: body.data ? new Date(body.data) : undefined,
      })
      .where(eq(encontros.id, id))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Erro ao atualizar encontro:', error);
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdminOrColaboradora();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID necessário' }, { status: 400 });

    await db.delete(encontros).where(eq(encontros.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao deletar' }, { status: 500 });
  }
}