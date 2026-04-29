import { NextResponse } from 'next/server';
import { requireAdminOrColaboradora, requireAdmin, requireMember } from '@/lib/auth';
import { db, dbWrite } from '@/lib/db';
import { resenhas } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { analyzeContentModeration } from '@/lib/content-moderation';

type ResenhaRow = {
  id: string;
  title: string;
  book: string | null;
  author: string | null;
  content: string | null;
  rating: number | null; 
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
      : 200;
    const offset = hasPagination ? (page - 1) * limit : 0;
    const listCacheHeaders = {
      'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
    };

    const [rows, countResult] = await Promise.all([
      db.select().from(resenhas).orderBy(desc(resenhas.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`cast(count(*) as integer)` }).from(resenhas),
    ]);

    const total = countResult[0]?.count || 0;
    const pages = Math.ceil(total / limit);

    if (!hasPagination) {
      return NextResponse.json(rows, { headers: listCacheHeaders });
    }

    return NextResponse.json({
      data: rows,
      pagination: { page, limit, total, pages, hasMore: page < pages }
    }, { headers: listCacheHeaders });
  } catch (err: any) {
    console.error('Erro GET /api/resenhas:', err);
    return NextResponse.json({ error: 'Erro ao carregar resenhas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminOrColaboradora();
    const body = await request.json();

    const title = body.title;
    const content = body.content ?? '';
    const book = body.book ?? '';

    if (!title || !content) {
      return NextResponse.json({ error: 'Título e conteúdo são obrigatórios' }, { status: 400 });
    }

    
    
    const moderation = analyzeContentModeration(`${title} ${book} ${content}`);
    if (moderation.blocked) {
      return NextResponse.json({
        error: 'Conteúdo bloqueado: identificamos linguagem imprópria.',
        details: moderation.triggers.join(', ') 
      }, { status: 400 });
    }

    const [inserted] = await dbWrite.insert(resenhas).values({
      title,
      book: body.book ?? null,
      author: body.author ?? null,
      content,
      
      rating: body.rating ?? 5,
      imageUrl: body.imageUrl ?? null,
      
      publishedAt: body.publishedAt ?? null,
    }).returning();

    return NextResponse.json(inserted, { status: 201 });
  } catch (err: any) {
    console.error('Erro POST /api/resenhas:', err);
    return NextResponse.json({ error: 'Erro ao criar resenha' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) return NextResponse.json({ error: 'ID necessário' }, { status: 400 });

    
    const moderation = analyzeContentModeration(`${body.title ?? ''} ${body.content ?? ''}`);
    if (moderation.blocked) {
      return NextResponse.json({ error: 'Edição bloqueada por conteúdo impróprio.' }, { status: 400 });
    }

    const updated = await dbWrite.update(resenhas)
      .set({
        title: body.title,
        book: body.book,
        author: body.author,
        content: body.content,
        rating: body.rating,
        imageUrl: body.imageUrl,
        
        publishedAt: body.publishedAt ?? null,
      })
      .where(eq(resenhas.id, id))
      .returning();

    if (!updated.length) return NextResponse.json({ error: 'Resenha não encontrada' }, { status: 404 });

    return NextResponse.json(updated[0]);
  } catch (err: any) {
    console.error('Erro PATCH /api/resenhas:', err);
    return NextResponse.json({ error: 'Erro ao atualizar resenha' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

    const result = await dbWrite.delete(resenhas).where(eq(resenhas.id, id)).returning();
    if (!result.length) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Erro DELETE /api/resenhas:', err);
    return NextResponse.json({ error: 'Erro ao remover resenha' }, { status: 500 });
  }
}