import { NextResponse } from 'next/server';
import { requireMember } from '@/lib/auth';
import { db, dbWrite } from '@/lib/db';
import { colaboradoras } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const user = await requireMember();
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    await dbWrite.update(colaboradoras).set({
      gdprConsentido: false,
      gdprConsentimentoVersao: null,
      gdprConsentimentoFinalidade: null,
      gdprConsentidoEm: null,
    }).where(eq(colaboradoras.id, user.id));

    return NextResponse.json({ success: true, message: 'Consentimento revogado' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Erro ao revogar consentimento' }, { status: error?.status ?? 500 });
  }
}
