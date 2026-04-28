import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db, client } from '@/lib/db';
import { colaboradoras } from '@/lib/db/schema';
import { sql, eq } from 'drizzle-orm';
import {
  generateUniqueTempPassword,
  getRecentPasswordHistory,
  insertPasswordHistory,
  TEMP_PASSWORD_VALIDITY_MS,
} from '@/lib/password-utils';

async function ensureTempPasswordExpiresAtColumn() {
  try {
    await client.execute("ALTER TABLE colaboradoras ADD COLUMN temp_password_expires_at integer");
  } catch (error) {
    // Ignora se a coluna já existir
  }
}

function getFromAddress() {
  const fromEnv = process.env.BREVO_FROM?.trim() ?? process.env.RESEND_FROM?.trim();
  if (fromEnv) {
    const m = fromEnv.match(/^([^<>]+)<\s*([^<>@\s]+@[^<>@\s]+\.[^<>@\s]+)\s*>$/);
    if (m) {
      const name = m[1].trim();
      const email = m[2].toLowerCase();
      return `${name} <${email}>`;
    }
  }
  return 'Clube das Leitoras <onboarding@resend.dev>';
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || '').toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ error: 'E-mail é obrigatório' }, { status: 400 });
    }

    await ensureTempPasswordExpiresAtColumn();

    const [user] = await db.select().from(colaboradoras).where(eq(colaboradoras.email, email));
    const genericResponse = {
      success: true,
      message: 'Se o e-mail estiver registrado e ativo, você receberá instruções em breve.',
    };

    if (!user || user.active === false) {
      return NextResponse.json(genericResponse, { status: 200 });
    }

    const historyHashes = await getRecentPasswordHistory(user.id, 20);
    const tempPassword = await generateUniqueTempPassword([user.password, ...historyHashes]);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const expiresAt = new Date(Date.now() + TEMP_PASSWORD_VALIDITY_MS);

    await insertPasswordHistory(user.id, user.password, user.mustChangePassword ? 'temporary' : 'permanent');

    await db.update(colaboradoras).set({
      password: hashedPassword,
      mustChangePassword: true,
      tempPasswordExpiresAt: expiresAt,
    }).where(eq(colaboradoras.id, user.id));

    const apiKey = process.env.BREVO_API_KEY ?? process.env.RESEND_API_KEY;
    if (apiKey) {
      try {
        const { sendEmail } = await import('@/lib/email-client');
        const { cartaAprovacaoComSenha } = await import('@/lib/email-templates');
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://clubedasleitoras.com.br';

        await sendEmail({
          from: getFromAddress(),
          to: user.email,
          subject: '🔐 Sua nova senha temporária para o Clube das Leitoras',
          html: cartaAprovacaoComSenha({ nome: user.name ?? user.email, email: user.email, senha: tempPassword, siteUrl }),
        });
      } catch (error) {
        console.error('Erro ao enviar e-mail de recuperação:', error);
      }
    }

    return NextResponse.json(genericResponse, { status: 200 });
  } catch (error) {
    console.error('Erro request-temp-password:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
