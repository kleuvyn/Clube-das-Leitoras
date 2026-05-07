import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { colaboradoras } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { getRecentPasswordHistory, insertPasswordHistory, PASSWORD_HISTORY_LIMIT } from '@/lib/password-utils';

export const dynamic = 'force-dynamic';

// Endpoint exclusivo para leitoras que precisam definir a primeira senha
// (mustChangePassword = true). Não exige a senha antiga.
export async function POST(req: Request) {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get('clube-sessao')?.value ?? cookieStore.get('clube-admin-token')?.value;

  if (!rawToken) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  let tokenData: any;
  try {
    tokenData = JSON.parse(rawToken);
  } catch {
    return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 });
  }

  if (!tokenData || !['convidada', 'colaboradora', 'admin'].includes(tokenData.role)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const [user] = await db
    .select()
    .from(colaboradoras)
    .where(eq(colaboradoras.email, tokenData.email));

  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
  }

  if (!user.mustChangePassword) {
    return NextResponse.json({ error: 'Senha já foi definida' }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const newPassword: string = body.newPassword ?? '';

  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json(
      { error: 'A senha deve ter pelo menos 6 caracteres.' },
      { status: 400 }
    );
  }

  try {
    const previousHashes = await getRecentPasswordHistory(user.id, PASSWORD_HISTORY_LIMIT);
    
    let isReused = false;
    try {
      const isSameAsCurrent = user.password ? await bcrypt.compare(newPassword, user.password) : false;
      const isSameAsPrevious = await Promise.all(
        previousHashes.map(async hash => {
          try {
            return await bcrypt.compare(newPassword, hash);
          } catch {
            return false;
          }
        })
      ).then(results => results.some(Boolean));
      
      isReused = isSameAsCurrent || isSameAsPrevious;
    } catch (compareError) {
      console.error("Error comparing passwords:", compareError);
      isReused = false; // Fallback to allow progress if comparison fails
    }

    if (isReused) {
      return NextResponse.json({ error: 'Não é permitido reutilizar senhas recentes.' }, { status: 400 });
    }

    if (user.password) {
      await insertPasswordHistory(user.id, user.password, user.mustChangePassword ? 'temporary' : 'permanent');
    }
    const hashed = await bcrypt.hash(newPassword, 10);

    await db
      .update(colaboradoras)
      .set({ password: hashed, mustChangePassword: false, tempPasswordExpiresAt: null })
      .where(eq(colaboradoras.id, user.id));

    return NextResponse.json({ success: true, role: user.role });
  } catch (error: any) {
    console.error("Set password error:", error);
    return NextResponse.json({ error: 'Erro interno ao salvar senha.' }, { status: 500 });
  }
}
