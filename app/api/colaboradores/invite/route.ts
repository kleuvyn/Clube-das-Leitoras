import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { colaboradoras } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';

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
  // fallback safe onboarding
  return 'Clube das Leitoras <onboarding@resend.dev>';
}

function gerarSenhaTemporaria(): string {
  const palavras = ['livro', 'flor', 'cafe', 'rosa', 'lua', 'sol', 'brisa', 'afeto', 'laca', 'petal'];
  const i = crypto.randomInt(palavras.length);
  const j = crypto.randomInt(palavras.length);
  const num = 100 + crypto.randomInt(900);
  return `${palavras[i]}${palavras[j]}${num}`;
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch (err: any) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const email = body.email?.toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ error: 'E-mail é obrigatório' }, { status: 400 });
    }

    const name: string = body.name?.trim() || email.split('@')[0];
    const role = body.role === 'admin' ? 'colaboradora' : (body.role ?? 'convidada');
    const tempPassword = gerarSenhaTemporaria();

    const [existing] = await db.select().from(colaboradoras).where(eq(colaboradoras.email, email));
    if (existing) {
      return NextResponse.json({ error: 'Este e-mail já possui acesso.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await db.insert(colaboradoras).values({
      email,
      role,
      password: hashedPassword,
      name,
      active: true,
      mustChangePassword: true,
    });

    // Tentar enviar e-mail via Brevo (se configurado)
    let emailError: any = null;
    const apiKey = process.env.BREVO_API_KEY ?? process.env.RESEND_API_KEY;
    if (apiKey) {
      try {
        const { sendEmail } = await import('@/lib/email-client');
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://clubedasleitoras.com.br';
        const effectiveFrom = getFromAddress();
        await sendEmail({
          from: effectiveFrom,
          to: email,
          subject: '💜 Seu acesso ao Clube das Leitoras chegou!',
          html: (await import('@/lib/email-templates')).cartaAprovacaoComSenha({
            nome: name,
            email,
            senha: tempPassword,
            siteUrl,
          }),
        });
      } catch (e) {
        console.error('Erro ao enviar e-mail:', e);
        emailError = e;
      }
    } else {
      emailError = 'BREVO_API_KEY não configurada';
    }

    if (emailError) {
      console.error('E-mail error:', emailError);
      return NextResponse.json(
        { success: true, message: 'Acesso criado, mas o e-mail não pôde ser enviado.', tempPassword, emailError: String(emailError) },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Convite enviado com sucesso.', tempPassword },
      { status: 201 }
    );

  } catch (err) {
    console.error('Erro API Convite:', err);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}