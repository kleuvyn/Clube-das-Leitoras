import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { configModeracao } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdminOrColaboradora } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await db.select().from(configModeracao).limit(1);
    const palavrasExtras = rows[0]?.palavrasExtras ?? '';
    return NextResponse.json({ palavrasExtras });
  } catch (err) {
    console.error('GET /api/comentarios/filtro:', err);
    return NextResponse.json({ palavrasExtras: '' });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdminOrColaboradora();
    const body = await request.json();
    const palavrasExtras: string = body.palavrasExtras ?? '';

    const existing = await db.select().from(configModeracao).limit(1);
    if (existing.length > 0) {
      await db.update(configModeracao)
        .set({ palavrasExtras, updatedAt: new Date() })
        .where(eq(configModeracao.id, existing[0].id));
    } else {
      await db.insert(configModeracao).values({ palavrasExtras });
    }

    return NextResponse.json({ success: true, palavrasExtras });
  } catch (err: any) {
    if (err?.message?.includes('401') || err?.message?.includes('Sem permissão')) {
      return NextResponse.json({ error: 'Sem permissão.' }, { status: 401 });
    }
    console.error('PATCH /api/comentarios/filtro:', err);
    return NextResponse.json({ error: 'Erro ao salvar filtro.' }, { status: 500 });
  }
}
