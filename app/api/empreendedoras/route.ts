import { NextResponse } from 'next/server';
import { requireAdminOrColaboradora, requireAdmin, requireMember } from '@/lib/auth';
import { db, dbWrite } from '@/lib/db';
import { empreendedoras } from '@/lib/db/schema';
import { eq, asc, sql } from 'drizzle-orm';

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

    const rows = await db
      .select()
      .from(empreendedoras)
      .orderBy(asc(empreendedoras.name))
      .limit(limit + 1)
      .offset(offset);

    const hasMore = rows.length > limit;
    const trimmedRows = rows.slice(0, limit);

    const formattedRows = trimmedRows.map(row => ({
      id: row.id,
      negocio: row.name,         
      nome: row.feitoPor,        
      frase: row.frase,
      instagram: row.instagram,
      fotoUrl: row.logoUrl,
      categoria: row.categoria ?? null
    }));

    if (!hasPagination) {
      return NextResponse.json(formattedRows, {
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
        },
      });
    }

    return NextResponse.json({
      data: formattedRows,
      pagination: { page, limit, hasMore }
    }, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err: any) {
    console.error('Erro GET /api/empreendedoras:', err);
    return NextResponse.json({ error: 'Erro ao buscar empreendedoras' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminOrColaboradora();
    const body = await request.json();

    
    if (!body.negocio) {
      return NextResponse.json({ error: 'O nome do negócio é obrigatório' }, { status: 400 });
    }

    const [inserted] = await dbWrite.insert(empreendedoras).values({
      name: body.negocio,
      feitoPor: body.nome,
      frase: body.frase ?? null,
      categoria: body.categoria ?? null,
      instagram: body.instagram ?? null,
      logoUrl: body.fotoUrl ?? null,
    }).returning();

    return NextResponse.json(inserted, { status: 201 });
  } catch (err: any) {
    console.error('Erro INSERT /api/empreendedoras:', err);
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

    const updated = await dbWrite.update(empreendedoras)
      .set({
        name: body.negocio,
        feitoPor: body.nome,
        frase: body.frase,
        categoria: body.categoria,
        instagram: body.instagram,
        logoUrl: body.fotoUrl,
      })
      .where(eq(empreendedoras.id, id))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (err: any) {
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

    await dbWrite.delete(empreendedoras).where(eq(empreendedoras.id, id));
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: 'Erro ao remover' }, { status: 500 });
  }
}