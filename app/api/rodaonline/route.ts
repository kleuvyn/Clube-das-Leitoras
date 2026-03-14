import { NextResponse } from 'next/server';
import { requireAdminOrColaboradora, requireAdmin, requireMember } from '@/lib/auth';
import { db } from '@/lib/db';
import { rodaonline } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { notificarLeitoras } from '@/lib/notificacao-email';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await db.select().from(rodaonline).orderBy(desc(rodaonline.createdAt));
    return NextResponse.json(rows, { status: 200 });
  } catch (err) {
    console.error('Erro GET /api/rodaonline:', err);
    return NextResponse.json({ error: 'Erro ao buscar rodas online' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    try {
      await requireAdminOrColaboradora();
    } catch (err: any) {
      return NextResponse.json({ error: err?.message || 'Não autorizado' }, { status: err?.status || 401 });
    }

    const body = await request.json();
    if (!body.title) return NextResponse.json({ error: 'Título obrigatório' }, { status: 400 });

    const [inserted] = await db.insert(rodaonline).values({
      title: body.title,
      book: body.book ?? null,
      author: body.author ?? null,
      date: body.date ? new Date(body.date) : null,
      link: body.link ?? null,
      description: body.description ?? null,
      imageUrl: body.imageUrl ?? body.livroCapa ?? null,
      videoUrl: body.videoUrl ?? null,
      linkDrive: body.linkDrive ?? null,
      status: body.status ?? 'ativo',
    }).returning();

    notificarLeitoras({
      secao: 'rodaonline',
      tituloConteudo: body.title,
      descricaoConteudo: body.description ?? '',
    }).catch(console.error);

    return NextResponse.json(inserted, { status: 201 });
  } catch (err) {
    console.error('Erro POST /api/rodaonline:', err);
    return NextResponse.json({ error: 'Erro ao criar roda online' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    try {
      await requireAdmin();
    } catch (err: any) {
      return NextResponse.json({ error: err?.message || 'Não autorizado' }, { status: err?.status || 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

    const [existing] = await db.select().from(rodaonline).where(eq(rodaonline.id, id));
    if (!existing) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

    const [updated] = await db.update(rodaonline)
      .set({
        title: body.title ?? existing.title,
        book: body.book ?? existing.book,
        author: body.author ?? existing.author,
        date: body.date ? new Date(body.date) : existing.date,
        link: body.link ?? existing.link,
        description: body.description ?? existing.description,
        imageUrl: body.imageUrl ?? body.livroCapa ?? existing.imageUrl,
        videoUrl: body.videoUrl ?? existing.videoUrl,
        linkDrive: body.linkDrive ?? existing.linkDrive,
        status: body.status ?? existing.status,
      })
      .where(eq(rodaonline.id, id))
      .returning();

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    console.error('Erro PATCH /api/rodaonline:', err);
    return NextResponse.json({ error: 'Erro ao atualizar roda online' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    try {
      await requireAdmin();
    } catch (err: any) {
      return NextResponse.json({ error: err?.message || 'Não autorizado' }, { status: err?.status || 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

    const [existing] = await db.select().from(rodaonline).where(eq(rodaonline.id, id));
    if (!existing) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

    await db.delete(rodaonline).where(eq(rodaonline.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Erro DELETE /api/rodaonline:', err);
    return NextResponse.json({ error: 'Erro ao excluir roda online' }, { status: 500 });
  }
}
