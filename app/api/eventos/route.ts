import { NextResponse, NextRequest } from 'next/server';
import { requireAdminOrColaboradora, requireAdmin, requireMember } from '@/lib/auth';
import { db, dbWrite } from '@/lib/db';
import { encontros, eventoConfirmacoes } from '@/lib/db/schema';
import { eq, desc, sql, and, inArray } from 'drizzle-orm';
import { notificarLeitoras } from '@/lib/notificacao-email';

export const dynamic = 'force-dynamic';

const mapToUiEvent = (r: any) => ({
  id: r.id,
  title: r.titulo,
  description: r.descricao,
  location: r.local,
  date: r.data,
  imageUrl: r.imagemUrl,
  slug: r.slug,
  horaInicio: r.horaInicio,
  horaFim: r.horaFim,
  valor: r.valor ?? null,
  telefone: r.telefone ?? null,
  linkInscricao: r.linkInscricao ?? null,
  totalVou: r.totalVou ?? 0,
  totalNaoVou: r.totalNaoVou ?? 0,
  createdAt: r.createdAt,
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hasPagination = searchParams.has('page') || searchParams.has('limit');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = hasPagination
      ? Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
      : 1000;
    const offset = hasPagination ? (page - 1) * limit : 0;

    const cacheHeaders = {
      'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
    };

    const [rows, countResult] = await Promise.all([
      db.select().from(encontros).orderBy(desc(encontros.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`cast(count(*) as integer)` }).from(encontros),
    ]);

    const total = countResult[0]?.count || 0;
    const pages = Math.ceil(total / limit);

    const countMap: Record<string, { vou: number; nao_vou: number }> = {};
    try {
      const eventoIds = rows.map((r) => r.id);
      const confirmacoes = eventoIds.length > 0
        ? await db
            .select({
              eventoId: eventoConfirmacoes.eventoId,
              status: eventoConfirmacoes.status,
              total: sql<number>`cast(count(*) as integer)`,
            })
            .from(eventoConfirmacoes)
            .where(inArray(eventoConfirmacoes.eventoId, eventoIds))
            .groupBy(eventoConfirmacoes.eventoId, eventoConfirmacoes.status)
        : [];

      for (const c of confirmacoes) {
        if (!countMap[c.eventoId]) countMap[c.eventoId] = { vou: 0, nao_vou: 0 };
        if (c.status === 'vou') countMap[c.eventoId].vou = c.total;
        else countMap[c.eventoId].nao_vou = c.total;
      }
    } catch {}

    const mappedRows = rows.map(r => mapToUiEvent({
      ...r,
      totalVou: countMap[r.id]?.vou ?? 0,
      totalNaoVou: countMap[r.id]?.nao_vou ?? 0,
    }));

    if (!hasPagination) {
      return NextResponse.json(mappedRows, { headers: cacheHeaders });
    }

    return NextResponse.json({
      data: mappedRows,
      pagination: { page, limit, total, pages, hasMore: page < pages }
    }, { headers: cacheHeaders });
  } catch (err) {
    console.error('Erro ao buscar eventos:', err);
    return NextResponse.json({ error: 'Erro ao carregar a agenda.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    
    try { await requireAdminOrColaboradora(); } 
    catch { return NextResponse.json({ error: 'Sessão expirada ou sem permissão.' }, { status: 401 }); }

    const body = await req.json();
    
    if (!body.title) return NextResponse.json({ error: 'Dê um título ao encontro.' }, { status: 400 });

    const date = body.date ? new Date(body.date) : new Date();
    
    
    const generatedSlug = body.slug || body.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .concat(`-${Date.now()}`);

    const [inserted] = await dbWrite.insert(encontros).values({
      titulo: body.title,
      descricao: body.description ?? '',
      local: body.location ?? 'A definir',
      data: isNaN(date.getTime()) ? new Date() : date,
      imagemUrl: body.imageUrl ?? null,
      slug: generatedSlug,
      horaInicio: body.horaInicio ?? null,
      horaFim: body.horaFim ?? null,
      valor: body.valor ?? null,
      telefone: body.telefone ?? null,
      linkInscricao: body.linkInscricao ?? null,
    }).returning();

    notificarLeitoras({
      secao: 'eventos',
      tituloConteudo: body.title,
      descricaoConteudo: body.description ?? '',
    }).catch(console.error);

    return NextResponse.json(mapToUiEvent(inserted), { status: 201 });
  } catch (err) {
    console.error('Erro ao criar evento:', err);
    return NextResponse.json({ error: 'Erro ao salvar o encontro.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Sem permissão.' }, { status: 401 }); }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const body = await req.json();
    const targetId = id || body.id;

    if (!targetId) return NextResponse.json({ error: 'Identificador do evento não encontrado.' }, { status: 400 });

    const updateData: any = {};
    if (body.title !== undefined) updateData.titulo = body.title;
    if (body.description !== undefined) updateData.descricao = body.description;
    if (body.location !== undefined) updateData.local = body.location;
    if (body.imageUrl !== undefined) updateData.imagemUrl = body.imageUrl;
    if (body.horaInicio !== undefined) updateData.horaInicio = body.horaInicio;
    if (body.horaFim !== undefined) updateData.horaFim = body.horaFim;
    if (body.valor !== undefined) updateData.valor = body.valor;
    if (body.telefone !== undefined) updateData.telefone = body.telefone;
    if (body.linkInscricao !== undefined) updateData.linkInscricao = body.linkInscricao;
    
    if (body.date) {
      const d = new Date(body.date);
      if (!isNaN(d.getTime())) updateData.data = d;
    }

    const [updated] = await dbWrite.update(encontros)
      .set(updateData)
      .where(eq(encontros.id, targetId))
      .returning();

    if (!updated) return NextResponse.json({ error: 'Evento não encontrado.' }, { status: 404 });

    return NextResponse.json(mapToUiEvent(updated), { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao atualizar.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Sem permissão.' }, { status: 401 }); }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'ID necessário.' }, { status: 400 });

    await dbWrite.delete(encontros).where(eq(encontros.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao excluir.' }, { status: 500 });
  }
}