import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { client, db, dbWrite, isWriteBlockedError } from '@/lib/db';
import { solicitacoes, colaboradoras, carteirinhas, empreendedoras, escritoras, parcerias } from '@/lib/db/schema';
import { and, asc, eq, desc, inArray, or, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

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

function normalizeSolicitacaoStatus(value?: string | null) {
  if (!value) return '';
  const normalized = value
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const aliases: Record<string, string> = {
    aprovada: 'aprovada',
    aprovado: 'aprovada',
    rejeitada: 'rejeitada',
    pendente: 'pendente',
    bloqueada: 'bloqueada',
    bloqueado: 'bloqueada',
    bloqueda: 'bloqueada',
    excluida: 'excluida',
    excluido: 'excluida',
  };

  return aliases[normalized] || '';
}

function isDataImageUrl(value?: string | null) {
  if (!value) return false;
  return /^data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=\r\n]+$/i.test(value.trim());
}

function sanitizeAssetUrl(value?: string | null) {
  const normalized = value?.toString().trim() || '';
  if (!normalized) return '';
  if (isDataImageUrl(normalized)) return '';
  return normalized;
}

function extractDataImageFromValue(value?: string | null) {
  if (!value) return '';
  const match = value.match(/(data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=\r\n]+)/i);
  if (!match?.[1]) return '';
  const normalized = match[1].replace(/\s+/g, '');
  return isDataImageUrl(normalized) ? normalized : '';
}

async function resolveAssetUrl(rawValue?: string | null) {
  const normalized = rawValue?.toString().trim() || '';
  const dataImage = extractDataImageFromValue(normalized);
  if (dataImage) {
    try {
      return await persistDataImage(dataImage);
    } catch {
      return '';
    }
  }
  return sanitizeAssetUrl(normalized);
}

async function extractAndPersistDataImage(value?: string | null) {
  const dataImage = extractDataImageFromValue(value);
  if (!dataImage) return '';
  try {
    return await persistDataImage(dataImage);
  } catch {
    return '';
  }
}

async function resolveStoredAssetUrl(rawValue?: string | null) {
  const normalized = sanitizeAssetUrl(rawValue);
  if (normalized) return normalized;
  return await extractAndPersistDataImage(rawValue);
}

async function persistDataImage(dataUrl: string) {
  const dataMatch = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/i);
  if (!dataMatch) return '';

  const mime = dataMatch[1].toLowerCase();
  const base64Payload = dataMatch[2].replace(/\s+/g, '');
  if (!base64Payload) return '';

  const extByMime: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  const ext = extByMime[mime] || 'png';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import('@vercel/blob');
    const buffer = Buffer.from(base64Payload, 'base64');
    const blob = await put(fileName, buffer, {
      access: 'public',
      contentType: mime,
      store: process.env.BLOB_STORE_ID,
    });
    return blob.url;
  }

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadsDir, { recursive: true });
  const buffer = Buffer.from(base64Payload, 'base64');
  await writeFile(path.join(uploadsDir, fileName), buffer);
  return `/uploads/${fileName}`;
}

function extractMensagemValue(mensagem: string | null | undefined, labels: string[]) {
  if (!mensagem) return '';
  const lines = mensagem
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    for (const label of labels) {
      const lowerLabel = `${label.toLowerCase()}:`;
      if (lowerLine.startsWith(lowerLabel)) {
        return line.slice(lowerLabel.length).trim();
      }
    }
  }

  return '';
}

async function upsertEscritoraFromSolicitacao(solicitacao: any, fallbackFotoUrl?: string | null) {
  const nomeEscritora = solicitacao.nome?.trim() || '';
  const livroTituloEscritora = extractMensagemValue(solicitacao.mensagem, ['Título do Livro']);
  if (!nomeEscritora || !livroTituloEscritora) return false;

  const generoEscritora = extractMensagemValue(solicitacao.mensagem, ['Gênero Literário']);
  const linkCompraEscritora = extractMensagemValue(solicitacao.mensagem, ['Link de Compra']);
  const siteEscritora = extractMensagemValue(solicitacao.mensagem, ['Site / Blog']);
  const sinopseEscritora = extractMensagemValue(solicitacao.mensagem, ['Sinopse do Livro']);
  const bioEscritora = extractMensagemValue(solicitacao.mensagem, ['Bio da Escritora']);
  const capaEscritora = await resolveAssetUrl(extractMensagemValue(solicitacao.mensagem, ['Capa']));
  const effectiveCapaUrl = capaEscritora || fallbackFotoUrl || sanitizeAssetUrl(solicitacao.fotoUrl) || null;

  const payload = {
    nome: nomeEscritora,
    livroTitulo: livroTituloEscritora,
    genero: generoEscritora || null,
    sinopse: sinopseEscritora || null,
    instagram: solicitacao.instagram || null,
    linkCompra: linkCompraEscritora || null,
    capaUrl: effectiveCapaUrl,
    site: siteEscritora || solicitacao.site || null,
    bio: bioEscritora || null,
  };

  const [existingEscritora] = await db.select({ id: escritoras.id })
    .from(escritoras)
    .where(and(
      sql`LOWER(${escritoras.nome}) = LOWER(${nomeEscritora})`,
      sql`LOWER(${escritoras.livroTitulo}) = LOWER(${livroTituloEscritora})`,
    ));

  if (existingEscritora?.id) {
    await dbWrite.update(escritoras).set(payload).where(eq(escritoras.id, existingEscritora.id));
  } else {
    await dbWrite.insert(escritoras).values(payload);
  }

  return true;
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
    const status = normalizeSolicitacaoStatus(searchParams.get('status'));
    const tipo = searchParams.get('tipo')?.toLowerCase();
    const search = searchParams.get('search')?.trim().toLowerCase();

    const statusEfetivoExpr = sql<string>`CASE
      WHEN lower(${solicitacoes.tipo}) = 'leitora' THEN
        COALESCE(
          CASE
            WHEN lower(${solicitacoes.status}) IN ('pendente', 'rejeitada') THEN lower(${solicitacoes.status})
            WHEN lower(${solicitacoes.status}) IN ('bloqueada', 'bloqueado', 'bloqueda') THEN 'bloqueada'
            WHEN lower(${solicitacoes.status}) IN ('excluida', 'excluída', 'excluido') THEN 'excluida'
            ELSE null
          END,
          (
            SELECT CASE
              WHEN lower(c.status) IN ('bloqueada', 'bloqueado', 'bloqueda') THEN 'bloqueada'
              WHEN lower(c.status) IN ('excluida', 'excluída', 'excluido') THEN 'excluida'
              WHEN c.active = 0 THEN 'bloqueada'
              WHEN lower(c.status) IN ('ativa', 'aprovada', 'aprovado') THEN 'aprovada'
              WHEN lower(c.status) = 'pendente' THEN 'pendente'
              WHEN lower(c.status) = 'rejeitada' THEN 'rejeitada'
              ELSE lower(c.status)
            END
            FROM ${colaboradoras} c
            WHERE lower(trim(c.email)) = lower(trim(${solicitacoes.email}))
            ORDER BY
              CASE
                WHEN lower(c.status) IN ('bloqueada', 'bloqueado', 'bloqueda') THEN 0
                WHEN lower(c.status) IN ('excluida', 'excluída', 'excluido') THEN 1
                WHEN c.active = 0 THEN 2
                WHEN lower(c.status) IN ('ativa', 'aprovada', 'aprovado') THEN 3
                ELSE 4
              END ASC,
              c.created_at DESC
            LIMIT 1
          ),
          CASE
            WHEN lower(${solicitacoes.status}) IN ('ativa', 'aprovada', 'aprovado') THEN 'aprovada'
            WHEN lower(${solicitacoes.status}) IN ('bloqueada', 'bloqueado', 'bloqueda') THEN 'bloqueada'
            WHEN lower(${solicitacoes.status}) IN ('excluida', 'excluída', 'excluido') THEN 'excluida'
            WHEN lower(${solicitacoes.status}) IN ('pendente', 'rejeitada') THEN lower(${solicitacoes.status})
            ELSE lower(${solicitacoes.status})
          END
        )
      ELSE
        CASE
          WHEN lower(${solicitacoes.status}) IN ('ativa', 'aprovada', 'aprovado') THEN 'aprovada'
          WHEN lower(${solicitacoes.status}) IN ('bloqueada', 'bloqueado', 'bloqueda') THEN 'bloqueada'
          WHEN lower(${solicitacoes.status}) IN ('excluida', 'excluída', 'excluido') THEN 'excluida'
          WHEN lower(${solicitacoes.status}) IN ('pendente', 'rejeitada') THEN lower(${solicitacoes.status})
          ELSE lower(${solicitacoes.status})
        END
    END`;

    const filters = [] as any[];
    if (status && status !== 'todos') filters.push(sql`${statusEfetivoExpr} = ${status}`);
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
    const colaboradoraCarteirinhaUrlField = sql<string | null>`(
      SELECT url FROM carteirinhas
      WHERE colaboradora_id = (
        SELECT id FROM colaboradoras
        WHERE lower(email) = lower(${solicitacoes.email})
        LIMIT 1
      )
      ORDER BY created_at DESC
      LIMIT 1
    )`;

    const solicitacaoCarteirinhaUrlField = sql<string | null>`(
      SELECT url FROM carteirinhas
      WHERE solicitacao_id = ${solicitacoes.id}
      ORDER BY created_at DESC
      LIMIT 1
    )`;

    const carteirinhaUrlField = sql<string | null>`COALESCE(
      ${solicitacoes.carteirinhaUrl},
      (${solicitacaoCarteirinhaUrlField}),
      (${colaboradoraCarteirinhaUrlField})
    )`;

    const selectFields = includeApprovedAt
      ? {
          id: solicitacoes.id,
          tipo: solicitacoes.tipo,
          nome: solicitacoes.nome,
          email: solicitacoes.email,
          telefone: solicitacoes.telefone,
          whatsapp: solicitacoes.whatsapp,
          site: solicitacoes.site,
          instagram: solicitacoes.instagram,
          mensagem: solicitacoes.mensagem,
          enderecoCompleto: solicitacoes.enderecoCompleto,
          fotoUrl: solicitacoes.fotoUrl,
          carteirinhaUrl: carteirinhaUrlField.as('carteirinhaUrl'),
          status: statusEfetivoExpr.as('status'),
          createdAt: solicitacoes.createdAt,
          approvedAt: solicitacoes.approvedAt,
        }
      : {
          id: solicitacoes.id,
          tipo: solicitacoes.tipo,
          nome: solicitacoes.nome,
          email: solicitacoes.email,
          telefone: solicitacoes.telefone,
          whatsapp: solicitacoes.whatsapp,
          site: solicitacoes.site,
          instagram: solicitacoes.instagram,
          mensagem: solicitacoes.mensagem,
          enderecoCompleto: solicitacoes.enderecoCompleto,
          fotoUrl: solicitacoes.fotoUrl,
          carteirinhaUrl: carteirinhaUrlField.as('carteirinhaUrl'),
          status: statusEfetivoExpr.as('status'),
          createdAt: solicitacoes.createdAt,
          approvedAt: sql<null>`null`.as('approvedAt'),
        };

    const [rows, countResult] = await Promise.all([
      db.select(selectFields).from(solicitacoes).where(whereClause).orderBy(desc(solicitacoes.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`cast(count(*) as integer)` }).from(solicitacoes).where(whereClause),
    ]);

    const normalizedRows = await Promise.all(rows.map(async (row: any) => {
      const currentFotoUrl = sanitizeAssetUrl(row.fotoUrl);
      if (currentFotoUrl) {
        return { ...row, fotoUrl: currentFotoUrl };
      }

      const dataImageFromFotoUrl = await extractAndPersistDataImage(row.fotoUrl);
      if (dataImageFromFotoUrl) {
        try {
          await dbWrite.update(solicitacoes).set({ fotoUrl: dataImageFromFotoUrl }).where(eq(solicitacoes.id, row.id));
        } catch {
          // Ignora falha de persistência e retorna fallback para renderização imediata.
        }
        return {
          ...row,
          fotoUrl: dataImageFromFotoUrl,
        };
      }

      const fallbackFromMensagem = sanitizeAssetUrl(extractMensagemValue(row.mensagem, ['Logo', 'Capa']));
      if (fallbackFromMensagem) {
        try {
          await dbWrite.update(solicitacoes).set({ fotoUrl: fallbackFromMensagem }).where(eq(solicitacoes.id, row.id));
        } catch {
          // Ignora falha de persistência e retorna fallback para renderização imediata.
        }
        return {
          ...row,
          fotoUrl: fallbackFromMensagem,
        };
      }

      const dataImageFromMensagem = await extractAndPersistDataImage(row.mensagem);
      if (dataImageFromMensagem) {
        try {
          await dbWrite.update(solicitacoes).set({ fotoUrl: dataImageFromMensagem }).where(eq(solicitacoes.id, row.id));
          return {
            ...row,
            fotoUrl: dataImageFromMensagem,
          };
        } catch {
          // Em caso de erro, mantém sem imagem para não quebrar listagem.
        }
      }

      return {
        ...row,
        fotoUrl: null,
      };
    }));

    const filteredRows = normalizedRows;
    if (!hasPagination) {
      return NextResponse.json(filteredRows);
    }

    const total = countResult[0]?.count || 0;
    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      data: normalizedRows,
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
    const editora = (body.editora || '').toString().trim();
    const descricao = (body.descricao || '').toString().trim();
    const linkInstagram = (body.linkInstagram || body.instagram || '').toString().trim();
    const whatsapp = (body.whatsapp || '').toString().trim();
    const capaUrl = await resolveAssetUrl((body.capaUrl || '').toString().trim());
    const logoUrl = await resolveAssetUrl((body.logoUrl || '').toString().trim());
    const fotoUrlRaw = (body.fotoUrl || body.foto_url || body.foto || body.capaUrl || body.logoUrl || '').toString().trim();
    const fotoUrl = await resolveAssetUrl(fotoUrlRaw);

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
    if (isEmpreendedora && logoUrl) details.push(`Logo: ${logoUrl}`);
    if (isParceria && editora) details.push(`Nome da Editora: ${editora}`);
    if (isParceria && descricao) details.push(`Descrição: ${descricao}`);
    if (isParceria && linkInstagram) details.push(`Link / Instagram: ${linkInstagram}`);
    if (isParceria && logoUrl) details.push(`Logo: ${logoUrl}`);
    if (isEscritora && livroTitulo) details.push(`Título do Livro: ${livroTitulo}`);
    if (isEscritora && genero) details.push(`Gênero Literário: ${genero}`);
    if (isEscritora && linkCompra) details.push(`Link de Compra: ${linkCompra}`);
    if (isEscritora && site) details.push(`Site / Blog: ${site}`);
    if (isEscritora && sinopse) details.push(`Sinopse do Livro: ${sinopse}`);
    if (isEscritora && bio) details.push(`Bio da Escritora: ${bio}`);
    if (isEscritora && capaUrl) details.push(`Capa: ${capaUrl}`);

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
      if (!responsavel || !categoria || !frase) {
        return NextResponse.json({ error: 'Empreendedora, categoria e frase são obrigatórios' }, { status: 400 });
      }
    }

    if (tipo === 'parceria') {
      if (!nome || !telefone || !rawEmail || !site || !editora || !descricao || !linkInstagram) {
        return NextResponse.json({ error: 'Campo Obrigatório: Nome, Telefone, E-mail, Site, Nome da Editora, Descrição, Link/Instagram' }, { status: 400 });
      }
    }

    if (tipo === 'carteirinha') {
      if (!nome || !whatsapp || !fotoUrl) {
        return NextResponse.json({ error: 'Nome completo, WhatsApp e foto são obrigatórios para a carteirinha.' }, { status: 400 });
      }
    }

    if (normalizedEmail && isLeitora) {
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
        .where(and(
          eq(solicitacoes.tipo, tipo),
          sql`${solicitacoes.status} != 'rejeitada'`,
          or(...duplicateConditions),
        ));
      if (existingSolicitacao) {
        return NextResponse.json({ error: 'Já existe uma solicitação com este e-mail, telefone ou nome. Aguarde a análise antes de enviar novamente.' }, { status: 409 });
      }
    }

    // 1. Salva no Banco de Dados
    await dbWrite.insert(solicitacoes).values({
      tipo,
      nome,
      email: paraBancoEmail,
      telefone: telefone || null,
      whatsapp: whatsapp || null,
      site: site || null,
      instagram: instagram || null,
      mensagem: mensagemExtra || null,
      enderecoCompleto: body.enderecoCompleto || null,
      fotoUrl: fotoUrl || null,
      carteirinhaUrl: null,
    });

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
        const capaHtml = capaUrl ? `<p><strong>Capa:</strong> ${capaUrl}</p>` : '';
        const logoHtml = logoUrl ? `<p><strong>Logo:</strong> ${logoUrl}</p>` : '';
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
              ${logoHtml}
              ${capaUrl ? `<div style="margin-top:12px"><p><strong>Visualização da capa:</strong></p><img src="${capaUrl}" alt="Capa do livro" style="max-width:360px;max-height:480px;display:block;border:1px solid #ddd;border-radius:8px;" /></div>` : ''}
              ${logoUrl ? `<div style="margin-top:12px"><p><strong>Visualização do logo:</strong></p><img src="${logoUrl}" alt="Logo" style="max-width:360px;max-height:360px;display:block;border:1px solid #ddd;border-radius:8px;" /></div>` : ''}
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

    return NextResponse.json({ success: true, emailStatus }, { status: 201 });
  } catch (error) {
    console.error('❌ Erro geral no POST:', error);
    return NextResponse.json({ error: 'Erro ao salvar solicitação' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireSolicitacoesAdmin(request);
    const body = await request.json();
    const { id, status: rawStatus, carteirinhaUrl, resendEmail } = body;
    const status = normalizeSolicitacaoStatus(rawStatus);
    const removeCarteirinha = body.removeCarteirinha === true;
    const isResend = resendEmail === true;
    const rawFotoUrl = typeof body.fotoUrl === 'string' ? body.fotoUrl : '';
    const normalizedFotoUrl = sanitizeAssetUrl(rawFotoUrl);
    const resolvedFotoUrl = await resolveAssetUrl((body.fotoUrl || body.foto_url || body.foto || '').toString().trim());
    const effectiveFotoUrl = resolvedFotoUrl || normalizedFotoUrl;
    const isFotoUpload = effectiveFotoUrl.length > 0;

    if (!id || (!status && !carteirinhaUrl && !isFotoUpload && !isResend && !removeCarteirinha)) {
      return NextResponse.json({ error: 'ID e status, URL da carteirinha, URL da foto, removeCarteirinha ou resendEmail são obrigatórios.' }, { status: 400 });
    }

    if (rawStatus && !status) {
      return NextResponse.json({ error: 'Status inválido.' }, { status: 400 });
    }

    const includeApprovedAt = await hasApprovedAtColumn();
    const selectFields = includeApprovedAt
      ? {
          id: solicitacoes.id,
          tipo: solicitacoes.tipo,
          nome: solicitacoes.nome,
          email: solicitacoes.email,
          telefone: solicitacoes.telefone,
          whatsapp: solicitacoes.whatsapp,
          fotoUrl: solicitacoes.fotoUrl,
          carteirinhaUrl: solicitacoes.carteirinhaUrl,
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
          whatsapp: solicitacoes.whatsapp,
          fotoUrl: solicitacoes.fotoUrl,
          carteirinhaUrl: solicitacoes.carteirinhaUrl,
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

    const isCardUpload = typeof carteirinhaUrl === 'string' && carteirinhaUrl.trim().length > 0;

    if (resendEmail === true && solicitacao.status !== 'aprovada') {
      return NextResponse.json({ error: 'Só é possível reenviar e-mail para solicitações aprovadas.' }, { status: 400 });
    }

    const updateValues: any = {};
    if (status) {
      if (includeApprovedAt) {
        updateValues.status = status;
        updateValues.approvedAt = status === 'aprovada' ? new Date() : null;
      } else {
        updateValues.status = status;
      }
    }
    if (isFotoUpload) {
      updateValues.fotoUrl = effectiveFotoUrl;
    }

    const resolvedStoredSolicitacaoFotoUrl = await resolveStoredAssetUrl(solicitacao.fotoUrl);
    const effectiveSolicitacaoFotoUrl = effectiveFotoUrl || resolvedStoredSolicitacaoFotoUrl;
    if (!updateValues.fotoUrl && resolvedStoredSolicitacaoFotoUrl && sanitizeAssetUrl(solicitacao.fotoUrl) !== resolvedStoredSolicitacaoFotoUrl) {
      updateValues.fotoUrl = resolvedStoredSolicitacaoFotoUrl;
    }

    try {
      if (Object.keys(updateValues).length > 0) {
        await dbWrite.update(solicitacoes).set(updateValues).where(eq(solicitacoes.id, id));
      }

      if (removeCarteirinha) {
        await dbWrite.update(solicitacoes).set({ carteirinhaUrl: null }).where(eq(solicitacoes.id, id));
        const cardRows = await db
          .select({
            url: carteirinhas.url,
            colaboradoraId: carteirinhas.colaboradoraId,
          })
          .from(carteirinhas)
          .where(eq(carteirinhas.solicitacaoId, id));

        await dbWrite.delete(carteirinhas).where(eq(carteirinhas.solicitacaoId, id));

        const collaboratorIds = Array.from(
          new Set(cardRows.map((row) => row.colaboradoraId).filter((value): value is string => Boolean(value)))
        );
        if (collaboratorIds.length > 0) {
          await dbWrite
            .update(colaboradoras)
            .set({ carteirinhaUrl: null })
            .where(inArray(colaboradoras.id, collaboratorIds));
        }

        const urlsToClear = Array.from(
          new Set(
            [solicitacao.carteirinhaUrl, ...cardRows.map((row) => row.url)].filter(
              (value): value is string => Boolean(value && value.trim().length > 0)
            )
          )
        );
        if (urlsToClear.length > 0) {
          await dbWrite
            .update(colaboradoras)
            .set({ carteirinhaUrl: null })
            .where(inArray(colaboradoras.carteirinhaUrl, urlsToClear));
        }

        const normalizedEmail = normalizeEmail(solicitacao.email);
        if (normalizedEmail) {
          await dbWrite
            .update(colaboradoras)
            .set({ carteirinhaUrl: null })
            .where(sql`LOWER(${colaboradoras.email}) = LOWER(${normalizedEmail})`);
        }
      }

      const wasAlreadyApproved = solicitacao.status === 'aprovada';
      const shouldSyncApprovedRecords = status === 'aprovada' || (wasAlreadyApproved && isFotoUpload);

      if (shouldSyncApprovedRecords && solicitacao.tipo === 'empreendedora') {
        const negocio = solicitacao.nome?.trim() || '';
        const nomeEmpreendedora = extractMensagemValue(solicitacao.mensagem, ['Empreendedora']);
        const categoriaEmpreendedora = extractMensagemValue(solicitacao.mensagem, ['Categoria']);
        const fraseEmpreendedora = extractMensagemValue(solicitacao.mensagem, ['A Essência (Frase de impacto)']);
        const logoEmpreendedora = await resolveAssetUrl(extractMensagemValue(solicitacao.mensagem, ['Logo']));

        if (negocio) {
          const empFilters: any[] = [sql`LOWER(${empreendedoras.name}) = LOWER(${negocio})`];
          if (nomeEmpreendedora) {
            empFilters.push(sql`LOWER(${empreendedoras.feitoPor}) = LOWER(${nomeEmpreendedora})`);
          }

          const whereEmp = empFilters.length === 1 ? empFilters[0] : and(...empFilters);
          const [existingEmpreendedora] = await db
            .select({ id: empreendedoras.id })
            .from(empreendedoras)
            .where(whereEmp);

          const payload = {
            name: negocio,
            feitoPor: nomeEmpreendedora || null,
            frase: fraseEmpreendedora || null,
            categoria: categoriaEmpreendedora || null,
            instagram: solicitacao.instagram || null,
            logoUrl: logoEmpreendedora || effectiveSolicitacaoFotoUrl || null,
            website: solicitacao.site || null,
            bio: null,
          };

          if (existingEmpreendedora?.id) {
            await dbWrite
              .update(empreendedoras)
              .set(payload)
              .where(eq(empreendedoras.id, existingEmpreendedora.id));
          } else {
            await dbWrite.insert(empreendedoras).values(payload);
          }
        }
      }

      if (shouldSyncApprovedRecords && solicitacao.tipo === 'escritora') {
        await upsertEscritoraFromSolicitacao(solicitacao, effectiveSolicitacaoFotoUrl);
      }

      if (shouldSyncApprovedRecords && solicitacao.tipo === 'parceria') {
        const nomeEditora = extractMensagemValue(solicitacao.mensagem, ['Nome da Editora']);
        const descricaoParceria = extractMensagemValue(solicitacao.mensagem, ['Descrição']);
        const linkParceria = extractMensagemValue(solicitacao.mensagem, ['Link / Instagram']);
        const logoParceria = await resolveAssetUrl(extractMensagemValue(solicitacao.mensagem, ['Logo']));
        const nomeParceria = nomeEditora || solicitacao.nome?.trim() || '';

        if (nomeParceria) {
          const [existingParceria] = await db
            .select({ id: parcerias.id })
            .from(parcerias)
            .where(sql`LOWER(${parcerias.name}) = LOWER(${nomeParceria})`);

          const payload = {
            name: nomeParceria,
            link: solicitacao.site || linkParceria || null,
            description: descricaoParceria || null,
            imagem: logoParceria || effectiveSolicitacaoFotoUrl || null,
          };

          if (existingParceria?.id) {
            await dbWrite
              .update(parcerias)
              .set(payload)
              .where(eq(parcerias.id, existingParceria.id));
          } else {
            await dbWrite.insert(parcerias).values(payload);
          }
        }
      }

      if (isCardUpload) {
        const cardUrl = carteirinhaUrl.trim();
        const normalizedUserEmail = normalizeEmail(solicitacao.email);
        let colaboradoraId: string | null = null;

        if (normalizedUserEmail) {
          const [existingUser] = await db.select().from(colaboradoras).where(sql`LOWER(${colaboradoras.email}) = LOWER(${normalizedUserEmail})`);
          colaboradoraId = existingUser?.id ?? null;
          if (colaboradoraId) {
            await dbWrite.update(colaboradoras).set({ carteirinhaUrl: cardUrl }).where(eq(colaboradoras.id, colaboradoraId));
          }
        }

        await dbWrite.update(solicitacoes).set({ carteirinhaUrl: cardUrl }).where(eq(solicitacoes.id, id));

        await dbWrite.insert(carteirinhas).values({
          solicitacaoId: id,
          colaboradoraId,
          url: cardUrl,
        });
      }
    } catch (err) {
      if (isWriteBlockedError(err)) {
        return NextResponse.json({ error: 'Não é possível atualizar solicitações: banco em modo somente leitura' }, { status: 503 });
      }
      throw err;
    }

    const emailStatus: { adminAction: boolean; user: boolean; hasKey: boolean; errors: string[] } = { adminAction: true, user: false, hasKey: !!(process.env.BREVO_API_KEY ?? process.env.RESEND_API_KEY), errors: [] };
    const apiKey = process.env.BREVO_API_KEY ?? process.env.RESEND_API_KEY;

    if (isResend) {
      if (!solicitacao.carteirinhaUrl) {
        return NextResponse.json({ error: 'Não há carteirinha cadastrada para reenviar.' }, { status: 400 });
      }

      if (!apiKey) {
        console.warn('BREVO_API_KEY não configurada. E-mail de reenviar não será enviado.');
        emailStatus.errors.push('BREVO_API_KEY não configurada');
      } else {
        try {
          const { sendEmail } = await import('@/lib/email-client');
          const { cartaCarteirinhaDisponivel } = await import('@/lib/email-templates');
          const normalizedUserEmail = normalizeEmail(solicitacao.email);
          if (!normalizedUserEmail) {
            emailStatus.errors.push('E-mail inválido para reenvio.');
          } else {
            await sendEmail({
              from: getFromAddress(),
              to: normalizedUserEmail,
              subject: 'Sua carteirinha já está disponível – Clube das Leitoras',
              html: cartaCarteirinhaDisponivel({
                nome: solicitacao.nome,
                cartaUrl: solicitacao.carteirinhaUrl,
                siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://clubedasleitoras.com.br',
              }),
            });
            emailStatus.user = true;
            console.log('✅ E-mail de carteirinha reenviado para:', normalizedUserEmail);
          }
        } catch (err: any) {
          const errorMessage = err && err instanceof Error ? err.message : String(err);
          console.error('❌ Erro ao reenviar e-mail da carteirinha:', err);
          if (err?.status === 403 || /403/.test(errorMessage)) {
            emailStatus.errors.push('user:403 - Brevo não autorizado. Verifique remetente/destinatário e token.');
          } else {
            emailStatus.errors.push(errorMessage);
          }
        }
      }

      (emailStatus as any).sent = !!emailStatus.user;
      return NextResponse.json({ success: true, emailStatus }, { status: 200 });
    }

    if (status === 'aprovada') {
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

    if (typeof carteirinhaUrl === 'string' && carteirinhaUrl.trim().length > 0) {
      const normalizedUserEmail = normalizeEmail(solicitacao.email);
      if (!apiKey) {
        console.warn('BREVO_API_KEY não configurada. E-mail da carteirinha não será enviado.');
        emailStatus.errors.push('BREVO_API_KEY não configurada');
      } else if (!normalizedUserEmail) {
        emailStatus.errors.push('E-mail inválido para envio de carteirinha.');
      } else {
        try {
          const { sendEmail } = await import('@/lib/email-client');
          const { cartaCarteirinhaDisponivel } = await import('@/lib/email-templates');
          const cardUrl = carteirinhaUrl.trim();
          const [existingUser] = await db.select().from(colaboradoras).where(sql`LOWER(${colaboradoras.email}) = LOWER(${normalizedUserEmail})`);
          const colaboradoraId = existingUser?.id ?? null;

          await dbWrite.insert(carteirinhas).values({
            solicitacaoId: solicitacao.id,
            colaboradoraId,
            url: cardUrl,
          });

          if (colaboradoraId) {
            await dbWrite.update(colaboradoras).set({ carteirinhaUrl: cardUrl }).where(eq(colaboradoras.id, colaboradoraId));
          }

          await sendEmail({
            from: getFromAddress(),
            to: normalizedUserEmail,
            subject: 'Sua carteirinha já está disponível – Clube das Leitoras',
            html: cartaCarteirinhaDisponivel({
              nome: solicitacao.nome,
              cartaUrl: cardUrl,
              siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://clubedasleitoras.com.br',
            }),
          });
          emailStatus.user = true;
          console.log('✅ E-mail com carteirinha enviado para:', normalizedUserEmail);
        } catch (err: any) {
          const errorMessage = err && err instanceof Error ? err.message : String(err);
          console.error('❌ Erro ao enviar e-mail da carteirinha:', err);
          if (err?.status === 403 || /403/.test(errorMessage)) {
            emailStatus.errors.push('user:403 - Brevo não autorizado. Verifique remitente/destinatário e token.');
          } else {
            emailStatus.errors.push(errorMessage);
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

export async function DELETE(request: Request) {
  try {
    await requireSolicitacoesAdmin(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID da solicitação é obrigatório' }, { status: 400 });
    }

    const [solicitacao] = await db.select().from(solicitacoes).where(eq(solicitacoes.id, id));
    if (!solicitacao) {
      return NextResponse.json({ error: 'Solicitação não encontrada' }, { status: 404 });
    }

    try {
      if (solicitacao.tipo === 'carteirinha') {
        const cardRows = await db
          .select({
            url: carteirinhas.url,
            colaboradoraId: carteirinhas.colaboradoraId,
          })
          .from(carteirinhas)
          .where(eq(carteirinhas.solicitacaoId, id));

        await dbWrite.delete(carteirinhas).where(eq(carteirinhas.solicitacaoId, id));

        const collaboratorIds = Array.from(
          new Set(cardRows.map((row) => row.colaboradoraId).filter((value): value is string => Boolean(value)))
        );
        if (collaboratorIds.length > 0) {
          await dbWrite
            .update(colaboradoras)
            .set({ carteirinhaUrl: null })
            .where(inArray(colaboradoras.id, collaboratorIds));
        }

        const urlsToClear = Array.from(
          new Set(
            [solicitacao.carteirinhaUrl, ...cardRows.map((row) => row.url)].filter(
              (value): value is string => Boolean(value && value.trim().length > 0)
            )
          )
        );
        if (urlsToClear.length > 0) {
          await dbWrite
            .update(colaboradoras)
            .set({ carteirinhaUrl: null })
            .where(inArray(colaboradoras.carteirinhaUrl, urlsToClear));
        }

        const normalizedEmail = normalizeEmail(solicitacao.email);
        if (normalizedEmail) {
          await dbWrite
            .update(colaboradoras)
            .set({ carteirinhaUrl: null })
            .where(sql`LOWER(${colaboradoras.email}) = LOWER(${normalizedEmail})`);
        }

        const includeApprovedAt = await hasApprovedAtColumn();
        if (includeApprovedAt) {
          await dbWrite
            .update(solicitacoes)
            .set({ status: 'excluida', carteirinhaUrl: null, approvedAt: null })
            .where(eq(solicitacoes.id, id));
        } else {
          await dbWrite
            .update(solicitacoes)
            .set({ status: 'excluida', carteirinhaUrl: null })
            .where(eq(solicitacoes.id, id));
        }

        return NextResponse.json({ success: true, movedToExcluida: true }, { status: 200 });
      }

      await dbWrite.delete(solicitacoes).where(eq(solicitacoes.id, id));
    } catch (err) {
      if (isWriteBlockedError(err)) {
        return NextResponse.json({ error: 'Não é possível excluir solicitações: banco em modo somente leitura' }, { status: 503 });
      }
      throw err;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Erro ao excluir solicitação:', error);
    const message = error instanceof Error ? error.message : 'Erro ao excluir solicitação';
    const statusCode = message === 'Não autorizado' ? 401 : message === 'Permissão insuficiente' ? 403 : 500;
    return NextResponse.json({ error: statusCode >= 500 ? 'Erro ao excluir solicitação' : message }, { status: statusCode });
  }
}