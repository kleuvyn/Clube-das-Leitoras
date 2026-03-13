import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { colaboradoras } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('clube-admin-token')?.value;
    const convidadaToken = cookieStore.get('clube-sessao')?.value;

    if (!adminToken && !convidadaToken) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    
    let userData;
    try {
      const tokenData = adminToken || convidadaToken;
      userData = typeof tokenData === 'string' ? JSON.parse(tokenData) : tokenData;
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    
    const [user] = await db
      .select()
      .from(colaboradoras)
      .where(eq(colaboradoras.email, userData.email));

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
