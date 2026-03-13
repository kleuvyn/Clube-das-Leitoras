"use client";

import React, { useEffect, useState } from 'react';
import { MapPin, Download, Calendar, Heart, Map as MapIcon, Sparkles, Stars, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventoItem {
  mes: string;
  dia: string;
  livro: string;
}

interface CronogramaAno {
  id: string;
  title: string;
  imageUrl: string | null;
  ano: number;
  status: string;
  eventos: EventoItem[];
}

const MESES_ORDEM: Record<string, number> = {
  janeiro: 1, fevereiro: 2, marco: 3, abril: 4, maio: 5, junho: 6,
  julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
};

function normMes(mes: string): string {
  return mes.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function mesNum(mes: string): number {
  return MESES_ORDEM[normMes(mes)] ?? 0;
}

export default function CronogramaPage() {
  const [cronogramas, setCronogramas] = useState<CronogramaAno[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandidos, setExpandidos] = useState<Set<number>>(new Set());

  const anoAtual = new Date().getFullYear();
  const mesAtual = new Date().getMonth() + 1;

  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch('/api/cronograma');
        if (!res.ok) return;
        const data = await res.json();
        const arr = Array.isArray(data) ? data : (data ? [data] : []);

        
        const porAno = new Map<number, any>();
        for (const item of arr) {
          const ano = item.ano ?? new Date(item.createdAt).getFullYear();
          if (!porAno.has(ano) || new Date(item.createdAt) > new Date(porAno.get(ano).createdAt)) {
            porAno.set(ano, { ...item, ano });
          }
        }

        const lista: CronogramaAno[] = Array.from(porAno.entries()).map(([ano, item]) => ({
          id: item.id,
          title: item.title,
          imageUrl: item.imageUrl,
          ano,
          status: item.status,
          eventos: (() => {
            try { return JSON.parse(item.notes || '[]'); } catch { return []; }
          })(),
        }));

        lista.sort((a, b) => b.ano - a.ano);
        setCronogramas(lista);
        setExpandidos(new Set([anoAtual]));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  const toggleExpand = (ano: number) =>
    setExpandidos(prev => {
      const next = new Set(prev);
      next.has(ano) ? next.delete(ano) : next.add(ano);
      return next;
    });

  const handleAddCalendar = (eventos: EventoItem[], ano: number) => {
    const hoje = new Date();
    const proximo = eventos
      .map(ev => {
        const n = mesNum(ev.mes);
        const d = parseInt(ev.dia);
        if (!n || isNaN(d)) return null;
        return { ev, data: new Date(ano, n - 1, d) };
      })
      .filter((x): x is { ev: EventoItem; data: Date } => x !== null && x.data >= hoje)
      .sort((a, b) => a.data.getTime() - b.data.getTime())[0];

    if (!proximo) { alert("Nenhum próximo encontro encontrado."); return; }
    const { ev, data } = proximo;
    const pad = (n: number) => String(n).padStart(2, '0');
    const ds = `${data.getFullYear()}${pad(data.getMonth() + 1)}${pad(data.getDate())}`;
    window.open(
      `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Clube das Leitoras — ${ev.livro || 'Encontro'}`)}&dates=${ds}/${ds}&details=${encodeURIComponent(`Encontro mensal do Clube das Leitoras.\nLivro: ${ev.livro || 'A definir'}`)}&location=${encodeURIComponent('Brasília, DF')}`,
      '_blank'
    );
  };

  const handleDownload = async (imageUrl: string) => {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objUrl; a.download = 'arte-do-mes.jpg';
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(objUrl);
    } catch { window.open(imageUrl, '_blank'); }
  };

  return (
    <div
      className="min-h-screen font-alice pb-40 relative overflow-hidden"
      style={{ background: `#FDFCFB url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')` }}
    >
      
      <header className="max-w-5xl mx-auto pt-32 pb-24 px-6 text-center border-b border-black/5">
        <div className="flex items-center justify-center gap-4 mb-8 opacity-40">
          <div className="h-px w-10 bg-black" />
          <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-black">Informativo de Afeto</span>
          <div className="h-px w-10 bg-black" />
        </div>
        <h1 className="text-7xl md:text-[110px] tracking-tighter mb-10 leading-[0.8]">
          <span className="text-[#2C3E50]">Rodas &</span>{' '}
          <span style={{ color: 'var(--page-color)' }} className="italic font-light">Encontros</span>
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-3xl mx-auto pt-10 border-t border-black/10">
          <p className="italic text-base leading-relaxed opacity-60 text-black">
            &ldquo;A literatura como ponte para encontros presenciais sob o céu do Planalto Central. Um espaço de troca e acolhimento.&rdquo;
          </p>
          <div className="flex flex-col justify-end">
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-sans font-bold" style={{ color: 'var(--page-color)' }}>
              <MapPin size={14} /> Brasília - DF
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-24 space-y-32">

        {loading ? (
          <div className="text-center italic opacity-30 text-[#2C3E50] py-20">Carregando cronograma...</div>
        ) : cronogramas.length === 0 ? (
          <div className="text-center py-24 italic opacity-30 text-[#2C3E50]">Nenhum cronograma disponível.</div>
        ) : (
          cronogramas.map(crono => {
            const isAtual = crono.ano === anoAtual;
            const expandido = expandidos.has(crono.ano);
            const totalEventos = crono.eventos.length;
            const eventosFuturos = crono.eventos.filter(ev => {
              const n = mesNum(ev.mes);
              if (crono.ano > anoAtual) return true;
              if (crono.ano < anoAtual) return false;
              return n >= mesAtual;
            }).length;

            return (
              <section key={crono.ano}>
                
                <button
                  onClick={() => toggleExpand(crono.ano)}
                  className="w-full flex items-end gap-6 mb-16 group text-left"
                >
                  <span
                    className="text-[100px] md:text-[140px] font-light tracking-tighter leading-none transition-colors duration-500 select-none"
                    style={{ color: isAtual ? 'var(--page-color)' : '#2C3E5012' }}
                  >
                    {crono.ano}
                  </span>
                  <div className="flex-1 mb-6">
                    <div className="h-px w-full bg-black/10" />
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.5em] opacity-30 text-[#2C3E50]">
                        {totalEventos} encontro{totalEventos !== 1 ? 's' : ''}
                        {isAtual && eventosFuturos > 0 && (
                          <span className="ml-3" style={{ color: 'var(--page-color)', opacity: 0.9 }}>
                            · {eventosFuturos} por vir
                          </span>
                        )}
                        {crono.ano < anoAtual && <span className="ml-3">· Encerrado</span>}
                        {crono.ano > anoAtual && <span className="ml-3">· Em Breve</span>}
                      </p>
                      <ChevronDown
                        size={14}
                        className={`opacity-20 group-hover:opacity-60 transition-all duration-300 text-[#2C3E50] ${expandido ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </div>
                </button>

                {expandido && (
                  <div className="space-y-20 animate-in fade-in slide-in-from-top-4 duration-500">

                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {crono.eventos.map((item, idx) => {
                        const n = mesNum(item.mes);
                        const isPast = crono.ano < anoAtual || (crono.ano === anoAtual && n < mesAtual);
                        const isCurrent = crono.ano === anoAtual && n === mesAtual;

                        return (
                          <div
                            key={idx}
                            className={`p-8 border transition-all duration-500 rounded-3xl ${
                              isCurrent
                                ? 'bg-white shadow-xl -translate-y-2'
                                : isPast
                                ? 'bg-transparent opacity-40'
                                : 'bg-transparent hover:bg-white/60'
                            }`}
                            style={{ borderColor: isCurrent ? 'var(--page-color)' : 'rgba(0,0,0,0.05)' }}
                          >
                            <div className="flex flex-col h-full justify-between">
                              <div>
                                <span className="text-[9px] font-bold uppercase tracking-[0.3em] mb-4 block" style={{ color: 'var(--page-color)' }}>
                                  {item.mes}{isPast && <span className="ml-1 opacity-50">✓</span>}
                                </span>
                                <h3 className="text-5xl tracking-tighter text-[#2C3E50] mb-6">{item.dia}</h3>
                              </div>
                              <div className="pt-6 border-t border-black/5">
                                <p className="text-[11px] italic leading-tight opacity-60 text-black">
                                  {item.livro || "Em Curadoria"}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      
                      {isAtual && (
                        <div
                          className="p-8 border border-dashed flex flex-col items-center justify-center text-center rounded-3xl"
                          style={{ borderColor: 'rgba(0,0,0,0.1)' }}
                        >
                          <Stars size={20} style={{ color: 'var(--page-color)' }} className="mb-4 opacity-60" />
                          <p className="text-[10px] italic opacity-40 text-black leading-relaxed">
                            &ldquo;A cada página, um novo horizonte.<br />A cada encontro, um novo laço.&rdquo;
                          </p>
                        </div>
                      )}
                    </div>

                    
                    {isAtual && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start pt-8 border-t border-black/5">
                        <div className="bg-white border border-black/5 p-12 space-y-10 shadow-sm rounded-[3rem]">
                          <h3 className="text-4xl text-[#2C3E50]">
                            O Ritual do <span className="italic" style={{ color: 'var(--page-color)' }}>Cerrado</span>
                          </h3>
                          <div className="space-y-8">
                            {[
                              { icon: Heart, label: 'Presença', desc: 'Coração aberto para ouvir e ser ouvida.' },
                              { icon: MapIcon, label: 'Conforto', desc: 'Uma canga macia ou nossa cadeirinha do cerrado.' },
                              { icon: Sparkles, label: 'Partilha', desc: 'Lanche coletivo e conversas sem fim.' },
                            ].map(({ icon: Icon, label, desc }) => (
                              <div key={label} className="flex gap-6">
                                <Icon className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--page-color)' }} />
                                <div className="space-y-1">
                                  <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#2C3E50]">{label}</h4>
                                  <p className="text-sm italic opacity-60 text-black">{desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <Button
                            className="w-full text-white h-16 rounded-2xl font-bold uppercase text-[10px] tracking-[0.3em] shadow-lg hover:brightness-110 transition-all"
                            style={{ backgroundColor: 'var(--page-color)' }}
                            onClick={() => handleAddCalendar(crono.eventos, crono.ano)}
                          >
                            Anotar Próximo Encontro <Calendar className="ml-3 w-4 h-4" />
                          </Button>
                        </div>

                        {crono.imageUrl && (
                          <div className="flex flex-col items-center space-y-8">
                            <p className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-40 text-black">Arte do Mês</p>
                            <div
                              onClick={() => handleDownload(crono.imageUrl!)}
                              className="relative group border-12 border-white shadow-xl rotate-1 hover:rotate-0 transition-transform bg-white overflow-hidden rounded-sm cursor-pointer"
                            >
                              <div className="relative w-105 max-w-full">
                                <img src={crono.imageUrl} alt="Arte do Mês" className="w-full h-auto block object-cover" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                                  <Download size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDownload(crono.imageUrl!)}
                              className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em] transition-opacity text-black opacity-60 hover:opacity-100"
                            >
                              <Download size={12} /> Download da Arte Mensal
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </section>
            );
          })
        )}
      </main>
    </div>
  );
}
