"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Quote, ArrowRight, Heart, MapPin, Calendar, PenTool, ChevronDown } from "lucide-react";

const marromPapel = "#8C7A66";

const MESES_NUM: Record<string, number> = {
  janeiro: 1, fevereiro: 2, março: 3, abril: 4,
  maio: 5, junho: 6, julho: 7, agosto: 8,
  setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
};

export interface RodaLiteraria {
  id: string;
  mes: string;
  num: number | null;
  ano: number | null;
  livro: string;
  autora: string;
  foto: string | null;
  sinopse: string;
  tag: string;
  confirmado: boolean;
}

function mesNum(r: RodaLiteraria): number {
  if (r.num) return r.num;
  return MESES_NUM[r.mes?.toLowerCase?.() ?? ''] ?? 0;
}

interface Props {
  livros: RodaLiteraria[];
  ativoInicial: RodaLiteraria | null;
  anosInicial: number[];
}

export default function CalendarioClient({ livros, ativoInicial, anosInicial }: Props) {
  const anoAtual = new Date().getFullYear();
  const mesAtual = new Date().getMonth() + 1;

  const [ativo, setAtivo] = useState<RodaLiteraria | null>(ativoInicial);
  const [anosExpandidos, setAnosExpandidos] = useState<Set<number>>(new Set(anosInicial));
  const [loadingFoto, setLoadingFoto] = useState(false);
  const [fotoAtual, setFotoAtual] = useState<string | null>(ativoInicial?.foto || null);

  React.useEffect(() => {
    if (ativo && !ativo.foto) {
      setLoadingFoto(true);
      fetch(`/api/livro-do-mes?id=${ativo.id}`)
        .then(r => r.json())
        .then(data => setFotoAtual(data?.foto || null))
        .catch(() => setFotoAtual(null))
        .finally(() => setLoadingFoto(false));
    } else {
      setFotoAtual(ativo?.foto || null);
    }
  }, [ativo]);

  function statusMes(r: RodaLiteraria): 'passado' | 'atual' | 'futuro' {
    const ano = r.ano ?? anoAtual;
    if (ano < anoAtual) return 'passado';
    if (ano > anoAtual) return 'futuro';
    const n = mesNum(r);
    if (n < mesAtual) return 'passado';
    if (n === mesAtual) return 'atual';
    return 'futuro';
  }

  function toggleAno(ano: number) {
    setAnosExpandidos(prev => {
      const next = new Set(prev);
      next.has(ano) ? next.delete(ano) : next.add(ano);
      return next;
    });
  }

  const anos = [...new Set(livros.map(r => r.ano ?? anoAtual))].sort((a, b) => b - a);
  const ativoAno = ativo?.ano ?? null;
  const isPastAtivo = ativoAno !== null && ativoAno < anoAtual;

  return (
    <main className="max-w-7xl mx-auto px-6 pt-24 relative z-10">
      {livros.length === 0 ? (
        <div className="text-center italic opacity-30 py-20">Nenhum livro cadastrado ainda.</div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-16 items-start">

          <aside className="lg:col-span-3 border-r border-black/5 pr-8 space-y-8">
            {anos.map(ano => {
              const doAno = livros.filter(r => (r.ano ?? anoAtual) === ano).sort((a, b) => mesNum(a) - mesNum(b));
              const isExpanded = anosExpandidos.has(ano);
              const isCurrentYear = ano === anoAtual;
              const isPast = ano < anoAtual;
              const isFuture = ano > anoAtual;

              return (
                <div key={ano}>
                  <button
                    onClick={() => toggleAno(ano)}
                    className="w-full flex items-center justify-between mb-4 group"
                  >
                    <div className="flex items-baseline gap-3">
                      <span
                        className="text-2xl font-bold tracking-tight"
                        style={{ color: isCurrentYear ? marromPapel : '#2C3E5080' }}
                      >
                        {ano}
                      </span>
                      <span className="text-[8px] uppercase tracking-widest font-bold" style={{ color: isCurrentYear ? marromPapel : '#2C3E5070' }}>
                        {isPast && '✓ Encerrado'}
                        {isCurrentYear && '· Em curso'}
                        {isFuture && '· Em breve'}
                      </span>
                    </div>
                    <ChevronDown
                      size={14}
                      className={`opacity-30 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="flex flex-col gap-5 pl-2 border-l border-black/5 ml-1">
                      {doAno.map(item => {
                        const status = statusMes(item);
                        const isAtivo = ativo?.id === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => setAtivo(item)}
                            className={`text-left transition-all duration-300 ${
                              isAtivo
                                ? 'opacity-100 translate-x-1'
                                : status === 'passado'
                                  ? 'opacity-25 hover:opacity-50'
                                  : 'opacity-40 hover:opacity-70'
                            }`}
                          >
                            <span className="flex items-center gap-1 text-[8px] uppercase font-bold tracking-widest text-black mb-0.5">
                              {item.mes}
                              {status === 'passado' && !isAtivo && <span className="opacity-40">✓</span>}
                              {status === 'atual' && !isAtivo && <span style={{ color: marromPapel }}>●</span>}
                            </span>
                            <span
                              className="text-base italic block leading-tight"
                              style={{ color: isAtivo ? marromPapel : 'black' }}
                            >
                              {item.livro}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-6 h-px bg-black/5" />
                </div>
              );
            })}
          </aside>

          {ativo && (
            <div className="lg:col-span-9 flow-root space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <article className="space-y-16 flow-root">
                <div className="space-y-4 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                    <span className="text-[9px] font-bold uppercase tracking-[0.4em] px-3 py-1 border border-black/10 rounded-full" style={{ color: marromPapel }}>
                      {ativo.tag}
                    </span>
                    {ativo.ano && (
                      <span className="text-[9px] font-bold uppercase tracking-[0.4em] px-3 py-1 border border-black/20 rounded-full text-slate-500">
                        {ativo.mes} {ativo.ano}
                      </span>
                    )}
                  </div>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl text-[#2C3E50] tracking-tighter leading-tight font-medium text-balance">
                    {ativo.livro}
                  </h2>
                  <p className="text-xl italic opacity-40 text-black">Por {ativo.autora}</p>
                </div>

                <div className="w-full relative flow-root">
                  <div className="relative group w-full max-w-[280px] md:max-w-xs float-none md:float-left md:mr-10 md:mb-8 mb-8 mx-auto mt-2">
                    <div className={`aspect-3/4 bg-white p-6 shadow-xl relative z-10 border border-black/5 transition-transform group-hover:rotate-0 duration-700 -rotate-1 ${isPastAtivo ? 'opacity-70' : ''}`}>
                      {loadingFoto ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 animate-pulse border border-dashed border-black/10 gap-4">
                          <div className="w-6 h-6 border-2 border-t-transparent border-[#8C7A66] rounded-full animate-spin" />
                        </div>
                      ) : fotoAtual ? (
                        <div className="relative w-full h-full">
                          <Image src={fotoAtual} alt={ativo.livro} fill className="object-cover" unoptimized />
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#FDFCFB] border border-dashed border-black/10 gap-4">
                          <PenTool size={32} className="opacity-10" />
                          <span className="text-[9px] uppercase font-bold tracking-widest opacity-20">Em Curadoria</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <Quote style={{ color: marromPapel }} size={32} className="opacity-20 mb-4" />
                    <p className="text-lg md:text-xl italic leading-relaxed opacity-80 text-black text-justify font-serif tracking-tight max-w-none mb-10">
                      &ldquo;{ativo.sinopse}&rdquo;
                    </p>
                    <div className="pt-8 border-t border-black/5 clear-left">
                      <Link href="/resenhas" className="p-0 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 hover:opacity-70 transition-opacity w-max" style={{ color: marromPapel }}>
                        Depois da Leitura <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>

              <aside className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-16 border-t border-black/5 items-start">
                <section className="bg-white p-6 border border-black/5 shadow-sm rounded-2xl md:col-span-3 lg:col-span-1">
                  <h4 className="text-[9px] font-bold uppercase tracking-widest mb-4 opacity-30 text-black">Logística do Encontro</h4>
                  <div className="space-y-4 text-sm italic opacity-60 text-black">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} style={{ color: marromPapel }} className="opacity-40" />
                      <span>Biblioteca Nacional de Brasília</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} style={{ color: marromPapel }} className="opacity-40" />
                      <span>Último Domingo, 10h</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart size={16} style={{ color: marromPapel }} className="opacity-40" />
                      <span>Encontro Gratuito e Aberto</span>
                    </div>
                  </div>
                </section>

                {livros.some(r => r.ano === anoAtual) && (
                  <section className="p-6 border border-black/5">
                    <p className="text-[9px] uppercase tracking-widest font-bold mb-3" style={{ color: marromPapel }}>
                      Progresso {anoAtual}
                    </p>
                    <p className="text-sm text-black">
                      {(() => {
                        const lidos = livros.filter(r => (r.ano ?? anoAtual) === anoAtual && (statusMes(r) === 'passado' || statusMes(r) === 'atual'));
                        const unicos = Array.from(new Set(lidos.map(r => r.livro)));
                        return unicos.length;
                      })()} de{' '}
                      {(() => {
                        const doAno = livros.filter(r => (r.ano ?? anoAtual) === anoAtual);
                        const unicos = Array.from(new Set(doAno.map(r => r.livro)));
                        return unicos.length;
                      })()} livros lidos
                    </p>
                  </section>
                )}

                {anos.filter(a => a < anoAtual).map(ano => {
                  const count = Array.from(new Set(livros.filter(r => r.ano === ano).map(r => r.livro))).length;
                  return (
                    <section key={ano} className="p-6 border border-black/10">
                      <p className="text-[9px] uppercase tracking-widest font-bold mb-1 text-slate-500">✓ {ano} Encerrado</p>
                      <p className="text-sm text-black">{count} livros lidos</p>
                    </section>
                  );
                })}

                {anos.filter(a => a > anoAtual).map(ano => {
                  const count = Array.from(new Set(livros.filter(r => r.ano === ano).map(r => r.livro))).length;
                  return (
                    <section key={ano} className="p-6 border border-black/10">
                      <p className="text-[9px] uppercase tracking-widest font-bold mb-1 text-slate-500">· {ano} Em Breve</p>
                      <p className="text-sm text-black">{count} livros previstos</p>
                    </section>
                  );
                })}
              </aside>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
