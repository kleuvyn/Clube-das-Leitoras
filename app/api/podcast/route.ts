import { NextResponse } from 'next/server';
import { requireAdminOrColaboradora, requireAdmin, requireMember } from '@/lib/auth';
import { db } from '@/lib/db';
import { podcasts } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { notificarLeitoras } from '@/lib/notificacao-email';

export const dynamic = 'force-dynamic';

type PodcastRow = {
  id: string;
  titulo: string;
  convidada: string | null;
  duracao: string | null;
  data: string | null;
  resumo: string | null;
  audioUrl: string | null;      
  spotifyUrl: string | null;    
  youtubeUrl: string | null;    
  imageUrl: string | null;      
  createdAt: string;
};

export async function GET() {
  try {
    
    
    const rows = await db.select().from(podcasts).orderBy(desc(podcasts.createdAt));
    return NextResponse.json(rows, { status: 200 });
  } catch (err) {
    console.error('Erro GET /api/podcast:', err);
    return NextResponse.json({ error: 'Erro ao buscar podcasts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminOrColaboradora();
    const body = await request.json();

    if (!body.titulo) {
      return NextResponse.json({ error: 'O título do episódio é obrigatório' }, { status: 400 });
    }

    const [inserted] = await db.insert(podcasts).values({
      titulo: body.titulo,
      convidada: body.convidada ?? null,
      duracao: body.duracao ?? null,
      data: body.data ?? null,
      resumo: body.resumo ?? null,
      audioUrl: body.audioUrl ?? null,
      spotifyUrl: body.spotifyUrl ?? null,
      youtubeUrl: body.youtubeUrl ?? null,
      imageUrl: body.imageUrl ?? null,
    }).returning();

    notificarLeitoras({
      secao: 'podcast',
      tituloConteudo: body.titulo,
      descricaoConteudo: body.resumo ?? '',
    }).catch(console.error);

    return NextResponse.json({ success: true, data: inserted }, { status: 201 });
  } catch (err) {
    console.error('Erro POST /api/podcast:', err);
    return NextResponse.json({ error: 'Erro ao criar episódio' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdminOrColaboradora();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) return NextResponse.json({ error: 'ID necessário' }, { status: 400 });

    const updated = await db.update(podcasts)
      .set({
        titulo: body.titulo,
        convidada: body.convidada,
        duracao: body.duracao,
        data: body.data,
        resumo: body.resumo,
        audioUrl: body.audioUrl,
        spotifyUrl: body.spotifyUrl,
        youtubeUrl: body.youtubeUrl,
        imageUrl: body.imageUrl,
      })
      .where(eq(podcasts.id, id))
      .returning();

    if (!updated.length) return NextResponse.json({ error: 'Episódio não encontrado' }, { status: 404 });

    return NextResponse.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error('Erro PATCH /api/podcast:', err);
    return NextResponse.json({ error: 'Erro ao atualizar podcast' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdminOrColaboradora();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID necessário' }, { status: 400 });

    await db.delete(podcasts).where(eq(podcasts.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao remover episódio' }, { status: 500 });
  }
}