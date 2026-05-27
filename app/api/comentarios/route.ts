import { NextResponse } from 'next/server';
import { client, db, dbWrite } from '@/lib/db';
import { comentarios, configModeracao } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { analyzeContentModeration } from '@/lib/content-moderation';
import { requireAdminOrColaboradora } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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

async function ensureComentariosLikesColumn() {
  const result = await client.execute("PRAGMA table_info('comentarios')");
  const hasLikes = Array.isArray(result.rows) && result.rows.some((row: any) => row?.name === 'likes');
  if (!hasLikes) {
    await client.execute('ALTER TABLE comentarios ADD COLUMN likes integer DEFAULT 0 NOT NULL');
  }
}

async function ensureComentariosReplyToColumn() {
  const result = await client.execute("PRAGMA table_info('comentarios')");
  const hasReplyTo = Array.isArray(result.rows) && result.rows.some((row: any) => row?.name === 'reply_to_id');
  if (!hasReplyTo) {
    await client.execute('ALTER TABLE comentarios ADD COLUMN reply_to_id text');
  }
}

async function getExtras(): Promise<string[]> {
  try {
    const rows = await db.select().from(configModeracao).limit(1);
    if (!rows.length || !rows[0].palavrasExtras) return [];
    return rows[0].palavrasExtras.split(',').map(p => p.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  try {
    await Promise.all([ensureComentariosLikesColumn(), ensureComentariosReplyToColumn()]);
    const { searchParams } = new URL(request.url);
    const livroDoMesId = searchParams.get('livroDoMesId');
    const resenhaId = searchParams.get('resenhaId');
    const hasPagination = searchParams.has('page') || searchParams.has('limit');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = hasPagination
      ? Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
      : 1000;
    const offset = hasPagination ? (page - 1) * limit : 0;

    let rows;
    let countResult;
    if (livroDoMesId) {
      [rows, countResult] = await Promise.all([
        db.select().from(comentarios)
          .where(eq(comentarios.livroDoMesId, livroDoMesId))
          .orderBy(desc(comentarios.createdAt))
          .limit(limit)
          .offset(offset),
        db.select({ count: sql<number>`cast(count(*) as integer)` }).from(comentarios).where(eq(comentarios.livroDoMesId, livroDoMesId)),
      ]);
    } else if (resenhaId) {
      [rows, countResult] = await Promise.all([
        db.select().from(comentarios)
          .where(eq(comentarios.resenhaId, resenhaId))
          .orderBy(desc(comentarios.createdAt))
          .limit(limit)
          .offset(offset),
        db.select({ count: sql<number>`cast(count(*) as integer)` }).from(comentarios).where(eq(comentarios.resenhaId, resenhaId)),
      ]);
    } else {
      [rows, countResult] = await Promise.all([
        db.select().from(comentarios)
          .orderBy(desc(comentarios.createdAt))
          .limit(limit)
          .offset(offset),
        db.select({ count: sql<number>`cast(count(*) as integer)` }).from(comentarios),
      ]);
    }

    if (!hasPagination) {
      return NextResponse.json(rows);
    }

    const total = countResult?.[0]?.count || 0;
    const pages = Math.ceil(total / limit);
    return NextResponse.json({
      data: rows,
      pagination: { page, limit, total, pages, hasMore: page < pages },
    });
  } catch (err) {
    console.error('GET /api/comentarios:', err);
    return NextResponse.json({ error: 'Erro ao carregar comentários.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await Promise.all([ensureComentariosLikesColumn(), ensureComentariosReplyToColumn()]);
    const body = await request.json();
    const { livroDoMesId, resenhaId, autoraNome, autoraEmail, texto, replyToId } = body;

    if (!autoraNome?.trim() || !texto?.trim()) {
      return NextResponse.json({ error: 'Nome e comentário são obrigatórios.' }, { status: 400 });
    }
    if (!livroDoMesId && !resenhaId) {
      return NextResponse.json({ error: 'Identificador do conteúdo não informado.' }, { status: 400 });
    }

    if (replyToId) {
      const [parent] = await db.select().from(comentarios).where(eq(comentarios.id, replyToId)).limit(1);
      if (!parent) {
        return NextResponse.json({ error: 'Comentário pai não encontrado.' }, { status: 404 });
      }
      if (resenhaId && parent.resenhaId !== resenhaId) {
        return NextResponse.json({ error: 'Comentário pai não pertence a esta resenha.' }, { status: 400 });
      }
      if (livroDoMesId && parent.livroDoMesId !== livroDoMesId) {
        return NextResponse.json({ error: 'Comentário pai não pertence a este conteúdo.' }, { status: 400 });
      }
    }

    const extras = await getExtras();
    const moderation = analyzeContentModeration(`${autoraNome} ${texto}`, extras);
    if (moderation.blocked) {
      return NextResponse.json({
        error: 'Comentário bloqueado: identificamos linguagem imprópria.',
        details: moderation.triggers,
      }, { status: 400 });
    }

    const [inserted] = await dbWrite.insert(comentarios).values({
      livroDoMesId: livroDoMesId || null,
      resenhaId: resenhaId || null,
      autoraNome: autoraNome.trim(),
      autoraEmail: autoraEmail?.trim() || null,
      texto: texto.trim(),
      replyToId: replyToId || null,
    }).returning();

    return NextResponse.json(inserted, { status: 201 });
  } catch (err) {
    console.error('POST /api/comentarios:', err);
    return NextResponse.json({ error: 'Erro ao publicar comentário.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await Promise.all([ensureComentariosLikesColumn(), ensureComentariosReplyToColumn()]);
    const body = await request.json();
    const { id, texto, action } = body;
    if (!id || (!texto?.trim() && action !== 'like')) {
      return NextResponse.json({ error: 'ID e texto são obrigatórios para edição.' }, { status: 400 });
    }

    if (action === 'like') {
      const [updated] = await dbWrite.update(comentarios)
        .set({ likes: sql`coalesce(${comentarios.likes}, 0) + 1` })
        .where(eq(comentarios.id, id))
        .returning();

      if (!updated) {
        return NextResponse.json({ error: 'Comentário não encontrado.' }, { status: 404 });
      }

      return NextResponse.json(updated);
    }

    const { userEmail, userName } = getPublicUserFromRequest(request);
    if (!userEmail && !userName) {
      return NextResponse.json({ error: 'Autenticação necessária para editar comentário.' }, { status: 401 });
    }

    const [existing] = await db.select().from(comentarios).where(eq(comentarios.id, id)).limit(1);
    if (!existing) {
      return NextResponse.json({ error: 'Comentário não encontrado.' }, { status: 404 });
    }

    const ownsComment = Boolean(
      (existing.autoraEmail && userEmail && existing.autoraEmail.trim().toLowerCase() === userEmail.trim().toLowerCase()) ||
      (!existing.autoraEmail && userName && existing.autoraNome.trim().toLowerCase() === userName.trim().toLowerCase())
    );

    if (!ownsComment) {
      return NextResponse.json({ error: 'Sem permissão para editar este comentário.' }, { status: 403 });
    }

    const [updated] = await dbWrite.update(comentarios).set({ texto: texto.trim() }).where(eq(comentarios.id, id)).returning();
    return NextResponse.json(updated);
  } catch (err) {
    console.error('PATCH /api/comentarios:', err);
    return NextResponse.json({ error: 'Erro ao atualizar comentário.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdminOrColaboradora();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID obrigatório.' }, { status: 400 });

    await dbWrite.delete(comentarios).where(eq(comentarios.id, id));
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err?.message?.includes('401') || err?.message?.includes('Sem permissão')) {
      return NextResponse.json({ error: 'Sem permissão.' }, { status: 401 });
    }
    console.error('DELETE /api/comentarios:', err);
    return NextResponse.json({ error: 'Erro ao remover comentário.' }, { status: 500 });
  }
}
