import { NextResponse } from 'next/server';
import { requireAdminOrColaboradora } from '@/lib/auth';
import { client, db, dbWrite } from '@/lib/db';
import { reflexoesRodaOnline } from '@/lib/db/schema';
import { analyzeContentModeration } from '@/lib/content-moderation';
import { eq, desc, sql } from 'drizzle-orm';

function parseCookieHeader(cookieHeader: string | null | undefined) {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce<Record<string, string>>((acc, cookiePart) => {
    const [name, ...rest] = cookiePart.split('=');
    if (!name) return acc;
    acc[name.trim()] = decodeURIComponent(rest.join('=').trim());
    return acc;
  }, {});
}

function getPublicUserFromRequest(request: Request) {
  const raw = request.headers.get('cookie');
  const parsed = parseCookieHeader(raw);
  return {
    userEmail: parsed['clube-user-email'] || null,
    userName: parsed['clube-user-name'] || null,
  };
}

async function ensureReflexoesLikesColumn() {
  const result = await client.execute("PRAGMA table_info('reflexoes_roda_online')");
  const hasLikes = Array.isArray(result.rows) && result.rows.some((row: any) => row?.name === 'likes');
  if (!hasLikes) {
    await client.execute('ALTER TABLE reflexoes_roda_online ADD COLUMN likes integer DEFAULT 0 NOT NULL');
  }
}

async function ensureReflexoesReplyToColumn() {
  const result = await client.execute("PRAGMA table_info('reflexoes_roda_online')");
  const hasReplyTo = Array.isArray(result.rows) && result.rows.some((row: any) => row?.name === 'reply_to_id');
  if (!hasReplyTo) {
    await client.execute('ALTER TABLE reflexoes_roda_online ADD COLUMN reply_to_id text');
  }
}

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await Promise.all([ensureReflexoesLikesColumn(), ensureReflexoesReplyToColumn()]);
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
    await Promise.all([ensureReflexoesLikesColumn(), ensureReflexoesReplyToColumn()]);
    const body = await request.json();
    const { rodaId, autoraNome, autoraEmail, texto, replyToId } = body;

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
      replyToId: replyToId || null,
    }).returning();

    return NextResponse.json(inserted, { status: 201 });
  } catch (err) {
    console.error('Erro POST /api/rodaonline/reflexoes:', err);
    return NextResponse.json({ error: 'Erro ao salvar reflexão' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await ensureReflexoesLikesColumn();
    const body = await request.json();
    const { id, texto, action } = body;

    if (!id || (!texto?.trim() && action !== 'like')) {
      return NextResponse.json({ error: 'ID e texto são obrigatórios para edição.' }, { status: 400 });
    }

    if (action === 'like') {
      const [updated] = await dbWrite.update(reflexoesRodaOnline)
        .set({ likes: sql`coalesce(${reflexoesRodaOnline.likes}, 0) + 1` })
        .where(eq(reflexoesRodaOnline.id, id))
        .returning();

      if (!updated) {
        return NextResponse.json({ error: 'Reflexão não encontrada.' }, { status: 404 });
      }

      return NextResponse.json(updated);
    }

    const { userEmail, userName } = getPublicUserFromRequest(request);
    if (!userEmail && !userName) {
      return NextResponse.json({ error: 'Autenticação necessária para editar reflexão.' }, { status: 401 });
    }

    const [existing] = await db.select().from(reflexoesRodaOnline).where(eq(reflexoesRodaOnline.id, id)).limit(1);
    if (!existing) {
      return NextResponse.json({ error: 'Reflexão não encontrada.' }, { status: 404 });
    }

    const ownsReflection = Boolean(
      (existing.autoraEmail && userEmail && existing.autoraEmail.trim().toLowerCase() === userEmail.trim().toLowerCase()) ||
      (!existing.autoraEmail && userName && existing.autoraNome.trim().toLowerCase() === userName.trim().toLowerCase())
    );

    if (!ownsReflection) {
      return NextResponse.json({ error: 'Sem permissão para editar esta reflexão.' }, { status: 403 });
    }

    const [updated] = await dbWrite.update(reflexoesRodaOnline)
      .set({ texto: texto.trim() })
      .where(eq(reflexoesRodaOnline.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (err) {
    console.error('Erro PATCH /api/rodaonline/reflexoes:', err);
    return NextResponse.json({ error: 'Erro ao atualizar reflexão.' }, { status: 500 });
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
