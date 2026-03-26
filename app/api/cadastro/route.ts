import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { colaboradoras, solicitacoes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email?.toLowerCase().trim();
    const name = body.name?.trim();
    const phone = body.phone?.trim();
    const birthdate = body.birthdate;
    const tempoClube = body.tempoClube?.trim();
    const enderecoCompleto = body.enderecoCompleto?.trim();
    const cartaMimo = body.cartaMimo === true;

    if (!email || !name || !phone || !birthdate) {
      return NextResponse.json({ error: 'Nome, e-mail, telefone e data de nascimento são obrigatórios.' }, { status: 400 });
    }

    const [existing] = await db.select().from(colaboradoras).where(eq(colaboradoras.email, email));
    if (existing) {
      return NextResponse.json({ error: 'Este e-mail já está cadastrado.' }, { status: 400 });
    }

    const placeholderPassword = `clube-${Math.random().toString(36).slice(2, 10)}`;
    const hashedPassword = await bcrypt.hash(placeholderPassword, 10);

    await db.insert(solicitacoes).values({
      tipo: 'leitora',
      nome: name,
      email,
      telefone: phone,
      mensagem: `Cadastro de leitora enviado. Tempo de clube: ${tempoClube || 'não informado'}.`,
      status: 'pendente',
    });

    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://clubedasleitoras.com.br';

        await resend.emails.send({
          from: 'Clube das Leitoras <no-reply@clubedasleitoras.com.br>',
          to: email,
          subject: 'Recebemos sua solicitação de cadastro',
          html: `
            <div style="font-family: serif; color: #2C3E50; max-width: 600px; margin: auto;">
              <h1 style="color: #967BB6; font-style: italic;">Olá, ${name}!</h1>
              <p>Obrigada por solicitar acesso ao Clube das Leitoras. Sua inscrição foi recebida com sucesso e está aguardando aprovação da curadoria.</p>
              <p>Assim que avaliada, você receberá um segundo e-mail com seu acesso e senha temporária.</p>
              <p style="margin-top: 20px;"><a href="${siteUrl}/login" style="background: #967BB6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Ver status no site</a></p>
              <p style="font-size: 12px; color: #888; margin-top: 20px;">Se não achar o email, verifique sua caixa de spam.</p>
            </div>
          `,
        });
      } catch (e) {
        console.error('Erro ao enviar e-mail de confirmação:', e);
      }
    }

    return NextResponse.json({ success: true, message: 'Cadastro recebido! Aguarde aprovação da curadoria.' }, { status: 201 });
  } catch (error) {
    console.error('Erro no cadastro público:', error);
    return NextResponse.json({ error: 'Erro ao processar cadastro.' }, { status: 500 });
  }
}
