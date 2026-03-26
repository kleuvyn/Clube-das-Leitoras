import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { colaboradoras } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';

const FROM = 'Clube das Leitoras <no-reply@clubedasleitoras.com.br>';

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

    const [user] = await db.select().from(colaboradoras).where(eq(colaboradoras.id, id));
    if (!user) return NextResponse.json({ error: 'Leitora não encontrada' }, { status: 404 });
    if (user.active) return NextResponse.json({ error: 'Leitora já está ativa' }, { status: 400 });

    const tempPassword = gerarSenhaTemporaria();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await db.update(colaboradoras).set({
      password: hashedPassword,
      active: true,
      status: 'ativa',
      mustChangePassword: true,
    }).where(eq(colaboradoras.id, id));

    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://clubedasleitoras.com.br';

        await resend.emails.send({
          from: FROM,
          to: user.email,
          subject: '🎉 Cadastro aprovado no Clube das Leitoras',
          html: `
            <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #2C3E50;">
              <p>Olá <strong>${user.name ?? user.email}</strong>,</p>
              <p>Seu cadastro foi aprovado! Agora você tem acesso à comunidade literária.</p>
              <p><strong>E-mail:</strong> ${user.email}</p>
              <p><strong>Senha temporária:</strong> <code>${tempPassword}</code></p>
              <p>Entre e altere sua senha em <a href="${siteUrl}/nova-senha">/nova-senha</a>.</p>
            </div>
          `,
        });
      } catch (e) {
        console.error('Erro ao enviar e-mail de aprovação:', e);
      }
    }

    return NextResponse.json({ success: true, message: 'Leitora aprovada e e-mail enviado.' }, { status: 200 });
  } catch (error) {
    console.error('Erro ao aprovar leitora:', error);
    return NextResponse.json({ error: 'Erro ao aprovar leitora.' }, { status: 500 });
  }
}
