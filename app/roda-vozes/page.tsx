import { db } from '@/lib/db';
import { livroDoMes as livroDoMesTable } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import RodaVozesClient from './RodaVozesClient';

export const dynamic = 'force-dynamic';

const MESES_NUM: Record<string, number> = {
  janeiro: 1, fevereiro: 2, março: 3, abril: 4,
  maio: 5, junho: 6, julho: 7, agosto: 8,
  setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
};

function mesNum(r: { num?: number | null, mes?: string | null }): number {
  if (r.num) return r.num;
  return MESES_NUM[r.mes?.toLowerCase?.() ?? ''] ?? 0;
}

export default async function RodaDeVozesPage() {
  const anoAtual = new Date().getFullYear();
  const mesAtual = new Date().getMonth() + 1;

  const livros = await db
    .select()
    .from(livroDoMesTable)
    .orderBy(desc(livroDoMesTable.ano), desc(livroDoMesTable.num));

  const mesAtualNome = new Date().toLocaleString('pt-BR', { month: 'long' });
  const doAnoAtual = livros.filter(r => r.ano === anoAtual).sort((a, b) => mesNum(a) - mesNum(b));
  
  let ativoInicial =
    doAnoAtual.find(r => r.mes?.toLowerCase() === mesAtualNome.toLowerCase()) || null;

  if (!ativoInicial) {
    if (doAnoAtual.length > 0) {
      const nextFuture = doAnoAtual.find(r => mesNum(r) > mesAtual);
      ativoInicial = nextFuture || doAnoAtual.slice().reverse()[0];
    } else {
      ativoInicial = livros[0] || null;
    }
  }

  const activeBook = ativoInicial ? {
    livro: ativoInicial.livro,
    autora: ativoInicial.autora,
    foto: ativoInicial.foto,
    mes: ativoInicial.mes,
    ano: ativoInicial.ano
  } : null;

  return <RodaVozesClient activeBook={activeBook} />;
}
