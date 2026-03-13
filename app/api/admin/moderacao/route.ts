import { NextResponse } from 'next/server';
import { requireAdminOrColaboradora } from '@/lib/auth';
import { db } from '@/lib/db';
import { configModeracao } from '@/lib/db/schema';
import { BLOCKED_TERMS } from '@/lib/content-moderation';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdminOrColaboradora();
    const rows = await db.select().from(configModeracao).limit(1);
    const extras = rows[0]?.palavrasExtras ?? '';
    const removedBase = rows[0]?.palavrasRemovidasBase ?? '';
    return NextResponse.json({
      termsBase: BLOCKED_TERMS,
      extras: extras.split(',').map((p: string) => p.trim()).filter(Boolean),
      removedBase: removedBase.split(',').map((p: string) => p.trim()).filter(Boolean),
      raw: extras,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Sem permissão.' }, { status: err?.status ?? 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminOrColaboradora();
    const body = await request.json();
    const extras: string[] = Array.isArray(body.extras) ? body.extras : [];
    const removedBase: string[] = Array.isArray(body.removedBase) ? body.removedBase : [];
    const rawExtras = extras.map((p: string) => p.trim().toLowerCase()).filter(Boolean).join(',');
    const rawRemoved = removedBase.map((p: string) => p.trim().toLowerCase()).filter(Boolean).join(',');

    const existing = await db.select().from(configModeracao).limit(1);
    if (existing.length === 0) {
      await db.insert(configModeracao).values({ palavrasExtras: rawExtras, palavrasRemovidasBase: rawRemoved });
    } else {
      await db.update(configModeracao).set({ palavrasExtras: rawExtras, palavrasRemovidasBase: rawRemoved, updatedAt: new Date() });
    }

    return NextResponse.json({ success: true, extras, removedBase });
  } catch (err: any) {
    return NextResponse.json({ error: 'Erro ao salvar.' }, { status: err?.status ?? 500 });
  }
}
