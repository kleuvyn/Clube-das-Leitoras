import { PenTool } from "lucide-react";
import { db } from '@/lib/db';
import { livroDoMes as livroDoMesTable } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import CalendarioClient, { type RodaLiteraria } from './CalendarioClient';

export const dynamic = 'force-static';
export const revalidate = 300;

const marromPapel = "#8C7A66";

const MESES_NUM: Record<string, number> = {
  janeiro: 1, fevereiro: 2, março: 3, abril: 4,
  maio: 5, junho: 6, julho: 7, agosto: 8,
  setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
};

function mesNum(r: RodaLiteraria): number {
  if (r.num) return r.num;
  return MESES_NUM[r.mes?.toLowerCase?.() ?? ''] ?? 0;
}

async function getLivrosDoMes(): Promise<RodaLiteraria[]> {
  const rows = await db
    .select({
      id: livroDoMesTable.id,
      mes: livroDoMesTable.mes,
      num: livroDoMesTable.num,
      ano: livroDoMesTable.ano,
      livro: livroDoMesTable.livro,
      autora: livroDoMesTable.autora,
      sinopse: livroDoMesTable.sinopse,
      tag: livroDoMesTable.tag,
      confirmado: livroDoMesTable.confirmado,
    })
    .from(livroDoMesTable)
    .orderBy(desc(livroDoMesTable.ano), desc(livroDoMesTable.num));

  return rows.map(r => ({
    id: r.id,
    mes: r.mes || '',
    num: r.num ?? null,
    ano: r.ano ?? null,
    livro: r.livro || '',
    autora: r.autora || '',
    foto: null, // As imagens pesadas (base64) serão carregadas sob demanda no ClientSide
    sinopse: r.sinopse || '',
    tag: r.tag || 'Leitura do Mês',
    confirmado: r.confirmado ?? false,
  }));
}

export default async function CalendarioJornal() {
  const anoAtual = new Date().getFullYear();
  const mesAtual = new Date().getMonth() + 1;

  const livros = await getLivrosDoMes();

  // Determina o livro ativo (mês atual ou mais recente)
  const mesAtualNome = new Date().toLocaleString('pt-BR', { month: 'long' });
  const doAnoAtual = livros.filter(r => r.ano === anoAtual).sort((a, b) => mesNum(a) - mesNum(b));
  let ativoInicial: RodaLiteraria | null =
    doAnoAtual.find(r => r.mes?.toLowerCase() === mesAtualNome.toLowerCase()) || null;

  if (!ativoInicial) {
    if (doAnoAtual.length > 0) {
      const nextFuture = doAnoAtual.find(r => mesNum(r) > mesAtual);
      ativoInicial = nextFuture || doAnoAtual.slice().reverse()[0];
    } else {
      ativoInicial = livros[0] || null;
    }
  }

  const anos = [...new Set(livros.map(r => r.ano ?? anoAtual))];

  return (
    <div
      className="min-h-screen font-alice pb-40 relative z-10"
      style={{ background: `#FDFCFB url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')` }}
    >
      <header className="max-w-6xl mx-auto pt-32 pb-16 px-6 text-center border-b border-black/5 relative z-10">
        <div className="flex items-center justify-center gap-4 mb-8 opacity-40">
          <div className="h-px w-10 bg-black" />
          <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-black italic">
            Diretório de Afeto • Planalto Central
          </span>
          <div className="h-px w-10 bg-black" />
        </div>
        <h1 className="text-7xl md:text-[100px] text-[#2C3E50] tracking-tighter leading-[0.8] mb-10">
          A Próxima{' '}
          <span style={{ color: marromPapel }} className="italic font-light">
            Página
          </span>
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto border-t border-black/10 pt-10">
          <p className="text-base leading-relaxed opacity-60 text-black italic">
            &ldquo;Um calendário de afeto, onde cada mês reserva uma nova história para nos
            transformar.&rdquo;
          </p>
          <div className="flex flex-col justify-end items-start md:items-end">
            <div
              className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-sans font-bold"
              style={{ color: marromPapel }}
            >
              <PenTool size={14} /> Calendário Literário {anoAtual}
            </div>
          </div>
        </div>
      </header>

      <CalendarioClient
        livros={livros}
        ativoInicial={ativoInicial}
        anosInicial={anos}
      />
    </div>
  );
}
