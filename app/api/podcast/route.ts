import { NextResponse } from 'next/server';
import { requireAdminOrColaboradora, requireAdmin, requireMember } from '@/lib/auth';
import { db } from '@/lib/db';
import { podcasts } from '@/lib/db/schema';
import { desc, eq, sql } from 'drizzle-orm';
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
      db.select().from(podcasts).orderBy(desc(podcasts.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`cast(count(*) as integer)` }).from(podcasts),
    ]);

    const total = countResult[0]?.count || 0;
    const pages = Math.ceil(total / limit);

    if (!hasPagination) {
      return NextResponse.json(rows, {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
        },
      });
    }

    return NextResponse.json({
      data: rows,
      pagination: { page, limit, total, pages, hasMore: page < pages }
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
      },
    });
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