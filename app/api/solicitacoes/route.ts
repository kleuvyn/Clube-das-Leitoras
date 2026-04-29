import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { client, db, dbWrite, isWriteBlockedError } from '@/lib/db';
import { solicitacoes, colaboradoras } from '@/lib/db/schema';
import { and, eq, desc, or, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// Se possível use o remetente já configurado na conta Resend (mesmo que já esteja validado no DNS)
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
  console.warn('[solicitacoes] BREVO_FROM inválido ou não configurado; usando fallback onboarding@resend.dev');
  return 'Clube das Leitoras <onboarding@resend.dev>';
}
const ADMIN_EMAIL = 'clubedasleitorasbsb@gmail.com'; 

function parseCookieHeader(cookieHeader: string | null | undefined) {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce<Record<string, string>>((acc, cookiePart) => {
    const [name, ...rest] = cookiePart.split('=');
    if (!name) return acc;
    acc[name.trim()] = decodeURIComponent(rest.join('=').trim());
    return acc;
  }, {});
}

function normalizeEmail(value?: string | null) {
  return value?.toString().trim().toLowerCase() || '';
}

function normalizePhone(value?: string | null) {
  return value?.toString().replace(/\D/g, '').trim() || '';
}

function dedupeSolicitacoes(rows: any[]) {
  const seenEmails = new Set<string>();
  const seenPhones = new Set<string>();
  const seenNames = new Set<string>();

  return rows.filter((item) => {
    const email = normalizeEmail(item.email);
    const phone = normalizePhone(item.telefone);
    const name = item.nome?.toString().toLowerCase().trim() || '';
    const duplicate = (email && seenEmails.has(email))
      || (phone && seenPhones.has(phone))
      || (name && seenNames.has(name));

    if (duplicate) return false;
    if (email) seenEmails.add(email);
    if (phone) seenPhones.add(phone);
    if (name) seenNames.add(name);
    return true;
  });
}

async function requireSolicitacoesAdmin(request: Request) {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('clube-admin-token')?.value;
  const convidadaToken = cookieStore.get('clube-sessao')?.value;
  let tokenValue = adminToken ?? convidadaToken;

  if (!tokenValue) {
    const rawCookie = request.headers.get('cookie');
    const parsed = parseCookieHeader(rawCookie);
    tokenValue = parsed['clube-admin-token'] ?? parsed['clube-sessao'];
  }

  if (!tokenValue) {
    throw new Error('Não autorizado');
  }

  let tokenData: any;
  try {
    tokenData = typeof tokenValue === 'string' ? JSON.parse(tokenValue) : tokenValue;
  } catch {
    throw new Error('Token inválido');
  }

  const [user] = await db.select().from(colaboradoras).where(sql`LOWER(${colaboradoras.email}) = LOWER(${tokenData.email})`);
  if (!user || user.active === false) throw new Error('Não autorizado');
  if (user.role !== 'admin' && user.role !== 'colaboradora') throw new Error('Permissão insuficiente');
  return user;
}

async function hasApprovedAtColumn() {
  const result = await client.execute("PRAGMA table_info('solicitacoes')");
  return result.rows.some((row: any) => {
    if (!row) return false;
    if (typeof row === 'object' && row !== null) {
      if ('name' in row) return row.name === 'approved_at';
      if ('0' in row && row[0] === 'approved_at') return true;
    }
    return false;
  });
}

export async function GET(request: Request) {
  try {
    await requireSolicitacoesAdmin(request);
    const { searchParams } = new URL(request.url);
    const hasPagination = searchParams.has('page') || searchParams.has('limit');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const offset = (page - 1) * limit;
    const status = searchParams.get('status')?.toLowerCase();
    const tipo = searchParams.get('tipo')?.toLowerCase();
    const search = searchParams.get('search')?.trim().toLowerCase();

    const filters = [] as any[];
    if (status && status !== 'todos') filters.push(eq(solicitacoes.status, status));
    if (tipo && tipo !== 'todas') filters.push(eq(solicitacoes.tipo, tipo));
    if (search) {
      const likePattern = `%${search.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`;
      filters.push(sql`(lower(${solicitacoes.nome}) LIKE ${likePattern} OR lower(${solicitacoes.email}) LIKE ${likePattern})`);
    }

    const whereClause = filters.length === 0
      ? undefined
      : filters.length === 1
        ? filters[0]
        : and(...filters);

    const includeApprovedAt = await hasApprovedAtColumn();
    const selectFields = includeApprovedAt
      ? {
          id: solicitacoes.id,
          tipo: solicitacoes.tipo,
          nome: solicitacoes.nome,
          email: solicitacoes.email,
          telefone: solicitacoes.telefone,
          site: solicitacoes.site,
          instagram: solicitacoes.instagram,
          mensagem: solicitacoes.mensagem,
          enderecoCompleto: solicitacoes.enderecoCompleto,
          status: solicitacoes.status,
          createdAt: solicitacoes.createdAt,
          approvedAt: solicitacoes.approvedAt,
        }
      : {
          id: solicitacoes.id,
          tipo: solicitacoes.tipo,
          nome: solicitacoes.nome,
          email: solicitacoes.email,
          telefone: solicitacoes.telefone,
          site: solicitacoes.site,
          instagram: solicitacoes.instagram,
          mensagem: solicitacoes.mensagem,
          enderecoCompleto: solicitacoes.enderecoCompleto,
          status: solicitacoes.status,
          createdAt: solicitacoes.createdAt,
          approvedAt: sql<null>`null`.as('approvedAt'),
        };

    const [rows, countResult] = await Promise.all([
      db.select(selectFields).from(solicitacoes).where(whereClause).orderBy(desc(solicitacoes.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`cast(count(*) as integer)` }).from(solicitacoes).where(whereClause),
    ]);

    const filteredRows = dedupeSolicitacoes(rows);
    if (!hasPagination) {
      return NextResponse.json(filteredRows);
    }

    const total = countResult[0]?.count || 0;
    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      data: rows,
      pagination: { page, limit, total, pages, hasMore: page < pages }
    });
  } catch (error: any) {
    console.error('[solicitacoes][GET] erro ao listar solicitações:', error);
    const message = error instanceof Error ? error.message : 'Erro ao listar solicitações';
    const statusCode = message === 'Não autorizado' ? 401 : message === 'Permissão insuficiente' ? 403 : 500;
    return NextResponse.json({ error: statusCode >= 500 ? 'Erro ao listar solicitações' : message }, { status: statusCode });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Normalização dos campos (aceita 'name' ou 'nome')
    const tipo = (body.tipo || 'leitora').toLowerCase().trim();
    const nome = (body.nome || body.name)?.trim();
    const rawEmail = (body.email || body.emailAddress || '').toString().toLowerCase().trim();
    const telefone = (body.telefone || body.phone || '').toString().trim();
    const normalizedEmail = normalizeEmail(rawEmail);
    const normalizedTelefone = normalizePhone(telefone);
    const normalizedNome = nome?.toLowerCase().trim();

    const responsavel = (body.responsavel || '').toString().trim();
    const livroTitulo = (body.livroTitulo || '').toString().trim();
    const genero = (body.genero || '').toString().trim();
    const linkCompra = (body.linkCompra || '').toString().trim();
    const site = (body.site || '').toString().trim();
    const sinopse = (body.sinopse || '').toString().trim();
    const bio = (body.bio || '').toString().trim();
    const instagram = (body.instagram || '').toString().trim();
    const categoria = (body.categoria || '').toString().trim();
    const frase = (body.frase || '').toString().trim();
    const proposta = (body.mensagem || '').toString().trim();
    const editora = (body.editora || '').toString().trim();
    const descricao = (body.descricao || '').toString().trim();
    const linkInstagram = (body.linkInstagram || body.instagram || '').toString().trim();

    const birthdate = (body.birthdate || '').toString().trim();
    const tempoClube = (body.tempoClube || '').toString().trim();
    const cartaMimo = body.cartaMimo ? 'Sim' : 'Não';

    const isParceria = tipo === 'parceria';
    const isEmpreendedora = tipo === 'empreendedora';
    const isEscritora = tipo === 'escritora';
    const isLeitora = tipo === 'leitora';

    const details: string[] = [];
    if (isLeitora) {
      if (birthdate) details.push(`Data de Nascimento: ${birthdate}`);
      if (tempoClube) details.push(`Há quanto tempo está no clube: ${tempoClube}`);
      details.push(`Carta de mimo: ${cartaMimo}`);
    }
    if (isEmpreendedora && responsavel) details.push(`Empreendedora: ${responsavel}`);
    if (isEmpreendedora && categoria) details.push(`Categoria: ${categoria}`);
    if (isEmpreendedora && frase) details.push(`A Essência (Frase de impacto): ${frase}`);
    if (isEmpreendedora && proposta) details.push(`O que você cria? (Detalhes): ${proposta}`);
    if (isParceria && editora) details.push(`Nome da Editora: ${editora}`);
    if (isParceria && descricao) details.push(`Descrição: ${descricao}`);
    if (isParceria && linkInstagram) details.push(`Link / Instagram: ${linkInstagram}`);
    if (isEscritora && livroTitulo) details.push(`Título do Livro: ${livroTitulo}`);
    if (isEscritora && genero) details.push(`Gênero Literário: ${genero}`);
    if (isEscritora && linkCompra) details.push(`Link de Compra: ${linkCompra}`);
    if (isEscritora && site) details.push(`Site / Blog: ${site}`);
    if (isEscritora && sinopse) details.push(`Sinopse do Livro: ${sinopse}`);
    if (isEscritora && bio) details.push(`Bio da Escritora: ${bio}`);

    const mensagemExtraBase = body.enderecoCompleto 
      ? `Endereço para mimos: ${body.enderecoCompleto}`
      : '';

    const extraMensagem = details.join('\n');
    const mensagemExtra = [mensagemExtraBase, extraMensagem].filter(Boolean).join('\n\n') || 'Sem mensagem';

    const email = rawEmail || (tipo === 'parceria' ? 'nao-informado@clube.com' : '');
    const requestDate = new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const paraBancoEmail = email || 'Não informado';

    if (!nome || (tipo !== 'parceria' && !rawEmail)) {
      return NextResponse.json({ error: 'Nome e e-mail são obrigatórios' }, { status: 400 });
    }

    if (tipo === 'empreendedora') {
      if (!responsavel || !categoria || !frase || !proposta) {
        return NextResponse.json({ error: 'Empreendedora, categoria, frase e detalhes são obrigatórios' }, { status: 400 });
      }
    }

    if (tipo === 'parceria') {
      if (!nome || !telefone || !rawEmail || !site || !editora || !descricao || !linkInstagram) {
        return NextResponse.json({ error: 'Campo Obrigatório: Nome, Telefone, E-mail, Site, Nome da Editora, Descrição, Link/Instagram' }, { status: 400 });
      }
    }

    if (normalizedEmail) {
      const [existingColaboradora] = await db.select().from(colaboradoras).where(sql`LOWER(${colaboradoras.email}) = LOWER(${normalizedEmail})`);
      if (existingColaboradora) {
        return NextResponse.json({ error: 'Este e-mail já está cadastrado no sistema. Use o acesso existente ou contate a curadoria.' }, { status: 409 });
      }
    }

    const duplicateConditions: any[] = [];
    if (normalizedEmail) duplicateConditions.push(sql`LOWER(${solicitacoes.email}) = ${normalizedEmail}`);
    if (normalizedTelefone) duplicateConditions.push(sql`replace(replace(replace(replace(${solicitacoes.telefone}, ' ', ''), '(', ''), ')', ''), '-', '') = ${normalizedTelefone}`);
    if (normalizedNome) duplicateConditions.push(sql`LOWER(${solicitacoes.nome}) = ${normalizedNome}`);

    if (duplicateConditions.length > 0) {
      const [existingSolicitacao] = await db
        .select({ id: solicitacoes.id })
        .from(solicitacoes)
        .where(or(...duplicateConditions));
      if (existingSolicitacao) {
        return NextResponse.json({ error: 'Já existe uma solicitação com este e-mail, telefone ou nome. Aguarde a análise antes de enviar novamente.' }, { status: 409 });
      }
    }

    // 1. Salva no Banco de Dados
    const [created] = await dbWrite.insert(solicitacoes).values({
      tipo,
      nome,
      email: paraBancoEmail,
      telefone,
      status: 'pendente',
      mensagem: mensagemExtra,
      instagram: body.instagram || null,
      site: body.site || null,
    }).returning();

    // 2. Envio de e-mail (Admin + Usuário)
    const emailStatus: { admin: boolean; user: boolean; hasKey: boolean; errors: string[] } = {
      admin: false,
      user: false,
      hasKey: !!(process.env.BREVO_API_KEY ?? process.env.RESEND_API_KEY),
      errors: [],
    };

    const apiKey = process.env.BREVO_API_KEY ?? process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('[solicitacoes] BREVO_API_KEY não configurada. E-mails não serão enviados.');
      emailStatus.errors.push('BREVO_API_KEY não configurada');
    } else {
      try {
        const { sendEmail } = await import('@/lib/email-client');

        const instagramHtml = body.instagram ? `<p><strong>Instagram:</strong> ${body.instagram}</p>` : '';
        const siteHtml = body.site ? `<p><strong>Site / Blog:</strong> ${body.site}</p>` : '';
        const capaHtml = body.capaUrl ? `<p><strong>Capa:</strong> ${body.capaUrl}</p>` : '';

        const parceriaFields = `
              <p><strong>Nome:</strong> ${nome || 'Não informado'}</p>
              <p><strong>Telefone:</strong> ${telefone || 'Não informado'}</p>
              <p><strong>E-mail:</strong> ${email || 'Não informado'}</p>
              <p><strong>Site:</strong> ${site || 'Não informado'}</p>
              <p><strong>Nome da Editora:</strong> ${editora || 'Não informado'}</p>
              <p><strong>Descrição:</strong> ${descricao || 'Não informado'}</p>
              <p><strong>Link / Instagram:</strong> ${linkInstagram || 'Não informado'}</p>
            `;

        const empreendedoraFields = `
              <p><strong>Empreendedora:</strong> ${responsavel || 'Não informado'}</p>
              <p><strong>Nome do Negócio:</strong> ${nome || 'Não informado'}</p>
              <p><strong>E-mail:</strong> ${email || 'Não informado'}</p>
              <p><strong>Telefone:</strong> ${telefone || 'Não informado'}</p>
              <p><strong>Instagram (@):</strong> ${instagram || 'Não informado'}</p>
              <p><strong>Categoria:</strong> ${categoria || 'Não informado'}</p>
              <p><strong>A Essência (Frase de impacto):</strong> ${frase || 'Não informado'}</p>
              <p><strong>O que você cria? (Detalhes):</strong> ${proposta || 'Não informado'}</p>
            `;

        const leitoraFields = `
              <p><strong>Seu Nome Completo:</strong> ${nome || 'Não informado'}</p>
              <p><strong>E-mail para Acesso:</strong> ${email || 'Não informado'}</p>
              <p><strong>WhatsApp:</strong> ${telefone || 'Não informado'}</p>
              <p><strong>Data de Nascimento:</strong> ${birthdate || 'Não informado'}</p>
              <p><strong>Há quanto tempo no clube:</strong> ${tempoClube || 'Não informado'}</p>
              <p><strong>Endereço para mimos:</strong> ${body.enderecoCompleto || 'Não informado'}</p>
              <p><strong>Carta para mimo:</strong> ${cartaMimo}</p>
            `;

        const escritoraFields = `
              <p><strong>Nome da Escritora:</strong> ${nome || 'Não informado'}</p>
              <p><strong>Telefone:</strong> ${telefone || 'Não informado'}</p>
              <p><strong>E-mail:</strong> ${email || 'Não informado'}</p>
              <p><strong>Instagram (@):</strong> ${instagram || 'Não informado'}</p>
              <p><strong>Título do Livro:</strong> ${livroTitulo || 'Não informado'}</p>
              <p><strong>Gênero Literário:</strong> ${genero || 'Não informado'}</p>
              <p><strong>Link de Compra:</strong> ${linkCompra || 'Não informado'}</p>
              <p><strong>Site / Blog:</strong> ${site || 'Não informado'}</p>
              <p><strong>Sinopse do Livro:</strong> ${sinopse || 'Não informado'}</p>
              <p><strong>Bio da Escritora:</strong> ${bio || 'Não informado'}</p>
            `;

        const effectiveFrom = getFromAddress();
        console.log('[solicitacoes] Brevo FROM:', effectiveFrom, 'admin:', ADMIN_EMAIL, 'user:', email);

        const detalhesHtml = `
              <p><strong>Data do pedido:</strong> ${requestDate}</p>
              ${isLeitora ? leitoraFields : ''}
              ${isParceria ? parceriaFields : ''}
              ${isEmpreendedora ? empreendedoraFields : ''}
              ${isEscritora ? escritoraFields : ''}
              ${capaHtml}
              ${body.capaUrl ? `<div style="margin-top:12px"><p><strong>Visualização da capa:</strong></p><img src="${body.capaUrl}" alt="Capa do livro" style="max-width:360px;max-height:480px;display:block;border:1px solid #ddd;border-radius:8px;" /></div>` : ''}
              <p><strong>Observações:</strong> ${mensagemExtra || 'Sem mensagem'}</p>
            `;
        await sendEmail({
          from: effectiveFrom,
          to: ADMIN_EMAIL,
          subject: `✨ Nova Solicitação: ${nome} (${tipo})`,
          html: (await import('@/lib/email-templates')).cartaNotificacaoAdmin({
            tipo,
            nome,
            data: requestDate,
            detalhesHtml,
            siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://clubedasleitoras.com.br',
          }),
        });
        emailStatus.admin = true;
        console.log('[solicitacoes] email para admin enviado.');

        const userEmail = rawEmail && rawEmail !== 'nao-informado@clube.com' ? rawEmail : null;
        if (userEmail) {
          try {
            await sendEmail({
              from: getFromAddress(),
              to: userEmail,
              subject: 'Sua inscrição está em análise - Clube das Leitoras',
              html: (await import('@/lib/email-templates')).cartaInscricaoEmAnalise({
                nome,
                tipo,
                data: requestDate,
                resumoHtml: `<ul style="margin:0 0 0 18px"><li>Nome: ${nome}</li><li>Tipo: ${tipo}</li><li>E-mail: ${userEmail}</li><li>Telefone: ${telefone || 'Não informado'}</li></ul>`,
                siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://clubedasleitoras.com.br',
              }),
            });
            emailStatus.user = true;
            console.log('[solicitacoes] e-mail de confirmação para leitora enviado.');
          } catch (err) {
            console.error('[solicitacoes] erro ao mandar e-mail de confirmação para leitora:', err);
            emailStatus.errors.push(`user:${err instanceof Error ? err.message : String(err)}`);
          }
        }
      } catch (err) {
        console.error('❌ Falha no processo de e-mail:', err);
        emailStatus.errors.push(`process:${err instanceof Error ? err.message : String(err)}`);
      }
    }

    return NextResponse.json({ success: true, data: created, emailStatus }, { status: 201 });
  } catch (error) {
    console.error('❌ Erro geral no POST:', error);
    return NextResponse.json({ error: 'Erro ao salvar solicitação' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireSolicitacoesAdmin(request);
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status || !['aprovada', 'rejeitada'].includes(status)) {
      return NextResponse.json({ error: 'ID e status válidos são obrigatórios.' }, { status: 400 });
    }

    const includeApprovedAt = await hasApprovedAtColumn();
    const selectFields = includeApprovedAt
      ? {
          id: solicitacoes.id,
          tipo: solicitacoes.tipo,
          nome: solicitacoes.nome,
          email: solicitacoes.email,
          telefone: solicitacoes.telefone,
          site: solicitacoes.site,
          instagram: solicitacoes.instagram,
          mensagem: solicitacoes.mensagem,
          enderecoCompleto: solicitacoes.enderecoCompleto,
          status: solicitacoes.status,
          approvedAt: solicitacoes.approvedAt,
          createdAt: solicitacoes.createdAt,
        }
      : {
          id: solicitacoes.id,
          tipo: solicitacoes.tipo,
          nome: solicitacoes.nome,
          email: solicitacoes.email,
          telefone: solicitacoes.telefone,
          site: solicitacoes.site,
          instagram: solicitacoes.instagram,
          mensagem: solicitacoes.mensagem,
          enderecoCompleto: solicitacoes.enderecoCompleto,
          status: solicitacoes.status,
          approvedAt: sql<null>`null`.as('approvedAt'),
          createdAt: solicitacoes.createdAt,
        };

    const [solicitacao] = await db.select(selectFields).from(solicitacoes).where(eq(solicitacoes.id, id));
    if (!solicitacao) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

    try {
      await dbWrite.update(solicitacoes).set(includeApprovedAt ? { status, approvedAt: status === 'aprovada' ? new Date() : null } : { status }).where(eq(solicitacoes.id, id));
    } catch (err) {
      if (isWriteBlockedError(err)) {
        return NextResponse.json({ error: 'Não é possível aprovar solicitações: banco em modo somente leitura' }, { status: 503 });
      }
      throw err;
    }

    const emailStatus: { adminAction: boolean; user: boolean; hasKey: boolean; errors: string[] } = { adminAction: true, user: false, hasKey: !!(process.env.BREVO_API_KEY ?? process.env.RESEND_API_KEY), errors: [] };
    if (status === 'aprovada') {
      const apiKey = process.env.BREVO_API_KEY ?? process.env.RESEND_API_KEY;
      if (!apiKey) {
        console.warn('BREVO_API_KEY não configurada. E-mail de aprovação não será enviado.');
        emailStatus.errors.push('BREVO_API_KEY não configurada');
      } else {
        const { sendEmail } = await import('@/lib/email-client');

        if (solicitacao.tipo === 'leitora') {
          try {
            const normalizedUserEmail = normalizeEmail(solicitacao.email);
            let [existingUser] = normalizedUserEmail
              ? await db.select().from(colaboradoras).where(sql`LOWER(${colaboradoras.email}) = LOWER(${normalizedUserEmail})`)
              : [null];

            let plainPassword = '';
            if (!existingUser) {
              if (!normalizedUserEmail) {
                throw new Error('E-mail inválido para aprovação de leitora.');
              }
              plainPassword = `clube-${Math.random().toString(36).slice(2, 10)}`;
              const hashedPassword = await bcrypt.hash(plainPassword, 10);
              try {
                await dbWrite.insert(colaboradoras).values({
                  email: normalizedUserEmail,
                  password: hashedPassword,
                  name: solicitacao.nome,
                  phone: solicitacao.telefone || null,
                  role: 'convidada',
                  mustChangePassword: true,
                  active: true,
                  tempoClube: solicitacao.mensagem?.match(/Há quanto tempo está no clube: (.*)/)?.[1] ?? null,
                  enderecoCompleto: solicitacao.enderecoCompleto || null,
                });
              } catch (insertError: any) {
                const insertMessage = insertError instanceof Error ? insertError.message : String(insertError);
                if (/unique|constraint/i.test(insertMessage)) {
                  const [foundUser] = await db.select().from(colaboradoras).where(sql`LOWER(${colaboradoras.email}) = LOWER(${normalizedUserEmail})`);
                  existingUser = foundUser;
                } else {
                  throw insertError;
                }
              }
            }

            if (normalizedUserEmail) {
              await sendEmail({
                from: getFromAddress(),
                to: normalizedUserEmail,
                subject: 'Seja bem-vinda ao Clube das Leitoras',
                html: (await import('@/lib/email-templates')).cartaAprovacaoComSenha({
                  nome: solicitacao.nome,
                  email: normalizedUserEmail,
                  senha: plainPassword || 'Sua conta já existia, use sua senha atual',
                  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://clubedasleitoras.com.br',
                }),
              });
              emailStatus.user = true;
              console.log('✅ E-mail de aprovação para leitora enviado:', normalizedUserEmail);
            } else {
              emailStatus.errors.push('E-mail inválido ou ausente; não foi possível enviar notificação à leitora.');
            }
          } catch (err: any) {
            const errorMessage = err && err instanceof Error ? err.message : String(err);
            console.error('❌ Erro ao criar conta de leitora ou enviar e-mail:', err);
            if (err?.status === 403 || /403/.test(errorMessage)) {
              emailStatus.errors.push('user:403 - Brevo não autorizado. Verifique remitente/destinatário e token.');
            } else {
              emailStatus.errors.push(errorMessage);
            }
          }
        } else {
          try {
            await sendEmail({
              from: getFromAddress(),
              to: solicitacao.email,
              subject: 'Sua solicitação foi aprovada – Clube das Leitoras',
              html: (await import('@/lib/email-templates')).cartaAprovacaoSimples({
                nome: solicitacao.nome,
                tipo: solicitacao.tipo,
                siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://clubedasleitoras.com.br',
              }),
            });
            emailStatus.user = true;
            console.log('✅ E-mail de aprovação enviado para:', solicitacao.email);
          } catch (err: any) {
            const errorMessage = err && err instanceof Error ? err.message : String(err);
            console.error('❌ Erro ao enviar e-mail de aprovação para solicitante:', err);
            if (err?.status === 403 || /403/.test(errorMessage)) {
              emailStatus.errors.push('user:403 - Brevo não autorizado. Verifique remitente/destinatário e token.');
            } else {
              emailStatus.errors.push(errorMessage);
            }
          }
        }
      }
    }

    // Alinha o objeto para a UI do admin que verificava `emailStatus.sent`.
(emailStatus as any).sent = !!emailStatus.user;

    return NextResponse.json({ success: true, emailStatus }, { status: 200 });
  } catch (e) {
    const details = e instanceof Error ? e.message : (typeof e === 'object' && e !== null ? JSON.stringify(e, Object.getOwnPropertyNames(e), 2) : String(e));
    console.error('Erro ao processar aprovação:', e, details);
    const status = details === 'Não autorizado' ? 401 : details === 'Permissão insuficiente' ? 403 : 500;
    return NextResponse.json({ error: status >= 500 ? 'Erro ao processar' : details, detalhes: details }, { status });
  }
}