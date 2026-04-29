import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { client, db, dbWrite } from '@/lib/db';
import { colaboradoras, solicitacoes } from '@/lib/db/schema';
import { eq, or, sql } from 'drizzle-orm';

const ADMIN_EMAIL = 'clubedasleitorasbsb@gmail.com';

async function hasApprovedAtColumn() {
  const result = await client.execute('PRAGMA table_info(solicitacoes)');
  return result.rows.some((row: any) => row?.name === 'approved_at');
}

function normalizeEmail(value?: string | null) {
  return value?.toString().trim().toLowerCase() || '';
}

function normalizePhone(value?: string | null) {
  return value?.toString().replace(/\D/g, '').trim() || '';
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
  console.warn('[cadastro] BREVO_FROM inválido ou não configurado; usando fallback onboarding@resend.dev');
  return 'Clube das Leitoras <onboarding@resend.dev>';
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const phone = body.phone != null ? String(body.phone).trim() : '';
    const birthdate = body.birthdate != null ? String(body.birthdate).trim() : '';
    const tempoClube = body.tempoClube != null ? String(body.tempoClube).trim() : '';
    const enderecoCompleto = body.enderecoCompleto != null ? String(body.enderecoCompleto).trim() : '';
    const cartaMimo = body.cartaMimo === true;

    if (!email || !name || !phone || !birthdate) {
      return NextResponse.json({ error: 'Nome, e-mail, telefone e data de nascimento são obrigatórios.' }, { status: 400 });
    }

    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = normalizePhone(phone);
    const normalizedName = name.toLowerCase().trim();

    if (normalizedEmail) {
      const [existingColaboradora] = await db.select().from(colaboradoras).where(sql`LOWER(${colaboradoras.email}) = LOWER(${normalizedEmail})`);
      if (existingColaboradora) {
        return NextResponse.json({ error: 'Este e-mail já está cadastrado no sistema. Use o acesso existente ou contate a curadoria.' }, { status: 409 });
      }
    }

    const duplicateConditions: any[] = [];
    if (normalizedEmail) duplicateConditions.push(sql`LOWER(${solicitacoes.email}) = ${normalizedEmail}`);
    if (normalizedPhone) duplicateConditions.push(sql`replace(replace(replace(replace(${solicitacoes.telefone}, ' ', ''), '(', ''), ')', ''), '-', '') = ${normalizedPhone}`);
    if (normalizedName) duplicateConditions.push(sql`LOWER(${solicitacoes.nome}) = ${normalizedName}`);

    if (duplicateConditions.length > 0) {
      const duplicateWhere = duplicateConditions.length === 1 ? duplicateConditions[0] : or(...duplicateConditions);
      const [existingSolicitacao] = await db.select({ id: solicitacoes.id }).from(solicitacoes).where(duplicateWhere);
      if (existingSolicitacao) {
        return NextResponse.json({ error: 'Já existe um cadastro em análise com este e-mail, telefone ou nome. Aguarde a aprovação antes de enviar novamente.' }, { status: 409 });
      }
    }

    // Monta mensagem completa para curadoria
    const mensagem = `Novo cadastro de leitora:\n\nNome completo: ${name}\nE-mail: ${email}\nWhatsApp: ${phone}\nData de nascimento: ${birthdate}\nTempo no clube: ${tempoClube || 'Não informado'}\nEndereço para mimos: ${enderecoCompleto || 'Não informado'}\nCarta/mimo: ${cartaMimo ? 'Sim' : 'Não'}`;

    const placeholderPassword = `clube-${Math.random().toString(36).slice(2, 10)}`;
    const hashedPassword = await bcrypt.hash(placeholderPassword, 10);

    const hasApprovedAt = await hasApprovedAtColumn();
    if (hasApprovedAt) {
      await dbWrite.insert(solicitacoes).values({
        tipo: 'leitora',
        nome: name,
        email,
        telefone: phone,
        enderecoCompleto: enderecoCompleto || null,
        mensagem,
        status: 'pendente',
      });
    } else {
      await client.execute({
        sql: `insert into solicitacoes (id, tipo, nome, email, telefone, endereco_completo, mensagem, status, created_at) values (?, ?, ?, ?, ?, ?, ?, ?, (cast((julianday('now') - 2440587.5)*86400000 as integer)))`,
        args: [
          crypto.randomUUID(),
          'leitora',
          name,
          email,
          phone || null,
          enderecoCompleto || null,
          mensagem,
          'pendente',
        ],
      });
    }

    const emailStatus: { user: boolean; admin: boolean; hasKey: boolean; errors: string[] } = { user: false, admin: false, hasKey: !!(process.env.BREVO_API_KEY ?? process.env.RESEND_API_KEY), errors: [] };
    const apiKey = process.env.BREVO_API_KEY ?? process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('BREVO_API_KEY não configurada. E-mails não serão enviados.');
      emailStatus.errors.push('BREVO_API_KEY não configurada');
    } else {
      const { sendEmail } = await import('@/lib/email-client');
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://clubedasleitoras.com.br';
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
