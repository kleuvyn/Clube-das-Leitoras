import { NextResponse } from 'next/server';
import { db, dbWrite, client, isWriteBlockedError } from '@/lib/db';
import { colaboradoras } from '@/lib/db/schema';
import { sql, eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
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
    let body: any;
    try {
      body = await request.json();
    } catch (err) {
      console.error('Erro ao parsear JSON no login:', err);
      return NextResponse.json({ error: 'Requisição inválida' }, { status: 400 });
    }

    const email = String(body.email ?? '').toLowerCase().trim();
    const password = String(body.password ?? '');

    if (!email || !password) {
      return NextResponse.json({ error: 'E-mail e senha são obrigatórios' }, { status: 400 });
    }

    await ensureTempPasswordExpiresAtColumn();

    const [user] = await db
      .select()
      .from(colaboradoras)
      .where(sql`LOWER(${colaboradoras.email}) = ${email}`)
      .limit(1);

    if (!user || user.active === false || !user.password) {
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

    let passwordMatch = false;
    try {
      passwordMatch = await bcrypt.compare(password, user.password);
    } catch (err) {
      console.warn('Falha ao comparar senha no login:', err);
    }

    if (!passwordMatch) {
      return NextResponse.json({ error: 'Credenciais inválidas ou expirada' }, { status: 401 });
    }

    const currentTime = new Date();
    const expiresAt = user.tempPasswordExpiresAt ? new Date(user.tempPasswordExpiresAt) : null;
    const expiresAtValid = expiresAt && !Number.isNaN(expiresAt.getTime());

    if (user.mustChangePassword && expiresAtValid && expiresAt! < currentTime) {
      return NextResponse.json({ error: 'Credenciais inválidas ou expirada' }, { status: 401 });
    }

    if (user.mustChangePassword && expiresAtValid && expiresAt! >= currentTime) {
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