import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comentarios, configModeracao } from '@/lib/db/schema';
import { eq, desc, or, and, isNull } from 'drizzle-orm';
import { analyzeContentModeration } from '@/lib/content-moderation';
import { requireAdminOrColaboradora } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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
    const { searchParams } = new URL(request.url);
    const livroDoMesId = searchParams.get('livroDoMesId');
    const resenhaId = searchParams.get('resenhaId');

    let rows;
    if (livroDoMesId) {
      rows = await db.select().from(comentarios).where(eq(comentarios.livroDoMesId, livroDoMesId)).orderBy(desc(comentarios.createdAt));
    } else if (resenhaId) {
      rows = await db.select().from(comentarios).where(eq(comentarios.resenhaId, resenhaId)).orderBy(desc(comentarios.createdAt));
    } else {
      rows = await db.select().from(comentarios).orderBy(desc(comentarios.createdAt));
    }

    return NextResponse.json(rows);
  } catch (err) {
    console.error('GET /api/comentarios:', err);
    return NextResponse.json({ error: 'Erro ao carregar comentários.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { livroDoMesId, resenhaId, autoraNome, autoraEmail, texto } = body;

    if (!autoraNome?.trim() || !texto?.trim()) {
      return NextResponse.json({ error: 'Nome e comentário são obrigatórios.' }, { status: 400 });
    }
    if (!livroDoMesId && !resenhaId) {
      return NextResponse.json({ error: 'Identificador do conteúdo não informado.' }, { status: 400 });
    }

    
    const extras = await getExtras();
    const moderation = analyzeContentModeration(`${autoraNome} ${texto}`, extras);
    if (moderation.blocked) {
      return NextResponse.json({
        error: 'Comentário bloqueado: identificamos linguagem imprópria.',
        details: moderation.triggers,
      }, { status: 400 });
    }

    const [inserted] = await db.insert(comentarios).values({
      livroDoMesId: livroDoMesId || null,
      resenhaId: resenhaId || null,
      autoraNome: autoraNome.trim(),
      autoraEmail: autoraEmail?.trim() || null,
      texto: texto.trim(),
    }).returning();

    return NextResponse.json(inserted, { status: 201 });
  } catch (err) {
    console.error('POST /api/comentarios:', err);
    return NextResponse.json({ error: 'Erro ao publicar comentário.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdminOrColaboradora();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID obrigatório.' }, { status: 400 });

    await db.delete(comentarios).where(eq(comentarios.id, id));
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err?.message?.includes('401') || err?.message?.includes('Sem permissão')) {
      return NextResponse.json({ error: 'Sem permissão.' }, { status: 401 });
    }
    console.error('DELETE /api/comentarios:', err);
    return NextResponse.json({ error: 'Erro ao remover comentário.' }, { status: 500 });
  }
}
