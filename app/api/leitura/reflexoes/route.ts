import { NextResponse } from 'next/server';
import { requireAdminOrColaboradora } from '@/lib/auth';
import { db } from '@/lib/db';
import { reflexoesLobos } from '@/lib/db/schema';
import { analyzeContentModeration } from '@/lib/content-moderation';
import { eq, desc, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const leituraId = searchParams.get('leituraId');
    const hasPagination = searchParams.has('page') || searchParams.has('limit');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = hasPagination
      ? Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
      : 1000;
    const offset = hasPagination ? (page - 1) * limit : 0;

    const [rows, countResult] = leituraId
      ? await Promise.all([
          db.select().from(reflexoesLobos)
            .where(eq(reflexoesLobos.leituraId, leituraId))
            .orderBy(desc(reflexoesLobos.createdAt))
            .limit(limit)
            .offset(offset),
          db.select({ count: sql<number>`cast(count(*) as integer)` })
            .from(reflexoesLobos)
            .where(eq(reflexoesLobos.leituraId, leituraId)),
        ])
      : await Promise.all([
          db.select().from(reflexoesLobos)
            .orderBy(desc(reflexoesLobos.createdAt))
            .limit(limit)
            .offset(offset),
          db.select({ count: sql<number>`cast(count(*) as integer)` }).from(reflexoesLobos),
        ]);

    if (!hasPagination) {
      return NextResponse.json(rows);
    }

    const total = countResult[0]?.count || 0;
    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      data: rows,
      pagination: { page, limit, total, pages, hasMore: page < pages },
    });
  } catch (err) {
    console.error('Erro GET /api/leitura/reflexoes:', err);
    return NextResponse.json({ error: 'Erro ao buscar reflexões' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { leituraId, autoraNome, autoraEmail, texto } = body;

    if (!leituraId || !autoraNome?.trim() || !texto?.trim()) {
      return NextResponse.json({ error: 'leituraId, autoraNome e texto são obrigatórios' }, { status: 400 });
    }

    const moderation = analyzeContentModeration(`${autoraNome} ${texto}`, []);
    if (moderation.blocked) {
      return NextResponse.json({ error: 'Conteúdo não permitido' }, { status: 422 });
    }

    const [inserted] = await db.insert(reflexoesLobos).values({
      leituraId,
      autoraNome: autoraNome.trim(),
      autoraEmail: autoraEmail?.trim() || null,
      texto: texto.trim(),
    }).returning();

    return NextResponse.json(inserted, { status: 201 });
  } catch (err) {
    console.error('Erro POST /api/leitura/reflexoes:', err);
    return NextResponse.json({ error: 'Erro ao salvar reflexão' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdminOrColaboradora();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID necessário' }, { status: 400 });

    await db.delete(reflexoesLobos).where(eq(reflexoesLobos.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Erro DELETE /api/leitura/reflexoes:', err);
    return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 });
  }
}
