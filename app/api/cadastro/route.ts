import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { colaboradoras, solicitacoes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const ADMIN_EMAIL = 'clubedasleitorasbsb@gmail.com';
const FROM = 'Clube das Leitoras <onboarding@resend.dev>';

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

    // Monta mensagem completa para curadoria
    const mensagem = `Novo cadastro de leitora:\n\nNome completo: ${name}\nE-mail: ${email}\nWhatsApp: ${phone}\nData de nascimento: ${birthdate}\nTempo no clube: ${tempoClube || 'Não informado'}\nEndereço para mimos: ${enderecoCompleto || 'Não informado'}\nCarta/mimo: ${cartaMimo ? 'Sim' : 'Não'}`;

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
      enderecoCompleto: enderecoCompleto || null,
      mensagem,
      status: 'pendente',
    });

    const emailStatus: { user: boolean; admin: boolean; hasKey: boolean; error: string | null } = { user: false, admin: false, hasKey: !!process.env.RESEND_API_KEY, error: null };
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY não configurada. E-mails não serão enviados.');
      emailStatus.error = 'RESEND_API_KEY não configurada';
    } else {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://clubedasleitoras.com.br';
      const errors: string[] = [];

      try {
        await resend.emails.send({
          from: FROM,
          to: email,
          subject: 'Solicitação de acesso recebida: Clube das Leitoras',
          html: `
            <div style="font-family: serif; color: #2C3E50; max-width: 600px; margin: auto;">
              <h1 style="color: #967BB6; font-style: italic;">Olá, ${name}!</h1>
              <p>Obrigada por solicitar acesso ao Clube das Leitoras. Sua inscrição foi recebida com sucesso e está aguardando aprovação da curadoria.</p>
              <p>Assim que avaliada, você receberá um segundo e-mail com seu acesso e senha temporária.</p>
              <div style="margin-top: 20px; padding: 16px; background: #f8f6f3; border: 1px solid #e0dcd8; border-radius: 14px;">
                <p><strong>Próximos passos:</strong></p>
                <ul style="margin: 0; padding-left: 18px;">
                  <li>1. Aguardar aprovação da curadoria.</li>
                  <li>2. Receber email de aprovação com dados de acesso.</li>
                  <li>3. Entrar no site e atualizar sua senha.</li>
                </ul>
              </div>
              <p style="margin-top: 20px;"><a href="${siteUrl}/login" style="background: #967BB6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Ir para login</a></p>
              <p style="font-size: 12px; color: #888; margin-top: 20px;">Se não encontrar o email, verifique a caixa de spam ou lixo eletrônico.</p>
            </div>
          `,
        });
        emailStatus.user = true;
      } catch (e) {
        console.error('Erro ao enviar e-mail ao usuário:', e);
        errors.push(`usuario:${e instanceof Error ? e.message : String(e)}`);
      }

      try {
        await resend.emails.send({
          from: FROM,
          to: ADMIN_EMAIL,
          subject: 'Nova Solicitação de Leitora',
          html: `
            <div style="font-family: serif; color: #2C3E50; max-width: 600px; margin: auto;">
              <h1 style="color: #967BB6; font-style: italic;">Nova solicitação recebida!</h1>
              <p>Uma nova leitora se inscreveu no Clube das Leitoras:</p>
              <ul>
                <li><strong>Nome:</strong> ${name}</li>
                <li><strong>E-mail:</strong> ${email}</li>
                <li><strong>WhatsApp:</strong> ${phone}</li>
                <li><strong>Data de nascimento:</strong> ${birthdate}</li>
                <li><strong>Tempo no clube:</strong> ${tempoClube || 'Não informado'}</li>
                <li><strong>Endereço para mimos:</strong> ${enderecoCompleto || 'Não informado'}</li>
                <li><strong>Carta para mimo:</strong> ${cartaMimo ? 'Sim' : 'Não'}</li>
              </ul>
              <p>Verifique a solicitação no painel de admin.</p>
            </div>
          `,
        });
        emailStatus.admin = true;
      } catch (e) {
        console.error('Erro ao enviar e-mail ao admin:', e);
        errors.push(`admin:${e instanceof Error ? e.message : String(e)}`);
      }

      if (errors.length > 0) {
        emailStatus.error = errors.join(' | ');
      }
    }

    return NextResponse.json({ success: true, message: 'Cadastro recebido! Aguarde aprovação da curadoria.', emailStatus }, { status: 201 });
  } catch (error) {
    console.error('Erro no cadastro público:', error);
    return NextResponse.json({ error: 'Erro ao processar cadastro.' }, { status: 500 });
  }
}
