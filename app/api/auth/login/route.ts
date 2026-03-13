import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { colaboradoras } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import postgres from 'postgres'

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email?.toLowerCase().trim();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json({ error: 'E-mail e senha são obrigatórios' }, { status: 400 });
    }

    
    const sql = postgres(process.env.DATABASE_URL)
    const rows = await sql`
      SELECT id, email, password, name, avatar_url, role, must_change_password, active, created_at, last_login
      FROM public.colaboradoras
      WHERE email = ${email}
      LIMIT 1
    `
    await sql.end()
    const user = rows[0]

    if (!user || user.active === false) {
      return NextResponse.json({ error: 'Credenciais inválidas ou conta desativada' }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
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
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    
    cookieStore.set('clube-user-email', user.email, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    
    try {
      const sql2 = postgres(process.env.DATABASE_URL)
      await sql2`UPDATE public.colaboradoras SET last_login = NOW() WHERE id = ${user.id}`
      await sql2.end()
    } catch (_) {}

    return NextResponse.json({ 
      status: 'SUCCESS', 
      user: userWithoutPassword 
    }, { status: 200 });

  } catch (error) {
    console.error("Erro interno no Login Clube das Leitoras:", error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}