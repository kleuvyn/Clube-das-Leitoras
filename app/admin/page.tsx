'use client';

import Link from 'next/link';
import { BookOpen, ChevronRight, Trophy, CheckCircle2, Clock, BarChart3, BookMarked } from 'lucide-react';
import { useAdmin } from '@/lib/admin-context';
import { useEffect, useState } from 'react';

const laranjaFolha = "var(--page-color)";

interface LivroCandidato { id: string; titulo: string; autor: string; votos: number; }
interface LivroMes { id: string; livro: string | null; autora: string | null; mes: string | null; ano: number | null; confirmado: boolean | null; tag: string | null; }

export default function AdminPage() {
  const { currentUser } = useAdmin();
  const [candidatos, setCandidatos] = useState<LivroCandidato[]>([]);
  const [totalVotos, setTotalVotos] = useState(0);
  const [livrosMes, setLivrosMes] = useState<LivroMes[]>([]);
  const [totalLeitoras, setTotalLeitoras] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/votacao').then(r => r.json()).then(d => {
      const livros: LivroCandidato[] = Array.isArray(d.livros) ? d.livros : [];
      setCandidatos(livros);
      setTotalVotos(livros.reduce((acc, l) => acc + l.votos, 0));
    }).catch(() => {});

    fetch('/api/livro-do-mes').then(r => r.json()).then(d => {
      setLivrosMes(Array.isArray(d) ? d : []);
    }).catch(() => {});

    fetch('/api/colaboradores').then(r => r.json()).then(d => {
      setTotalLeitoras(Array.isArray(d) ? d.length : null);
    }).catch(() => {});
  }, []);

  const tagCounts = livrosMes.reduce<Record<string, number>>((acc, l) => {
    const tag = l.tag || 'Sem categoria';
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {});
  const tags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
  const maxTag = tags[0]?.[1] || 1;

  const now = new Date();
  const currentYear = now.getFullYear();
  const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const currentMonthName = MESES[now.getMonth()];

  return (
    <div className="p-8 max-w-5xl mx-auto w-full space-y-6">

      {/* Header */}
      <div className="bg-white rounded-[3rem] border border-orange-50 p-10 text-center shadow-sm">
        <h3 className="font-serif text-4xl italic text-slate-800 mb-2">
          Bem-vinda, <span style={{ color: laranjaFolha }} className="not-italic font-normal">{currentUser?.name?.split(' ')[0] || 'Gabi'}</span>
        </h3>
        <p className="text-slate-400 italic">O que vamos semear no clube hoje?</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Tipos de livros lidos */}
        <div className="bg-white rounded-[2.5rem] border border-orange-50 p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-2">
            <BookMarked size={14} className="text-slate-300" />
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-slate-400">Tipos de Leitura</p>
          </div>

          {tags.length === 0 ? (
            <p className="text-center italic text-sm text-slate-300 py-8">Nenhuma leitura registrada.</p>
          ) : (
            <div className="space-y-3">
              {tags.map(([tag, count]) => {
                const pct = Math.round((count / maxTag) * 100);
                return (
                  <div key={tag} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm italic text-slate-600 truncate max-w-[70%]">{tag}</span>
                      <span className="text-xs text-slate-400 shrink-0">{count} livro{count !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                           style={{ width: `${pct}%`, backgroundColor: 'var(--page-color)', opacity: 0.7 }}/>
                    </div>
                  </div>
                );
              })}
              <p className="text-[10px] text-slate-300 italic pt-1">{livrosMes.length} título{livrosMes.length !== 1 ? 's' : ''} no acervo do clube</p>
            </div>
          )}

          {/* Mini stats */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-3">
            <div className="text-center">
              <p className="text-2xl font-light italic text-slate-700">{livrosMes.filter(l => l.confirmado).length}</p>
              <p className="text-[9px] font-mono uppercase tracking-widest text-slate-300">confirmados</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-light italic" style={{ color: laranjaFolha }}>{totalLeitoras ?? '—'}</p>
              <p className="text-[9px] font-mono uppercase tracking-widest text-slate-300">leitoras</p>
            </div>
          </div>
        </div>

        {/* Gráfico de votação */}
        <div className="bg-white rounded-[2.5rem] border border-orange-50 p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 size={14} className="text-slate-300" />
              <p className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-slate-400">Urna Literária</p>
            </div>
            <span className="text-[10px] italic text-slate-300">{totalVotos} voto{totalVotos !== 1 ? 's' : ''}</span>
          </div>

          {candidatos.length === 0 ? (
            <p className="text-center italic text-sm text-slate-300 py-8">Nenhum candidato ainda.</p>
          ) : (
            <div className="space-y-3">
              {candidatos.map((l, idx) => {
                const pct = totalVotos > 0 ? Math.round((l.votos / totalVotos) * 100) : 0;
                return (
                  <div key={l.id} className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {idx === 0 && totalVotos > 0 && <Trophy size={10} style={{ color: 'var(--page-color)' }} className="shrink-0"/>}
                        <span className="text-sm italic text-slate-700 truncate">{l.titulo}</span>
                      </div>
                      <span className="text-xs font-bold shrink-0" style={{ color: idx === 0 && totalVotos > 0 ? 'var(--page-color)' : '#94a3b8' }}>{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                           style={{ width: `${pct}%`, backgroundColor: idx === 0 ? 'var(--page-color)' : 'var(--page-color-60, #cc722299)' }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-2 border-t border-slate-100">
            <Link href="/admin/votacao" className="text-[9px] font-mono font-bold uppercase tracking-widest opacity-30 hover:opacity-70 transition-opacity flex items-center gap-1" style={{ color: 'var(--page-color)' }}>
              Gerenciar votação <ChevronRight size={9}/>
            </Link>
          </div>
        </div>

        {/* Estante do mês */}
        <div className="bg-white rounded-[2.5rem] border border-orange-50 p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-2">
            <BookOpen size={14} className="text-slate-300" />
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-slate-400">Estante do Clube</p>
          </div>

          {livrosMes.length === 0 ? (
            <p className="text-center italic text-sm text-slate-300 py-8">Nenhum livro cadastrado ainda.</p>
          ) : (
            <div className="space-y-4">
              {livrosMes.slice(0, 5).map((l) => (
                <div key={l.id} className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">
                    {l.confirmado
                      ? <CheckCircle2 size={13} className="text-emerald-500 opacity-70"/>
                      : <Clock size={13} className="text-slate-300"/>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm italic text-slate-700 truncate leading-snug">{l.livro}</p>
                    <p className="text-[10px] text-slate-400 truncate">{l.autora}{l.mes ? ` · ${l.mes}${l.ano ? `/${l.ano}` : ''}` : ''}</p>
                  </div>
                  {l.ano === currentYear && l.mes === currentMonthName && (
                    <span className="shrink-0 text-[8px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-orange-50 text-orange-400">
                      atual
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-slate-100">
            <Link href="/admin/livro-do-mes" className="text-[9px] font-mono font-bold uppercase tracking-widest opacity-30 hover:opacity-70 transition-opacity flex items-center gap-1" style={{ color: 'var(--page-color)' }}>
              Gerenciar acervo <ChevronRight size={9}/>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
