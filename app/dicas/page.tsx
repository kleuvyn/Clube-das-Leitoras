"use client";

import React, { useEffect, useState } from 'react';
import { 
  ArrowRight, BookMarked, Feather, Star, X, Clock,
  BookOpen, Coffee, Heart, Sparkles, Lightbulb,
  Sun, Moon, Music, Flower2, Leaf, PenLine, Glasses, Bookmark
} from "lucide-react";
import { Button } from "@/components/ui/button";

const azulSereno = "#5B7C99";

const iconMap: Record<string, any> = {
  BookOpen, Coffee, Heart, Sparkles, Lightbulb,
  Sun, Moon, Music, Flower2, Leaf,
  Star, BookMarked, PenLine, Glasses, Bookmark, Feather
};

interface Dica {
  id: string;
  categoria: string;
  titulo: string;
  descricao: string;
  iconName?: string;
  textoCompleto?: string | null;
}

export default function DicasPage() {
  const [dicas, setDicas] = useState<Dica[]>([]);
  const [loading, setLoading] = useState(true);
  const [dicaAberta, setDicaAberta] = useState<Dica | null>(null);

  useEffect(() => {
    async function carregarDicas() {
      try {
        const res = await fetch('/api/dicas');
        const data = await res.json();
        setDicas(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erro ao carregar dicas:", err);
      } finally {
        setLoading(false);
      }
    }
    carregarDicas();
  }, []);

  
  useEffect(() => {
    if (dicaAberta) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [dicaAberta]);

  return (
    <div className="min-h-screen font-alice pb-40 relative overflow-hidden"
         style={{ background: `#FDFCFB url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')` }}>

      
      <header className="max-w-5xl mx-auto pt-32 pb-24 px-6 text-center border-b border-black/5">
        <div className="flex items-center justify-center gap-4 mb-8 opacity-40">
          <div className="h-px w-10 bg-black" />
          <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-black italic">Brasília • Coluna Mensal</span>
          <div className="h-px w-10 bg-black" />
        </div>

        <h1 className="text-7xl md:text-[100px] text-[#2C3E50] tracking-tighter leading-[0.8] mb-10">
          Dicas da <span style={{ color: azulSereno }} className="italic font-light">Gabi</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-3xl mx-auto border-t border-black/10 pt-10">
          <p className="text-base leading-relaxed opacity-60 text-black italic">
            "Pequenos gestos para transformar sua jornada literária em um ritual de puro autocuidado e presença."
          </p>
          <div className="flex flex-col justify-end items-start md:items-end">
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-sans font-bold" style={{ color: azulSereno }}>
              <Feather size={14} /> Guia Prático de Leitura
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-24 space-y-48">

        
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <p className="col-span-full text-center italic opacity-40 text-black animate-pulse">Sintonizando inspirações...</p>
          ) : dicas.length > 0 ? (
            dicas.map((item, idx) => {
              const Icon = iconMap[item.iconName || ''] || Lightbulb;
              const temTexto = !!item.textoCompleto;
              const tempoLeitura = temTexto
                ? Math.max(1, Math.ceil(item.textoCompleto!.split(' ').length / 200))
                : null;

              return (
                <article
                  key={item.id || idx}
                  className="group flex flex-col gap-5 bg-white border border-black/5 rounded-3xl p-8 hover:shadow-lg transition-all"
                >
                  
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full border bg-[#F7F9FB]" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                      <Icon className="w-4 h-4" style={{ color: azulSereno }} />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: azulSereno }}>
                      {item.categoria}
                    </span>
                    {tempoLeitura && (
                      <span className="ml-auto flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                        <Clock size={10} /> {tempoLeitura} min
                      </span>
                    )}
                  </div>

                  
                  <h3 className="text-2xl leading-tight tracking-tighter border-l-2 pl-5 py-1 text-[#2C3E50] group-hover:italic transition-all"
                      style={{ borderColor: `${azulSereno}40` }}>
                    {item.titulo}
                  </h3>

                  
                  <p className="text-sm leading-relaxed italic opacity-60 text-black pl-5 flex-1">
                    {item.descricao}
                  </p>

                  
                  {temTexto ? (
                    <button
                      onClick={() => setDicaAberta(item)}
                      className="mt-2 self-start flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] transition-all hover:gap-3"
                      style={{ color: azulSereno }}
                    >
                      Ler coluna <ArrowRight size={12} />
                    </button>
                  ) : (
                    <div className="mt-2 h-px w-12 opacity-20" style={{ background: azulSereno }} />
                  )}
                </article>
              );
            })
          ) : (
            <p className="col-span-full text-center italic opacity-40 text-black">Nenhuma dica publicada ainda.</p>
          )}
        </section>

        
        <section className="bg-white border border-black/5 p-12 md:p-20 space-y-16 shadow-sm relative rounded-[3rem]">
          <div className="flex flex-col items-center text-center space-y-4">
            <Star className="w-5 h-5 mb-2 opacity-40" style={{ color: azulSereno }} />
            <h2 className="text-5xl text-[#2C3E50] tracking-tight">Manifesto da <span className="italic font-light" style={{ color: azulSereno }}>Leitora</span></h2>
            <div className="h-px w-24 bg-black/10" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-8 max-w-4xl mx-auto">
            {[
              "Use marcadores que tragam memórias",
              "O livro é um diálogo: sublinhe",
              "Metas realistas: um capítulo",
              "Carregue sempre um livro",
              "Visite sebos locais",
              "Respeite seu ritmo"
            ].map((manifesto, index) => (
              <div key={index} className="flex items-center gap-4 border-b border-black/5 pb-4 group">
                <BookMarked className="w-4 h-4 opacity-20 group-hover:opacity-100 transition-opacity" style={{ color: azulSereno }} />
                <span className="text-lg italic opacity-60 text-black group-hover:opacity-100 transition-opacity">{manifesto}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      
      {dicaAberta && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
          style={{ background: 'rgba(30,40,55,0.6)', backdropFilter: 'blur(6px)' }}
          onClick={() => setDicaAberta(null)}
        >
          <div
            className="relative bg-white w-full md:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-[2.5rem] md:rounded-[2.5rem] pt-14 md:pt-16 pb-10 md:pb-14 px-6 md:px-14 shadow-2xl"
            style={{ marginTop: '24px', boxSizing: 'border-box' }}
            onClick={e => e.stopPropagation()}
          >
            
            <button
              onClick={() => setDicaAberta(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition"
              aria-label="Fechar"
            >
              <X size={18} className="text-slate-500" />
            </button>

            
            <div className="flex items-center gap-2 mb-8">
              {React.createElement(iconMap[dicaAberta.iconName || ''] || Lightbulb, { size: 16, style: { color: azulSereno } })}
              <span className="text-[9px] font-bold uppercase tracking-[0.35em]" style={{ color: azulSereno }}>
                {dicaAberta.categoria}
              </span>
              {dicaAberta.textoCompleto && (
                <span className="ml-auto flex items-center gap-1 text-[9px] text-slate-400 font-bold">
                  <Clock size={10} /> {Math.max(1, Math.ceil(dicaAberta.textoCompleto.split(' ').length / 200))} min de leitura
                </span>
              )}
            </div>

            
            <h2 className="text-4xl leading-tight tracking-tighter text-[#2C3E50] mb-3 font-serif italic">
              {dicaAberta.titulo}
            </h2>
            <p className="text-sm italic text-slate-400 mb-8 leading-relaxed">
              {dicaAberta.descricao}
            </p>

            <div className="h-px w-full bg-black/5 mb-8" />

            
            <div className="space-y-5 text-[15px] leading-[1.85] text-slate-700">
              {dicaAberta.textoCompleto!.split(/\n\n+/).map((paragrafo, i) => (
                <p key={i}>{paragrafo.trim()}</p>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t border-black/5 flex items-center gap-3">
              <Feather size={14} style={{ color: azulSereno }} />
              <span className="text-[10px] text-slate-400 uppercase tracking-widest italic">Coluna da Gabi • Clube das Leitoras</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
