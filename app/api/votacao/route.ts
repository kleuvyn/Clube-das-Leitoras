import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db, dbWrite } from '@/lib/db';
import { livros, votacoes, votacaoConfig, votacoesHistorico } from '@/lib/db/schema';
import { eq, desc, and, sql, inArray } from 'drizzle-orm';
import { notificarLeitoras } from '@/lib/notificacao-email';

export const dynamic = 'force-dynamic';

// --- BUSCAR DADOS (URNA + HISTÓRICO) ---
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hasPagination = searchParams.has('page') || searchParams.has('limit');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = hasPagination
      ? Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
      : 1000;
    const offset = hasPagination ? (page - 1) * limit : 0;

    const cfgRows = await db.select().from(votacaoConfig).orderBy(desc(votacaoConfig.createdAt)).limit(1);
    const cfg = cfgRows[0] ?? null;
    const config = {
      ativa: Boolean(cfg?.ativa ?? false),
      prazo: cfg?.prazo ?? '',
      permitirSugestoes: Boolean(cfg?.permitirSugestoes ?? true),
    };

    const [allLivros, countResult] = await Promise.all([
      db.select().from(livros)
        .where(eq(livros.tipo, 'candidato'))
        .orderBy(desc(livros.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`cast(count(*) as integer)` })
        .from(livros)
        .where(eq(livros.tipo, 'candidato')),
    ]);
      
    const livroIds = allLivros.map((l) => l.id);
    const votosAgrupados = livroIds.length > 0
      ? await db
          .select({
            livroId: votacoes.livro_id,
            total: sql<number>`cast(count(*) as integer)`,
          })
          .from(votacoes)
          .where(inArray(votacoes.livro_id, livroIds))
          .groupBy(votacoes.livro_id)
      : [];

    const votosPorLivro = new Map<string, number>();
    votosAgrupados.forEach((v) => {
      votosPorLivro.set(v.livroId, v.total || 0);
    });

    const total = countResult[0]?.count || 0;
    const pages = Math.ceil(total / limit);

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

    if (!hasPagination) {
      return NextResponse.json({
        ...config,
        livros: livrosComVotos,
        historico,
      }, { status: 200 });
    }

    return NextResponse.json({
      ...config,
      livros: livrosComVotos,
      historico,
      pagination: { page, limit, total, pages, hasMore: page < pages }
    }, { status: 200 });
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
    await dbWrite.insert(votacoes).values({
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
        await dbWrite.insert(votacoesHistorico).values({
          vencedorTitulo: vencedor.titulo,
          vencedorAutor: vencedor.autor,
          vencedorVotos: vencedor.votos,
          totalVotos: allVotacoes.length,
          porcentagem: allVotacoes.length > 0 ? Math.round((vencedor.votos / allVotacoes.length) * 100) : 0,
          periodo: body.periodo || 'Mês Atual',
        });

        for (const livro of allLivros) {
          await dbWrite.update(livros).set({ tipo: 'arquivado' }).where(eq(livros.id, livro.id));
        }
      }

      await dbWrite.delete(votacoes);
      await dbWrite.update(votacaoConfig).set({ ativa: false });
      return NextResponse.json({ success: true });
    }

    if (body.novaVotacao) {
      await dbWrite.delete(votacoes);
      await dbWrite.update(livros).set({ tipo: 'arquivado' }).where(eq(livros.tipo, 'candidato'));
      await dbWrite.update(votacaoConfig).set({ ativa: true, prazo: '' });
      return NextResponse.json({ success: true });
    }

    const ativa = body.ativa !== undefined ? Boolean(body.ativa) : undefined;
    const prazo = body.prazo;
    const permitirSugestoes = body.permitirSugestoes !== undefined ? Boolean(body.permitirSugestoes) : undefined;
    
    await dbWrite.update(votacaoConfig).set({ 
      ...(ativa !== undefined && { ativa }),
      ...(prazo !== undefined && { prazo }),
      ...(permitirSugestoes !== undefined && { permitirSugestoes }),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 });
  }
}