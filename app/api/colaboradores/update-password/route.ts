import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { colaboradoras } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, newPassword } = body;

    if (!userId || !newPassword) {
      return NextResponse.json({ error: 'Dados obrigatórios ausentes' }, { status: 400 });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json({ error: 'A nova senha deve ter no mínimo 8 caracteres' }, { status: 400 });
    }

    
    const cookieStore = await cookies();
    const token = cookieStore.get('clube-admin-token')?.value ?? cookieStore.get('clube-sessao')?.value;
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    let tokenData: any;
    try {
      tokenData = typeof token === 'string' ? JSON.parse(token) : token;
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const [requestUser] = await db.select().from(colaboradoras).where(eq(colaboradoras.email, tokenData.email));
    if (!requestUser || !requestUser.active) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    
    if (requestUser.role !== 'admin' && requestUser.id !== userId) {
      return NextResponse.json({ error: 'Permissão insuficiente' }, { status: 403 });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    const [existing] = await db.select().from(colaboradoras).where(eq(colaboradoras.id, userId));
    if (!existing) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

    await db.update(colaboradoras).set({ password: hashed, mustChangePassword: false }).where(eq(colaboradoras.id, userId));

    return NextResponse.json({ success: true, message: 'Senha atualizada com sucesso' }, { status: 200 });
  } catch (error) {
    console.error('Erro ao resetar senha:', error);
    return NextResponse.json({ error: 'Erro interno ao salvar nova senha' }, { status: 500 });
  }
}