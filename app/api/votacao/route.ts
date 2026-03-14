import { NextResponse } from 'next/server';
import { requireAdminOrColaboradora } from '@/lib/auth';
import { db } from '@/lib/db';
import { livros, votacoes, votacaoConfig, votacoesHistorico } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { notificarLeitoras } from '@/lib/notificacao-email';

export const dynamic = 'force-dynamic';

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
    console.error('Erro GET /api/votacao:', err);
    return NextResponse.json({ error: 'Erro ao buscar votacao' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { opcaoId, voterKey } = body;

    if (!opcaoId || !voterKey) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    const jaVotou = await db.select().from(votacoes).where(eq(votacoes.usuario_email, voterKey));
    if (jaVotou.length > 0) {
      return NextResponse.json({ error: 'Você já votou nesta rodada.' }, { status: 409 });
    }

    const [livro] = await db.select().from(livros).where(eq(livros.id, opcaoId));
    if (!livro) return NextResponse.json({ error: 'Livro não encontrado' }, { status: 404 });

    await db.insert(votacoes).values({ livro_id: opcaoId, usuario_email: voterKey });

    const countVotos = await db.select().from(votacoes).where(eq(votacoes.livro_id, opcaoId));
    return NextResponse.json({ success: true, votos: countVotos.length }, { status: 200 });
  } catch (err) {
    console.error('Erro POST /api/votacao:', err);
    return NextResponse.json({ error: 'Erro ao registrar voto' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    try { await requireAdminOrColaboradora(); } catch {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();

    if (body.encerrar) {
      const allLivros = await db.select().from(livros);
      const allVotacoes = await db.select().from(votacoes);

      if (allLivros.length > 0 && allVotacoes.length > 0) {
        const votosPorLivro = new Map<string, number>();
        allVotacoes.forEach(v => {
          votosPorLivro.set(v.livro_id, (votosPorLivro.get(v.livro_id) || 0) + 1);
        });

        const sorted = allLivros
          .map(l => ({ ...l, votos: votosPorLivro.get(l.id) || 0 }))
          .sort((a, b) => b.votos - a.votos);

        const vencedor = sorted[0];
        const totalVotos = allVotacoes.length;
        const porcentagem = vencedor ? Math.round((vencedor.votos / totalVotos) * 100) : 0;
        const periodo = body.periodo || new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

        await db.insert(votacoesHistorico).values({
          periodo,
          vencedorTitulo: vencedor?.titulo || '',
          vencedorAutor: vencedor?.autor || '',
          vencedorVotos: vencedor?.votos || 0,
          totalVotos,
          porcentagem,
        });
      }

      await db.delete(votacoes);

      const existing = await db.select().from(votacaoConfig).limit(1);
      if (existing.length > 0) {
        await db.update(votacaoConfig).set({ ativa: false });
      } else {
        await db.insert(votacaoConfig).values({ ativa: false, prazo: '' });
      }

      return NextResponse.json({ success: true }, { status: 200 });
    }

    const ativa = Boolean(body.ativa);
    const prazo = body.prazo ?? '';

    const existing = await db.select().from(votacaoConfig).limit(1);
    if (existing.length > 0) {
      await db.update(votacaoConfig).set({ ativa, prazo });
    } else {
      await db.insert(votacaoConfig).values({ ativa, prazo });
    }

    if (ativa) {
      notificarLeitoras({
        secao: 'votacao',
        tituloConteudo: prazo ? `Votação aberta — prazo: ${prazo}` : 'Votação aberta!',
        descricaoConteudo: 'Acesse o clube e vote no livro que você quer ler no próximo mês.',
      }).catch(console.error);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Erro PATCH /api/votacao:', err);
    return NextResponse.json({ error: 'Erro ao atualizar votação' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    try { await requireAdminOrColaboradora(); } catch {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

    await db.delete(votacoes).where(eq(votacoes.id, id));
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Erro DELETE /api/votacao:', err);
    return NextResponse.json({ error: 'Erro ao deletar voto' }, { status: 500 });
  }
}
