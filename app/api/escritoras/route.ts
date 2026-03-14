import { NextResponse } from 'next/server';
import { requireAdminOrColaboradora, requireAdmin, requireMember } from '@/lib/auth';
import { db } from '@/lib/db';
import { escritoras } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await db.select().from(escritoras).orderBy(desc(escritoras.createdAt));
    return NextResponse.json(rows);
  } catch (err: any) {
    console.error('Erro GET /api/escritoras:', err);
    return NextResponse.json({ error: 'Erro ao buscar escritoras' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireMember();
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
