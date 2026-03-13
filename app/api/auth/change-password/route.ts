import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { colaboradoras } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('clube-admin-token')?.value;
    const convidadaToken = cookieStore.get('clube-sessao')?.value;

    if (!adminToken && !convidadaToken) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { email, oldPass, newPass } = await req.json();

    if (!email || !oldPass || !newPass) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const [user] = await db.select().from(colaboradoras).where(eq(colaboradoras.email, normalizedEmail));

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const passwordMatch = await bcrypt.compare(oldPass, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 401 });
    }

    const hashed = await bcrypt.hash(newPass, 10);

    await db.update(colaboradoras).set({ password: hashed, mustChangePassword: false }).where(eq(colaboradoras.id, user.id));

    return NextResponse.json({ success: true, message: 'Senha alterada com sucesso' });
  } catch (err) {
    console.error('Erro change-password:', err);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
