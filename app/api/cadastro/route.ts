import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { colaboradoras, solicitacoes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const ADMIN_EMAIL = 'clubedasleitorasbsb@gmail.com';

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
  console.warn('[cadastro] BREVO_FROM inválido ou não configurado; usando fallback onboarding@resend.dev');
  return 'Clube das Leitoras <onboarding@resend.dev>';
}

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

    const emailStatus: { user: boolean; admin: boolean; hasKey: boolean; errors: string[] } = { user: false, admin: false, hasKey: !!(process.env.BREVO_API_KEY ?? process.env.RESEND_API_KEY), errors: [] };
    const apiKey = process.env.BREVO_API_KEY ?? process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('BREVO_API_KEY não configurada. E-mails não serão enviados.');
      emailStatus.errors.push('BREVO_API_KEY não configurada');
    } else {
      const { sendEmail } = await import('@/lib/email-client');
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.clubedasleitoras.com.br';
      const effectiveFrom = getFromAddress();
      const requestDate = new Date().toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      console.log('[cadastro] Brevo FROM:', effectiveFrom, 'admin:', ADMIN_EMAIL, 'usuario:', email);

      try {
        await sendEmail({
          from: effectiveFrom,
          to: email,
          subject: 'Solicitação de acesso recebida: Clube das Leitoras',
          html: (await import('@/lib/email-templates')).cartaInscricaoEmAnalise({
            nome: name,
            tipo: 'leitora',
            data: requestDate,
            resumoHtml: `<p>Próximos passos: aguarde aprovação da curadoria. Você receberá outro e-mail com seus dados de acesso.</p>`,
            siteUrl,
          }),
        });
        emailStatus.user = true;
        console.log(`[cadastro] E-mail de confirmação enviado para leitora: ${email}`);
      } catch (e: any) {
        const errorMessage = (e && e instanceof Error ? e.message : String(e));
        console.error('[cadastro] Erro ao enviar e-mail para leitora:', e);
        if (e?.status === 403 || /403/.test(errorMessage)) {
          emailStatus.errors.push('user:403 - Brevo não autorizado para remetente/destinatário. Verifique domínio/envelope e token.');
        } else {
          emailStatus.errors.push(`user:${errorMessage}`);
        }
      }

      try {
        const adminDetailsHtml = `
          <p><strong>E-mail:</strong> ${email}</p>
          <p><strong>WhatsApp:</strong> ${phone}</p>
          <p><strong>Data de nascimento:</strong> ${birthdate}</p>
          <p><strong>Tempo no clube:</strong> ${tempoClube || 'Não informado'}</p>
          <p><strong>Endereço para mimos:</strong> ${enderecoCompleto || 'Não informado'}</p>
          <p><strong>Carta para mimo:</strong> ${cartaMimo ? 'Sim' : 'Não'}</p>
        `;

        await sendEmail({
          from: getFromAddress(),
          to: ADMIN_EMAIL,
          subject: 'Nova Solicitação de Leitora',
          html: (await import('@/lib/email-templates')).cartaNotificacaoAdmin({
            tipo: 'leitora',
            nome: name,
            data: requestDate,
            detalhesHtml: adminDetailsHtml,
            siteUrl,
          }),
        });
        emailStatus.admin = true;
        console.log(`[cadastro] E-mail de aviso enviado para admin: ${ADMIN_EMAIL}`);
      } catch (e) {
        console.error('[cadastro] Erro ao enviar e-mail para admin:', e);
        emailStatus.errors.push(`admin:${e instanceof Error ? e.message : String(e)}`);
      }
    }

    return NextResponse.json({ success: true, message: 'Cadastro recebido! Aguarde aprovação da curadoria.', emailStatus }, { status: 201 });
  } catch (error) {
    console.error('Erro no cadastro público:', error);
    return NextResponse.json({ error: 'Erro ao processar cadastro.' }, { status: 500 });
  }
}
