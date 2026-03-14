import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { colaboradoras } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// Endpoint exclusivo para leitoras que precisam definir a primeira senha
// (mustChangePassword = true). Não exige a senha antiga.
export async function POST(req: Request) {
  const cookieStore = await cookies();
  const rawToken =
    cookieStore.get('clube-admin-token')?.value ??
    cookieStore.get('clube-sessao')?.value;

  if (!rawToken) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  let tokenData: any;
  try {
    tokenData = JSON.parse(rawToken);
  } catch {
    return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 });
  }

  const [user] = await db
    .select()
    .from(colaboradoras)
    .where(eq(colaboradoras.email, tokenData.email));

  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
  }

  if (!user.mustChangePassword) {
    return NextResponse.json(
      { error: 'Esta operação não é permitida para essa conta.' },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const newPassword: string = body.newPassword ?? '';

  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json(
      { error: 'A senha deve ter pelo menos 6 caracteres.' },
      { status: 400 }
    );
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await db
    .update(colaboradoras)
    .set({ password: hashed, mustChangePassword: false })
    .where(eq(colaboradoras.id, user.id));

  return NextResponse.json({ success: true });
}
