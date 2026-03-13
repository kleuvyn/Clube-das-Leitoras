import { NextResponse } from 'next/server';
import { requireAdminOrColaboradora } from '@/lib/auth';
import { db } from '@/lib/db';
import { reflexoesLobos } from '@/lib/db/schema';
import { analyzeContentModeration } from '@/lib/content-moderation';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const leituraId = searchParams.get('leituraId');

    const rows = leituraId
      ? await db.select().from(reflexoesLobos).where(eq(reflexoesLobos.leituraId, leituraId)).orderBy(desc(reflexoesLobos.createdAt))
      : await db.select().from(reflexoesLobos).orderBy(desc(reflexoesLobos.createdAt));

    return NextResponse.json(rows);
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
