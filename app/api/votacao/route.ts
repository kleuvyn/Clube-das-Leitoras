import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { livros, votacoes, votacaoConfig, votacoesHistorico } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { notificarLeitoras } from '@/lib/notificacao-email';

export const dynamic = 'force-dynamic';

// --- BUSCAR DADOS (URNA + HISTÓRICO) ---
export async function GET() {
  try {
    const cfgRows = await db.select().from(votacaoConfig).orderBy(desc(votacaoConfig.createdAt)).limit(1);
    const cfg = cfgRows[0] ?? null;
    const config = { ativa: Boolean(cfg?.ativa ?? false), prazo: cfg?.prazo ?? '' };

    const allLivros = await db.select().from(livros)
      .where(eq(livros.tipo, 'candidato'))
      .orderBy(desc(livros.createdAt));
      
    const allVotacoes = await db.select().from(votacoes);

    const votosPorLivro = new Map<string, number>();
    allVotacoes.forEach(v => {
      votosPorLivro.set(v.livro_id, (votosPorLivro.get(v.livro_id) || 0) + 1);
    });

    const livrosComVotos = allLivros
      .map(l => ({
        id: l.id,
        titulo: l.titulo,
        autor: l.autor,
        capaUrl: l.capaUrl,
        indicadoPor: l.indicadoPor ?? null,
        linkCompra: l.linkCompra ?? null,
        votos: votosPorLivro.get(l.id) || 0,
      }))
      .sort((a, b) => b.votos - a.votos);

    const historico = await db
      .select()
      .from(votacoesHistorico)
      .orderBy(desc(votacoesHistorico.encerradoEm));

    return NextResponse.json({ ...config, livros: livrosComVotos, historico }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao buscar votação' }, { status: 500 });
  }
}

// --- REGISTRAR VOTO (O QUE ESTAVA FALTANDO) ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { opcaoId, voterKey } = body;

    if (!opcaoId || !voterKey) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    // 1. Verifica se a votação está aberta
    const cfg = await db.select().from(votacaoConfig).limit(1);
    if (!cfg[0]?.ativa) {
      return NextResponse.json({ error: 'A votação está encerrada.' }, { status: 403 });
    }

    // 2. Verifica se este usuário já votou nesta rodada
    const jaVotou = await db.select().from(votacoes).where(eq(votacoes.usuario_email, voterKey)).limit(1);
    if (jaVotou.length > 0) {
      return NextResponse.json({ error: 'Você já votou nesta rodada.' }, { status: 409 });
    }

    // 3. Registra o voto
    await db.insert(votacoes).values({
      livro_id: opcaoId,
      usuario_email: voterKey,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Erro no POST /api/votacao:', err);
    return NextResponse.json({ error: 'Erro ao registrar voto' }, { status: 500 });
  }
}

// --- ADMINISTRAÇÃO (ENCERRAR / REINICIAR) ---
export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();

    if (body.encerrar) {
      const allLivros = await db.select().from(livros).where(eq(livros.tipo, 'candidato'));
      const allVotacoes = await db.select().from(votacoes);
      
      const votosPorLivro = new Map();
      allVotacoes.forEach(v => {
        votosPorLivro.set(v.livro_id, (votosPorLivro.get(v.livro_id) || 0) + 1);
      });

      const ranking = allLivros
        .map(l => ({ ...l, votos: votosPorLivro.get(l.id) || 0 }))
        .sort((a, b) => b.votos - a.votos);

      const vencedor = ranking[0];

      if (vencedor) {
        await db.insert(votacoesHistorico).values({
          vencedorTitulo: vencedor.titulo,
          vencedorAutor: vencedor.autor,
          vencedorVotos: vencedor.votos,
          totalVotos: allVotacoes.length,
          porcentagem: allVotacoes.length > 0 ? Math.round((vencedor.votos / allVotacoes.length) * 100) : 0,
          periodo: body.periodo || 'Mês Atual',
        });

        for (const livro of allLivros) {
          await db.update(livros).set({ tipo: 'arquivado' }).where(eq(livros.id, livro.id));
        }
      }

      await db.delete(votacoes);
      await db.update(votacaoConfig).set({ ativa: false });
      return NextResponse.json({ success: true });
    }

    if (body.novaVotacao) {
      await db.delete(votacoes);
      await db.update(livros).set({ tipo: 'arquivado' }).where(eq(livros.tipo, 'candidato'));
      await db.update(votacaoConfig).set({ ativa: true, prazo: '' });
      return NextResponse.json({ success: true });
    }

    const ativa = body.ativa !== undefined ? Boolean(body.ativa) : undefined;
    const prazo = body.prazo;
    
    await db.update(votacaoConfig).set({ 
      ...(ativa !== undefined && { ativa }),
      ...(prazo !== undefined && { prazo })
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 });
  }
}