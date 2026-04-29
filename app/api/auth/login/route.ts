import { NextResponse } from 'next/server';
import { db, dbWrite, client, isWriteBlockedError } from '@/lib/db';
import { colaboradoras } from '@/lib/db/schema';
import { sql, eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

async function ensureTempPasswordExpiresAtColumn() {
  try {
    await client.execute("ALTER TABLE colaboradoras ADD COLUMN temp_password_expires_at integer");
  } catch (error) {
    // Ignora o erro se a coluna já existir (LibSQL não suporta IF NOT EXISTS no ADD COLUMN)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email?.toLowerCase().trim();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json({ error: 'E-mail e senha são obrigatórios' }, { status: 400 });
    }

    await ensureTempPasswordExpiresAtColumn();

    const [user] = await db
      .select()
      .from(colaboradoras)
      .where(sql`LOWER(${colaboradoras.email}) = ${email}`)
      .limit(1);

    if (!user || user.active === false) {
      return NextResponse.json({ error: 'Credenciais inválidas ou conta desativada' }, { status: 401 });
    }

    const consentimento = body.consentimento === true;
    const consentimentoVersao = body.consentimentoVersao ?? '1.0';
    const consentimentoFinalidade = body.consentimentoFinalidade ?? 'Acesso e uso do serviço';

    if (consentimento) {
      try {
        await dbWrite.update(colaboradoras).set({
          gdprConsentido: true,
          gdprConsentidoEm: new Date(),
          gdprConsentimentoVersao: consentimentoVersao,
          gdprConsentimentoFinalidade: consentimentoFinalidade,
        }).where(eq(colaboradoras.id, user.id));
      } catch (err) {
        if (isWriteBlockedError(err)) {
          console.info('Consentimento não gravado: banco em modo somente leitura');
        } else {
          console.warn('Falha ao gravar consentimento:', err);
        }
      }
    }


    const passwordMatch = await bcrypt.compare(password, user.password!);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Credenciais inválidas ou expirada' }, { status: 401 });
    }

    if (user.mustChangePassword && user.tempPasswordExpiresAt && new Date(user.tempPasswordExpiresAt) < new Date()) {
      return NextResponse.json({ error: 'Credenciais inválidas ou expirada' }, { status: 401 });
    }

    if (user.mustChangePassword && user.tempPasswordExpiresAt && new Date(user.tempPasswordExpiresAt) >= new Date()) {
      try {
        await dbWrite.update(colaboradoras).set({ tempPasswordExpiresAt: new Date(0) }).where(eq(colaboradoras.id, user.id));
      } catch (err) {
        if (isWriteBlockedError(err)) {
          console.info('Não foi possível limpar tempPasswordExpiresAt: banco em modo somente leitura');
        } else {
          console.warn('Falha ao limpar tempPasswordExpiresAt:', err);
        }
      }
    }

    const { password: _, ...userWithoutPassword } = user;

    const cookieStore = await cookies();
    const isAdminOrColaboradora = user.role === 'admin' || user.role === 'colaboradora';

    if (isAdminOrColaboradora) {
      cookieStore.set('clube-admin-token', JSON.stringify(userWithoutPassword), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
      cookieStore.delete('clube-sessao');
    } else {
      cookieStore.set('clube-sessao', JSON.stringify(userWithoutPassword), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
      cookieStore.delete('clube-admin-token');
    }

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
      await dbWrite
        .update(colaboradoras)
        .set({ lastLogin: new Date() })
        .where(eq(colaboradoras.id, user.id));
    } catch (err) {
      if (isWriteBlockedError(err)) {
        console.info('Não foi possível gravar lastLogin: banco em modo somente leitura');
      }
    }

    return NextResponse.json({
      status: 'SUCCESS',
      user: userWithoutPassword,
    }, { status: 200 });

  } catch (error) {
    console.error('Erro interno no Login Clube das Leitoras:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}