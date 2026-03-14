import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { colaboradoras } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';

const FROM = 'Clube das Leitoras <no-reply@clubedasleitoras.com.br>';

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
    const tempPassword = 'leitura2026';

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
      mustChangePassword: false,
    });

    // Tentar enviar e-mail via Resend (se configurado)
    let emailError: any = null;
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://clubedasleitoras.com.br';
        const result = await resend.emails.send({
          from: FROM,
          to: email,
          subject: '💜 Seu acesso ao Clube das Leitoras chegou!',
          html: `
            <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #2C3E50;">
              <div style="background: #967BB6; padding: 40px; text-align: center; border-radius: 16px 16px 0 0;">
                <h1 style="color: #fff; font-size: 28px; font-weight: normal; font-style: italic; margin: 0;">
                  Clube das Leitoras
                </h1>
                <p style="color: #e8d5f5; font-size: 13px; margin: 8px 0 0; letter-spacing: 0.2em; text-transform: uppercase;">
                  Brasília · BSB
                </p>
              </div>
              <div style="background: #FDFCFB; padding: 40px; border: 1px solid #f0e8ff; border-top: none; border-radius: 0 0 16px 16px;">
                <p style="font-size: 18px; margin: 0 0 24px;">Olá, <strong>${name}</strong> 💜</p>
                <p style="line-height: 1.8; color: #555; margin: 0 0 24px;">
                  Que alegria te ter aqui! Seu acesso ao Clube das Leitoras foi criado com sucesso.
                  Use os dados abaixo para entrar:
                </p>
                <div style="background: #f4f0ff; border-radius: 12px; padding: 24px; margin: 0 0 28px; border-left: 4px solid #967BB6;">
                  <p style="margin: 0 0 8px; font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 0.15em;">Seus dados de acesso</p>
                  <p style="margin: 0 0 6px;"><strong>E-mail:</strong> ${email}</p>
                  <p style="margin: 0;"><strong>Senha temporária:</strong> <code style="background:#e0d9ff; padding: 2px 8px; border-radius: 4px; font-size: 15px;">${tempPassword}</code></p>
                </div>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${siteUrl}/login"
                     style="background: #967BB6; color: #fff; padding: 16px 40px; border-radius: 30px; text-decoration: none; font-size: 14px; font-style: italic; display: inline-block;">
                    Entrar no Clube →
                  </a>
                </div>
                <p style="font-size: 12px; color: #bbb; line-height: 1.7; text-align: center; margin: 0;">
                  Se não esperava esse e-mail, pode ignorá-lo com segurança.<br/>
                  Clube das Leitoras • Brasília
                </p>
              </div>
            </div>
          `,
        });
        emailError = result.error;
      } catch (e) {
        console.error('Erro ao enviar e-mail:', e);
        emailError = e;
      }
    } else {
      emailError = 'RESEND_API_KEY não configurada';
    }

    if (emailError) {
      console.error('Resend error:', emailError);
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