"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Quote, ArrowRight, Heart, MapPin, Calendar, PenTool, ChevronDown } from "lucide-react";

const marromPapel = "#8C7A66";
const azulPetroleo = "#2C3E50";

const MESES_NUM: Record<string, number> = {
  janeiro: 1, fevereiro: 2, março: 3, abril: 4,
  maio: 5, junho: 6, julho: 7, agosto: 8,
  setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
};

interface RodaLiteraria {
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

export default function CalendarioJornal() {
  const [todas, setTodas] = useState<RodaLiteraria[]>([]);
  const [ativo, setAtivo] = useState<RodaLiteraria | null>(null);
  const [anosExpandidos, setAnosExpandidos] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  const anoAtual = new Date().getFullYear();
  const mesAtual = new Date().getMonth() + 1;

  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch('/api/livro-do-mes');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const lista: RodaLiteraria[] = data.map((r: any) => ({
            id: r.id,
            mes: r.mes || '',
            num: r.num ?? null,
            ano: r.ano ?? null,
            livro: r.livro || '',
            autora: r.autora || '',
            foto: r.foto || null,
            sinopse: r.sinopse || '',
            tag: r.tag || 'Leitura do Mês',
            confirmado: r.confirmado ?? false,
          }));
          setTodas(lista);

          
          const anos = [...new Set(lista.map(r => r.ano ?? anoAtual))];
          setAnosExpandidos(new Set(anos));

          
          const mesAtualNome = new Date().toLocaleString('pt-BR', { month: 'long' });
          const doAnoAtual = lista.filter(r => r.ano === anoAtual).sort((a, b) => mesNum(a) - mesNum(b));
          const current = doAnoAtual.find(r => r.mes?.toLowerCase() === mesAtualNome.toLowerCase()) || null;
          setAtivo(current);
        }
      } catch (err) {
        console.error("Erro ao carregar calendário:", err);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

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

  const anos = [...new Set(todas.map(r => r.ano ?? anoAtual))].sort((a, b) => b - a);
  const ativoAno = ativo?.ano ?? null;
  const isPastAtivo = ativoAno !== null && ativoAno < anoAtual;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center italic opacity-30 bg-[#FDFCFB]">
      Folheando o diretório de afeto...
    </div>
  );

  return (
    <div className="min-h-screen font-alice pb-40 relative overflow-hidden"
         style={{ background: `#FDFCFB url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')` }}>

      
      <header className="max-w-5xl mx-auto pt-32 pb-16 px-6 text-center border-b border-black/5">
        <div className="flex items-center justify-center gap-4 mb-8 opacity-40">
          <div className="h-px w-10 bg-black" />
          <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-black italic">Diretório de Afeto • Planalto Central</span>
          <div className="h-px w-10 bg-black" />
        </div>
        <h1 className="text-7xl md:text-[100px] text-[#2C3E50] tracking-tighter leading-[0.8] mb-10">
          A Próxima <span style={{ color: marromPapel }} className="italic font-light">Página</span>
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-3xl mx-auto border-t border-black/10 pt-10">
          <p className="text-base leading-relaxed opacity-60 text-black italic">
            &ldquo;Um calendário de afeto, onde cada mês reserva uma nova história para nos transformar.&rdquo;
          </p>
          <div className="flex flex-col justify-end items-start md:items-end">
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-sans font-bold" style={{ color: marromPapel }}>
              <PenTool size={14} /> Calendário Literário {anoAtual}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-24">
        {todas.length === 0 ? (
          <div className="text-center italic opacity-30 py-20">Nenhum livro cadastrado ainda.</div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-16 items-start">

            
            <aside className="lg:col-span-3 border-r border-black/5 pr-8 space-y-8">
              {anos.map(ano => {
                const doAno = todas.filter(r => (r.ano ?? anoAtual) === ano).sort((a, b) => mesNum(a) - mesNum(b));
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
              <article className="lg:col-span-6 space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="space-y-4 text-center md:text-left">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-[9px] font-bold uppercase tracking-[0.4em] px-3 py-1 border border-black/10 rounded-full" style={{ color: marromPapel }}>
                      {ativo.tag}
                    </span>
                    {ativo.ano && (
                      <span className="text-[9px] font-bold uppercase tracking-[0.4em] px-3 py-1 border border-black/20 rounded-full text-slate-500">
                        {ativo.mes} {ativo.ano}
                      </span>
                    )}
                  </div>
                  <h2 className="text-6xl md:text-8xl text-[#2C3E50] tracking-tighter leading-[0.9]">
                    {ativo.livro}
                  </h2>
                  <p className="text-xl italic opacity-40 text-black">Por {ativo.autora}</p>
                </div>

                
                <div className="relative group max-w-sm mx-auto md:mx-0">
                  <div className={`aspect-3/4 bg-white p-6 shadow-xl relative z-10 border border-black/5 transition-transform group-hover:rotate-0 duration-700 -rotate-1 ${isPastAtivo ? 'opacity-70' : ''}`}>
                    {ativo.foto ? (
                      <div className="relative w-full h-full">
                        <Image src={ativo.foto} alt={ativo.livro} fill className="object-contain" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-[#FDFCFB] border border-dashed border-black/10 gap-4">
                        <PenTool size={32} className="opacity-10" />
                        <span className="text-[9px] uppercase font-bold tracking-widest opacity-20">Em Curadoria</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-8 pt-4 border-t border-black/5">
                  <Quote style={{ color: marromPapel }} size={32} className="opacity-20" />
                  <p className="text-2xl italic leading-relaxed opacity-60 text-black">
                    &ldquo;{ativo.sinopse}&rdquo;
                  </p>
                  <div className="pt-8">
                    <Link href="/resenhas" className="p-0 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 hover:opacity-70 transition-opacity" style={{ color: marromPapel }}>
                      Detalhes da Roda <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </article>
            )}

            
            <aside className="lg:col-span-3 space-y-12">
              <section className="bg-white p-10 border border-black/5 shadow-sm rounded-2xl">
                <h4 className="text-[9px] font-bold uppercase tracking-widest mb-8 opacity-30 text-black">Logística do Encontro</h4>
                <div className="space-y-8 text-sm italic opacity-60 text-black">
                  <div className="flex items-center gap-4">
                    <MapPin size={16} style={{ color: marromPapel }} className="opacity-40" />
                    <span>Biblioteca Nacional de Brasília</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Calendar size={16} style={{ color: marromPapel }} className="opacity-40" />
                    <span>Último Domingo, 10h</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Heart size={16} style={{ color: marromPapel }} className="opacity-40" />
                    <span>Encontro Gratuito e Aberto</span>
                  </div>
                </div>
              </section>

              
              {todas.some(r => r.ano === anoAtual) && (
                <section className="p-6 border border-black/5">
                  <p className="text-[9px] uppercase tracking-widest font-bold mb-3" style={{ color: marromPapel }}>
                    Progresso {anoAtual}
                  </p>
                  <p className="text-sm text-black">
                    {todas.filter(r => (r.ano ?? anoAtual) === anoAtual && (statusMes(r) === 'passado' || statusMes(r) === 'atual')).length} de{' '}
                    {todas.filter(r => (r.ano ?? anoAtual) === anoAtual).length} livros lidos
                  </p>
                </section>
              )}

              
              {anos.filter(a => a < anoAtual).map(ano => {
                const count = todas.filter(r => r.ano === ano).length;
                return (
                  <section key={ano} className="p-6 border border-black/10">
                    <p className="text-[9px] uppercase tracking-widest font-bold mb-1 text-slate-500">✓ {ano} Encerrado</p>
                    <p className="text-sm text-black">{count} livros lidos</p>
                  </section>
                );
              })}

              
              {anos.filter(a => a > anoAtual).map(ano => {
                const count = todas.filter(r => r.ano === ano).length;
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
      </main>
    </div>
  );
}