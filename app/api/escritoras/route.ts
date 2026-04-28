import { NextResponse } from 'next/server';
import { requireAdminOrColaboradora, requireAdmin, requireMember } from '@/lib/auth';
import { db } from '@/lib/db';
import { escritoras } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

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
      db.select().from(escritoras).orderBy(desc(escritoras.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`cast(count(*) as integer)` }).from(escritoras),
    ]);

    const total = countResult[0]?.count || 0;
    const pages = Math.ceil(total / limit);

    if (!hasPagination) {
      return NextResponse.json(rows, {
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
        },
      });
    }

    return NextResponse.json({
      data: rows,
      pagination: { page, limit, total, pages, hasMore: page < pages }
    }, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err: any) {
    console.error('Erro GET /api/escritoras:', err);
    return NextResponse.json({ error: 'Erro ao buscar escritoras' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminOrColaboradora();
    const body = await request.json();

    if (!body.nome || !body.livroTitulo) {
      return NextResponse.json({ error: 'Nome e título do livro são obrigatórios' }, { status: 400 });
    }

    const [inserted] = await db.insert(escritoras).values({
      nome: body.nome,
      livroTitulo: body.livroTitulo,
      genero: body.genero ?? null,
      sinopse: body.sinopse ?? null,
      instagram: body.instagram ?? null,
      linkCompra: body.linkCompra ?? null,
      capaUrl: body.capaUrl ?? null,
      site: body.site ?? null,
      bio: body.bio ?? null,
    }).returning();

    return NextResponse.json(inserted, { status: 201 });
  } catch (err: any) {
    console.error('Erro POST /api/escritoras:', err);
    return NextResponse.json({ error: 'Erro ao cadastrar' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) return NextResponse.json({ error: 'ID necessário' }, { status: 400 });

    const [updated] = await db.update(escritoras)
      .set({
        nome: body.nome,
        livroTitulo: body.livroTitulo,
        genero: body.genero ?? null,
        sinopse: body.sinopse ?? null,
        instagram: body.instagram ?? null,
        linkCompra: body.linkCompra ?? null,
        capaUrl: body.capaUrl ?? null,
        site: body.site ?? null,
        bio: body.bio ?? null,
      })
      .where(eq(escritoras.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID necessário' }, { status: 400 });

    await db.delete(escritoras).where(eq(escritoras.id, id));
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: 'Erro ao remover' }, { status: 500 });
  }
}
