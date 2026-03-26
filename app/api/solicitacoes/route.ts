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
    const email = body.email?.toLowerCase().trim();
    const telefone = (body.telefone || body.phone)?.trim() || 'Não informado';
    
    const mensagemExtra = body.enderecoCompleto 
      ? `Endereço: ${body.enderecoCompleto} | Clube: ${body.tempoClube}`
      : body.mensagem || 'Sem mensagem';

    if (!nome || !email) {
      return NextResponse.json({ error: 'Nome e e-mail são obrigatórios' }, { status: 400 });
    }

    // 1. Salva no Banco de Dados (Corrigido o erro de sintaxe aqui)
    const [created] = await db.insert(solicitacoes).values({
      tipo,
      nome,
      email,
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

        const { error: resendError } = await resend.emails.send({
          from: FROM,
          to: ADMIN_EMAIL,
          subject: `✨ Nova Solicitação: ${nome} (${tipo})`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333; border: 1px solid #eee;">
              <h2 style="color: #B04D4A;">Olá, Curadoria!</h2>
              <p>Uma nova solicitação de cadastro chegou no portal.</p>
              <hr />
              <p><strong>Nome:</strong> ${nome}</p>
              <p><strong>E-mail:</strong> ${email}</p>
              <p><strong>Telefone:</strong> ${telefone}</p>
              <p><strong>Tipo:</strong> ${tipo.toUpperCase()}</p>
              <p><strong>Detalhes:</strong> ${mensagemExtra}</p>
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

    if (status === 'aprovada' && process.env.RESEND_API_KEY) {
      const randomPassword = `clube-${Math.random().toString(36).slice(2, 10)}`;
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      const [existing] = await db.select().from(colaboradoras).where(eq(colaboradoras.email, solicitacao.email));
      if (!existing) {
        await db.insert(colaboradoras).values({
          email: solicitacao.email,
          name: solicitacao.nome,
          password: hashedPassword,
          role: solicitacao.tipo === 'leitora' ? 'convidada' : 'colaboradora',
          active: true,
          status: 'ativa',
          mustChangePassword: true,
        });
      }

      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: FROM,
        to: solicitacao.email,
        subject: 'Seu acesso ao Clube foi liberado! ✨',
        html: `<p>Bem-vinda, ${solicitacao.nome}! Sua senha temporária é: <b>${randomPassword}</b></p>`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao processar' }, { status: 500 });
  }
}