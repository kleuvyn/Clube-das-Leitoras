import { NextResponse } from 'next/server';
import { requireAdminOrColaboradora } from '@/lib/auth';
import { db } from '@/lib/db';
import { dicas } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { notificarLeitoras } from '@/lib/notificacao-email';

export const dynamic = 'force-dynamic';

type DicaRow = {
  id: string;
  categoria: string;
  titulo: string;
  descricao: string;      
  textoCompleto: string | null; 
  imagem: string | null;
  createdAt: string;
};

export async function GET() {
  try {
    const rows = await db.select().from(dicas).orderBy(desc(dicas.createdAt));
    return NextResponse.json(rows);
  } catch (err: any) {
    
    if (err.message?.includes('column') || err.message?.includes('does not exist')) {
      try {
        const rows = await db.execute(
          sql`SELECT id, categoria, titulo, descricao, created_at as "createdAt" FROM dicas ORDER BY created_at DESC`
        );
        return NextResponse.json(rows.rows ?? []);
      } catch (e2: any) {
        console.error('Erro fallback GET /api/dicas:', e2);
      }
    }
    console.error('Erro GET /api/dicas:', err);
    return NextResponse.json({ error: 'Erro ao carregar as dicas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminOrColaboradora();
    const body = await request.json();

    if (!body.titulo || !body.descricao) {
      return NextResponse.json({ error: 'Título e descrição (resumo) são obrigatórios' }, { status: 400 });
    }

    const [inserted] = await db.insert(dicas).values({
      categoria: body.categoria ?? 'Dicas da Gabi',
      titulo: body.titulo,
      descricao: body.descricao,
      imagem: body.imagem ?? null,
      textoCompleto: body.textoCompleto ?? null,
      iconName: body.iconName ?? 'BookOpen',
    }).returning();

    // Notifica leitoras em background (fire-and-forget)
    notificarLeitoras({
      secao: 'dicas',
      tituloConteudo: body.titulo,
      descricaoConteudo: body.descricao,
    }).catch(console.error);

    return NextResponse.json({ success: true, data: inserted }, { status: 201 });
  } catch (err: any) {
    console.error('Erro POST /api/dicas:', err);
    return NextResponse.json({ error: 'Erro ao criar dica' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdminOrColaboradora();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) return NextResponse.json({ error: 'ID necessário' }, { status: 400 });

    const updateData: Record<string, any> = {};
    if (body.categoria !== undefined) updateData.categoria = body.categoria;
    if (body.titulo !== undefined) updateData.titulo = body.titulo;
    if (body.descricao !== undefined) updateData.descricao = body.descricao;
    if (body.imagem !== undefined) updateData.imagem = body.imagem;
    if (body.textoCompleto !== undefined) updateData.textoCompleto = body.textoCompleto;
    if (body.iconName !== undefined) updateData.iconName = body.iconName;

    const updated = await db.update(dicas)
      .set(updateData)
      .where(eq(dicas.id, id))
      .returning();

    if (!updated.length) return NextResponse.json({ error: 'Dica não encontrada' }, { status: 404 });

    return NextResponse.json({ success: true, data: updated[0] });
  } catch (err: any) {
    console.error('Erro PATCH /api/dicas:', err);
    return NextResponse.json({ error: 'Erro ao atualizar dica' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdminOrColaboradora();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });

    const result = await db.delete(dicas)
      .where(eq(dicas.id, id))
      .returning();

    if (!result.length) return NextResponse.json({ error: 'Dica não encontrada' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Erro DELETE /api/dicas:', err);
    return NextResponse.json({ error: 'Erro ao remover dica' }, { status: 500 });
  }
}