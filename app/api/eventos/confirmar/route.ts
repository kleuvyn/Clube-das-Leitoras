import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { eventoConfirmacoes } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const eventoId = searchParams.get('eventoId');
  const email = searchParams.get('email');
  if (!eventoId || !email) return NextResponse.json({ status: null });
  try {
    const [row] = await db
      .select()
      .from(eventoConfirmacoes)
      .where(and(eq(eventoConfirmacoes.eventoId, eventoId), eq(eventoConfirmacoes.usuarioEmail, email)));
    return NextResponse.json({ status: row?.status ?? null });
  } catch {
    return NextResponse.json({ status: null });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventoId, email, status } = body;
    if (!eventoId || !email || !['vou', 'nao_vou'].includes(status)) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
    }

    
    await db.execute(sql`
      INSERT INTO evento_confirmacoes (evento_id, usuario_email, status)
      VALUES (${eventoId}, ${email}, ${status})
      ON CONFLICT (evento_id, usuario_email)
      DO UPDATE SET status = ${status}
    `);

    return NextResponse.json({ ok: true, status });
  } catch (err: any) {
    console.error('Erro ao confirmar presença:', err);
    return NextResponse.json({ error: 'Erro ao salvar confirmação.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventoId = searchParams.get('eventoId');
    const email = searchParams.get('email');
    if (!eventoId || !email) return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });

    await db.delete(eventoConfirmacoes).where(
      and(eq(eventoConfirmacoes.eventoId, eventoId), eq(eventoConfirmacoes.usuarioEmail, email))
    );
    return NextResponse.json({ ok: true, status: null });
  } catch {
    return NextResponse.json({ error: 'Erro ao remover confirmação.' }, { status: 500 });
  }
}
