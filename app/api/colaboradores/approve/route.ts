import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db, client } from '@/lib/db';
import { colaboradoras } from '@/lib/db/schema';
import { sql, eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { insertPasswordHistory, TEMP_PASSWORD_VALIDITY_MS } from '@/lib/password-utils';

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
  console.warn('[colaboradores/approve] BREVO_FROM inválido ou não configurado; usando fallback onboarding@resend.dev');
  return 'Clube das Leitoras <onboarding@resend.dev>';
}

function gerarSenhaTemporaria(): string {
  const palavras = ['livro', 'flor', 'cafe', 'rosa', 'lua', 'sol', 'brisa', 'afeto', 'laca', 'petal'];
  const i = crypto.randomInt(palavras.length);
  const j = crypto.randomInt(palavras.length);
  const num = 100 + crypto.randomInt(900);
  return `${palavras[i]}${palavras[j]}${num}`;
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch (err: any) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const id = body.id;
    if (!id) return NextResponse.json({ error: 'ID da leitora é necessário' }, { status: 400 });

    await ensureTempPasswordExpiresAtColumn();

    const [user] = await db.select().from(colaboradoras).where(eq(colaboradoras.id, id));
    if (!user) return NextResponse.json({ error: 'Leitora não encontrada' }, { status: 404 });
    if (user.active) return NextResponse.json({ error: 'Leitora já está ativa' }, { status: 400 });

    const tempPassword = gerarSenhaTemporaria();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    if (user.password) {
      await insertPasswordHistory(user.id, user.password, user.mustChangePassword ? 'temporary' : 'permanent');
    }

    await db.update(colaboradoras).set({
      password: hashedPassword,
      active: true,
      status: 'ativa',
      mustChangePassword: true,
      tempPasswordExpiresAt: new Date(Date.now() + TEMP_PASSWORD_VALIDITY_MS),
    }).where(eq(colaboradoras.id, id));

    const emailStatus: { sent: boolean; error: string | null } = { sent: false, error: null };
    const apiKey = process.env.BREVO_API_KEY ?? process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('BREVO_API_KEY não configurada. E-mails não serão enviados.');
    }

    if (apiKey) {
      try {
        const { sendEmail } = await import('@/lib/email-client');
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://clubedasleitoras.com.br';

        const effectiveFrom = getFromAddress();
        await sendEmail({
          from: effectiveFrom,
          to: user.email,
          subject: 'Seja bem-vinda ao Clube das Leitoras',
          html: (await import('@/lib/email-templates')).cartaAprovacaoComSenha({
            nome: user.name ?? user.email,
            email: user.email,
            senha: tempPassword,
            siteUrl,
          }),
        });
        emailStatus.sent = true;
      } catch (e) {
        console.error('Erro ao enviar e-mail de aprovação:', e);
        emailStatus.error = e instanceof Error ? e.message : String(e);
      }
    }

    return NextResponse.json({ success: true, message: 'Leitora aprovada.', emailStatus }, { status: 200 });
  } catch (error) {
    console.error('Erro ao aprovar leitora:', error);
    return NextResponse.json({ error: 'Erro ao aprovar leitora.' }, { status: 500 });
  }
}
