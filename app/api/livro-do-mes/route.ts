import { NextResponse } from 'next/server';
import { requireAdminOrColaboradora, requireAdmin, requireMember } from '@/lib/auth';
import { db } from '@/lib/db';
import { livroDoMes, resenhas } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { notificarLeitoras } from '@/lib/notificacao-email';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const anoParam = searchParams.get('ano');

    let rows;
    if (anoParam) {
      rows = await db
        .select()
        .from(livroDoMes)
        .where(eq(livroDoMes.ano, Number(anoParam)))
        .orderBy(desc(livroDoMes.updatedAt));
    } else {
      rows = await db.select().from(livroDoMes).orderBy(desc(livroDoMes.updatedAt));
    }
    return NextResponse.json(rows);
  } catch (err: any) {
    console.error('Erro GET /api/livro-do-mes:', err);
    return NextResponse.json({ error: 'Erro ao carregar o livro do mês' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireMember();
    const body = await request.json();

    if (!body.livro || !body.autora) {
      return NextResponse.json({ error: 'Livro e autora são obrigatórios' }, { status: 400 });
    }

    const [inserted] = await db.insert(livroDoMes).values({
      mes: body.mes ?? null,
      num: body.num ?? null,
      ano: body.ano ? Number(body.ano) : new Date().getFullYear(),
      livro: body.livro,
      autora: body.autora,
      foto: body.foto ?? null,
      sinopse: body.sinopse ?? null,
      tag: body.tag ?? null,
      diaEncontro: body.diaEncontro ?? null,
      horarioEncontro: body.horarioEncontro ?? null,
      confirmado: body.confirmado ?? false,
    }).returning();

    
    const mesAno = [body.mes, body.ano ? String(body.ano) : String(new Date().getFullYear())]
      .filter(Boolean).join('/');
    await db.insert(resenhas).values({
      title: `Resenha: ${body.livro}`,
      book: body.livro,
      author: body.autora,
      content: body.sinopse ?? '',
      rating: 5,
      imageUrl: body.foto ?? null,
      publishedAt: mesAno,
    });

    // Notifica leitoras em background
    notificarLeitoras({
      secao: 'livro-do-mes',
      tituloConteudo: `${body.livro} — ${body.autora}`,
      descricaoConteudo: body.sinopse ?? '',
    }).catch(console.error);

    return NextResponse.json({ success: true, data: inserted }, { status: 201 });
  } catch (err: any) {
    console.error('Erro POST /api/livro-do-mes:', err);
    return NextResponse.json({ error: 'Erro ao criar livro do mês' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

    const body = await request.json();

    const [updated] = await db.update(livroDoMes)
      .set({
        mes: body.mes ?? null,
        num: body.num ?? null,
        ano: body.ano ? Number(body.ano) : null,
        livro: body.livro ?? null,
        autora: body.autora ?? null,
        foto: body.foto ?? null,
        sinopse: body.sinopse ?? null,
        tag: body.tag ?? null,
        diaEncontro: body.diaEncontro ?? null,
        horarioEncontro: body.horarioEncontro ?? null,
        confirmado: body.confirmado ?? false,
        updatedAt: new Date(),
      })
      .where(eq(livroDoMes.id, id))
      .returning();

    if (!updated) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error('Erro PATCH /api/livro-do-mes:', err);
    const status = err?.status === 401 ? 401 : err?.status === 403 ? 403 : 500;
    return NextResponse.json({ error: err?.message || 'Erro ao atualizar' }, { status });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

    await db.delete(livroDoMes).where(eq(livroDoMes.id, id));
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Erro DELETE /api/livro-do-mes:', err);
    const status = err?.status === 401 ? 401 : err?.status === 403 ? 403 : 500;
    return NextResponse.json({ error: err?.message || 'Erro ao remover' }, { status });
  }
}