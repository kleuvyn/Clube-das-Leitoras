import { NextResponse } from 'next/server';
import { requireAdminOrColaboradora } from '@/lib/auth';
import { db, dbWrite } from '@/lib/db';
import { reflexoesRodaOnline } from '@/lib/db/schema';
import { analyzeContentModeration } from '@/lib/content-moderation';
import { eq, desc, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rodaId = searchParams.get('rodaId');
    const hasPagination = searchParams.has('page') || searchParams.has('limit');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = hasPagination
      ? Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
      : 1000;
    const offset = hasPagination ? (page - 1) * limit : 0;

    const [rows, countResult] = rodaId
      ? await Promise.all([
          db.select().from(reflexoesRodaOnline)
            .where(eq(reflexoesRodaOnline.rodaId, rodaId))
            .orderBy(desc(reflexoesRodaOnline.createdAt))
            .limit(limit)
            .offset(offset),
          db.select({ count: sql<number>`cast(count(*) as integer)` })
            .from(reflexoesRodaOnline)
            .where(eq(reflexoesRodaOnline.rodaId, rodaId)),
        ])
      : await Promise.all([
          db.select().from(reflexoesRodaOnline)
            .orderBy(desc(reflexoesRodaOnline.createdAt))
            .limit(limit)
            .offset(offset),
          db.select({ count: sql<number>`cast(count(*) as integer)` }).from(reflexoesRodaOnline),
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
    console.error('Erro GET /api/rodaonline/reflexoes:', err);
    return NextResponse.json({ error: 'Erro ao buscar reflexões' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rodaId, autoraNome, autoraEmail, texto } = body;

    if (!rodaId || !autoraNome?.trim() || !texto?.trim()) {
      return NextResponse.json({ error: 'rodaId, autoraNome e texto são obrigatórios' }, { status: 400 });
    }

    const moderation = analyzeContentModeration(`${autoraNome} ${texto}`, []);
    if (moderation.blocked) {
      return NextResponse.json({ error: 'Conteúdo não permitido' }, { status: 422 });
    }

    const [inserted] = await dbWrite.insert(reflexoesRodaOnline).values({
      rodaId,
      autoraNome: autoraNome.trim(),
      autoraEmail: autoraEmail?.trim() || null,
      texto: texto.trim(),
    }).returning();

    return NextResponse.json(inserted, { status: 201 });
  } catch (err) {
    console.error('Erro POST /api/rodaonline/reflexoes:', err);
    return NextResponse.json({ error: 'Erro ao salvar reflexão' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdminOrColaboradora();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID necessário' }, { status: 400 });

    await dbWrite.delete(reflexoesRodaOnline).where(eq(reflexoesRodaOnline.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Erro DELETE /api/rodaonline/reflexoes:', err);
    return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 });
  }
}
