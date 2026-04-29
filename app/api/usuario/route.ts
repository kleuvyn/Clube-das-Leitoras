import { NextResponse } from 'next/server';
import { requireMember } from '@/lib/auth';
import { db, dbWrite } from '@/lib/db';
import { colaboradoras } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const user = await requireMember();
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Erro ao buscar dados do usuário' }, { status: error?.status ?? 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireMember();
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const body = await request.json();

    const updated = {
      name: body.name ?? user.name,
      phone: body.phone ?? user.phone,
      birthdate: body.birthdate ?? user.birthdate,
      tempoClube: body.tempoClube ?? user.tempoClube,
      enderecoCompleto: body.enderecoCompleto ?? user.enderecoCompleto,
      cartaMimo: typeof body.cartaMimo === 'boolean' ? body.cartaMimo : user.cartaMimo,
      gdprConsentido: typeof body.gdprConsentido === 'boolean' ? body.gdprConsentido : user.gdprConsentido,
      gdprConsentimentoVersao: body.gdprConsentimentoVersao ?? user.gdprConsentimentoVersao,
      gdprConsentimentoFinalidade: body.gdprConsentimentoFinalidade ?? user.gdprConsentimentoFinalidade,
      gdprConsentidoEm: body.gdprConsentido ? new Date() : user.gdprConsentidoEm,
    };

    await dbWrite.update(colaboradoras).set(updated).where(eq(colaboradoras.id, user.id));

    return NextResponse.json({ success: true, message: 'Dados atualizados' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Erro ao atualizar usuário' }, { status: error?.status ?? 500 });
  }
}

export async function DELETE() {
  try {
    const user = await requireMember();
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    // Tratamento do direito ao esquecimento: desativação e anonimização parcial
    await dbWrite.update(colaboradoras).set({
      active: false,
      status: 'excluida',
      email: `${user.id}@deleted.local`,
      name: 'Usuária Excluída',
      phone: null,
      birthdate: null,
      tempoClube: null,
      enderecoCompleto: null,
      cartaMimo: false,
      gdprConsentido: false,
      gdprConsentimentoVersao: null,
      gdprConsentimentoFinalidade: null,
      gdprConsentidoEm: null,
    }).where(eq(colaboradoras.id, user.id));

    return NextResponse.json({ success: true, message: 'Conta desativada e dados pessoais anonimizados' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Erro ao excluir usuário' }, { status: error?.status ?? 500 });
  }
}
