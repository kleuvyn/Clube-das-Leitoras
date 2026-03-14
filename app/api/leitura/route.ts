import { NextResponse } from 'next/server';
import { requireAdminOrColaboradora } from '@/lib/auth';
import { db } from '@/lib/db';
import { leituras } from '@/lib/db/schema'; 
import { eq, desc } from 'drizzle-orm';
import { notificarLeitoras } from '@/lib/notificacao-email';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await db.select()
      .from(leituras)
      .orderBy(desc(leituras.createdAt));

    const mapRow = (row: typeof rows[0]) => ({
      id: row.id,
      data: row.data || '',
      tema: row.title,
      linkMeet: row.link,
      linkLive: row.linkLive,
      linkDrive: row.linkDrive,
      imagem: row.imageUrl,
      status: row.status,
    });

    return NextResponse.json({
      encontros: rows.filter(r => r.status === 'ativo').map(mapRow),
      encerrados: rows.filter(r => r.status === 'encerrado').map(mapRow),
    }, { status: 200 });

  } catch (err) {
    console.error('Erro GET /api/leitura:', err);
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminOrColaboradora();
    const body = await request.json();

    
    if (!body.tema) return NextResponse.json({ error: 'Tema é obrigatório' }, { status: 400 });

    const [inserted] = await db.insert(leituras).values({
      title: body.tema,           
      link: body.linkMeet ?? null,
      linkLive: body.linkLive ?? null,
      linkDrive: body.linkDrive ?? null,
      imageUrl: body.imagem ?? null,
      data: body.data ?? null,     
      status: 'ativo',
    }).returning();

    notificarLeitoras({
      secao: 'leitura',
      tituloConteudo: body.tema,
      descricaoConteudo: '',
    }).catch(console.error);

    return NextResponse.json(inserted, { status: 201 });
  } catch (err) {
    console.error('Erro POST /api/leitura-atual:', err);
    return NextResponse.json({ error: 'Erro ao criar' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdminOrColaboradora();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID necessário' }, { status: 400 });

    const body = await request.json();
    const campos: Record<string, unknown> = {};
    if (body.tema !== undefined) campos.title = body.tema;
    if (body.linkMeet !== undefined) campos.link = body.linkMeet;
    if (body.linkLive !== undefined) campos.linkLive = body.linkLive;
    if (body.linkDrive !== undefined) campos.linkDrive = body.linkDrive;
    if (body.imagem !== undefined) campos.imageUrl = body.imagem;
    if (body.data !== undefined) campos.data = body.data;
    if (body.status !== undefined) campos.status = body.status;

    const [updated] = await db.update(leituras).set(campos).where(eq(leituras.id, id)).returning();
    return NextResponse.json(updated);
  } catch (err) {
    console.error('Erro PATCH /api/leitura:', err);
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdminOrColaboradora();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID necessário' }, { status: 400 });

    await db.delete(leituras).where(eq(leituras.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Erro DELETE /api/leitura:', err);
    return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 });
  }
}