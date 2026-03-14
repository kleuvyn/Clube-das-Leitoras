import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { colaboradoras } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email?.toLowerCase().trim();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json({ error: 'E-mail e senha são obrigatórios' }, { status: 400 });
    }

    const [user] = await db
      .select()
      .from(colaboradoras)
      .where(sql`LOWER(${colaboradoras.email}) = ${email}`)
      .limit(1);

    if (!user || user.active === false) {
      return NextResponse.json({ error: 'Credenciais inválidas ou conta desativada' }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password!);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    const { password: _, ...userWithoutPassword } = user;

    const cookieStore = await cookies();
    const isAdmin = user.role === 'admin';

    cookieStore.set(isAdmin ? 'clube-admin-token' : 'clube-sessao', JSON.stringify(userWithoutPassword), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    cookieStore.set('clube-user-email', user.email, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    cookieStore.set('clube-user-name', user.name ?? '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    try {
      await db
        .update(colaboradoras)
        .set({ lastLogin: new Date() })
        .where(eq(colaboradoras.id, user.id));
    } catch (_) {}

    return NextResponse.json({
      status: 'SUCCESS',
      user: userWithoutPassword,
    }, { status: 200 });

  } catch (error) {
    console.error('Erro interno no Login Clube das Leitoras:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}