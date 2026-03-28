import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { solicitacoes, colaboradoras } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// No Resend, use exatamente este FROM se ainda não validou o domínio
const FROM = 'Clube das Leitoras <onboarding@resend.dev>'; 
const ADMIN_EMAIL = 'clubedasleitorasbsb@gmail.com'; 

export async function GET() {
  try {
    await requireAdmin();
    const rows = await db.select().from(solicitacoes).orderBy(desc(solicitacoes.createdAt));
    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
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

    // 1. Salva no Banco de Dados (Corrigido o erro de sintaxe aqui)
    const [created] = await db.insert(solicitacoes).values({
      tipo,
      nome,
      email: paraBancoEmail,
      telefone,
      status: 'pendente',
      mensagem: mensagemExtra,
      instagram: body.instagram || null,
      site: body.site || null,
    }).returning();

    // 2. Envio de e-mail para a ADMIN
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

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

        const { error: resendError } = await resend.emails.send({
          from: FROM,
          to: ADMIN_EMAIL,
          subject: `✨ Nova Solicitação: ${nome} (${tipo})`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333; border: 1px solid #eee;">
              <h2 style="color: #B04D4A;">Olá, Curadoria!</h2>
              <p>Uma nova solicitação de cadastro chegou no portal.</p>
              <hr />
              <p><strong>Tipo:</strong> ${tipo.toUpperCase()}</p>
              <p><strong>Data do pedido:</strong> ${requestDate}</p>
              ${isLeitora ? leitoraFields : ''}
              ${isParceria ? parceriaFields : ''}
              ${isEmpreendedora ? empreendedoraFields : ''}
              ${isEscritora ? escritoraFields : ''}
              ${capaHtml}
              ${body.capaUrl ? `<div style="margin-top:12px"><p><strong>Visualização da capa:</strong></p><img src="${body.capaUrl}" alt="Capa do livro" style="max-width:360px;max-height:480px;display:block;border:1px solid #ddd;border-radius:8px;" /></div>` : ''}
              <p><strong>Observações:</strong> ${mensagemExtra || 'Sem mensagem'}</p>
              <hr />
              <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin" style="background: #B04D4A; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver no Painel</a></p>
            </div>
          `,
        });

        if (resendError) {
          console.error('❌ Erro retornado pelo Resend:', resendError);
        } else {
          console.log('✅ E-mail de notificação enviado para admin!');
        }

        const userEmail = rawEmail && rawEmail !== 'nao-informado@clube.com' ? rawEmail : null;
        if (userEmail) {
          try {
            const confirmation = await resend.emails.send({
              from: FROM,
              to: userEmail,
              subject: 'Sua inscrição está em análise - Clube das Leitoras',
              html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333; border: 1px solid #eee;">
                  <h2 style="color: #B04D4A;">Olá, ${nome}!</h2>
                  <p>Recebemos sua solicitação de cadastro para <strong>${tipo}</strong> e ela já está em análise.</p>
                  <p>Em breve a equipe de curadoria entrará em contato com você.</p>
                  <p><strong>Data do pedido:</strong> ${requestDate}</p>
                  <p><strong>Resumo:</strong></p>
                  <ul>
                    <li>Nome: ${nome}</li>
                    <li>Tipo: ${tipo.toUpperCase()}</li>
                    <li>E-mail: ${userEmail}</li>
                    <li>Telefone: ${telefone || 'Não informado'}</li>
                  </ul>
                  <p>Obrigado por fazer parte do Clube das Leitoras.</p>
                </div>
              `,
            });
            if (confirmation.error) {
              console.error('❌ Falha ao enviar confirmação para usuário:', confirmation.error);
            } else {
              console.log('✅ E-mail de confirmação enviado para o usuário!');
            }
          } catch (err) {
            console.error('❌ Erro ao enviar e-mail de confirmação para usuário:', err);
          }
        }

      } catch (err) {
        console.error('❌ Falha no processo de e-mail:', err);
      }
    }

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error('❌ Erro geral no POST:', error);
    return NextResponse.json({ error: 'Erro ao salvar solicitação' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { id, status } = body;

    const [solicitacao] = await db.select().from(solicitacoes).where(eq(solicitacoes.id, id));
    if (!solicitacao) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

    await db.update(solicitacoes).set({ status }).where(eq(solicitacoes.id, id));

    const emailStatus: { sent: boolean; error: string | null; hasKey: boolean } = { sent: false, error: null, hasKey: !!process.env.RESEND_API_KEY };
    if (status === 'aprovada') {
      if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY não configurada. E-mail de aprovação não será enviado.');
      } else {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

        if (solicitacao.tipo === 'leitora') {
          try {
            const [existingUser] = await db.select().from(colaboradoras).where(eq(colaboradoras.email, solicitacao.email));

            let plainPassword = '';
            if (!existingUser) {
              plainPassword = `clube-${Math.random().toString(36).slice(2, 10)}`;
              const hashedPassword = await bcrypt.hash(plainPassword, 10);
              await db.insert(colaboradoras).values({
                email: solicitacao.email,
                password: hashedPassword,
                name: solicitacao.nome,
                phone: solicitacao.telefone || null,
                role: 'convidada',
                mustChangePassword: true,
                active: true,
                tempoClube: solicitacao.mensagem?.match(/Há quanto tempo está no clube: (.*)/)?.[1] ?? null,
                enderecoCompleto: solicitacao.enderecoCompleto || null,
              });
            }

            await resend.emails.send({
              from: FROM,
              to: solicitacao.email,
              subject: 'Seja bem-vinda ao Clube das Leitoras',
              html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333; border: 1px solid #eee;">
                  <h2 style="color: #B04D4A;">Seja bem-vinda, ${solicitacao.nome}!</h2>
                  <p>É uma alegria ter você conosco. Sua solicitação foi aprovada pela curadoria.</p>
                  <h3>Seu Acesso:</h3>
                  <ul>
                    <li><strong>E-mail:</strong> ${solicitacao.email}</li>
                    <li><strong>Senha temporária:</strong> ${plainPassword || 'Sua conta já existia, use sua senha atual'}</li>
                  </ul>
                  <p>Use os dados acima para entrar no sistema, depois altere sua senha em <a href="${process.env.NEXT_PUBLIC_SITE_URL}/nova-senha" target="_blank">/nova-senha</a>.</p>
                  <p>Se precisar de ajuda, responda este e-mail ou entre em contato com a curadoria.</p>
                </div>
              `,
            });
            emailStatus.sent = true;
          } catch (err) {
            console.error('❌ Erro ao criar conta de leitora ou enviar e-mail:', err);
            emailStatus.error = err instanceof Error ? err.message : String(err);
          }
        } else {
          await resend.emails.send({
            from: FROM,
            to: solicitacao.email,
            subject: 'Sua solicitação foi aprovada – Clube das Leitoras',
            html: `
              <div style="font-family: sans-serif; padding: 20px; color: #333; border: 1px solid #eee;">
                <h2 style="color: #B04D4A;">Olá, ${solicitacao.nome}!</h2>
                <p>Sua solicitação para <strong>${solicitacao.tipo}</strong> foi aprovada pela curadoria.</p>
                <p>Em breve sua publicação será visualizada no site do Clube das Leitoras.</p>
                <p>Acesse: <a href="${process.env.NEXT_PUBLIC_SITE_URL}" target="_blank">${process.env.NEXT_PUBLIC_SITE_URL}</a></p>
              </div>
            `,
          });
          emailStatus.sent = true;
        }
      }
    }

    return NextResponse.json({ success: true, emailStatus }, { status: 200 });
  } catch (e) {
    const details = e instanceof Error ? e.message : (typeof e === 'object' && e !== null ? JSON.stringify(e, Object.getOwnPropertyNames(e), 2) : String(e));
    console.error('Erro ao processar aprovação:', e, details);
    return NextResponse.json({ error: 'Erro ao processar', details }, { status: 500 });
  }
}