"use client";

import React from 'react';
import Image from 'next/image';
import { 
  MapPin, Sparkles, Download, 
  Calendar, Heart, Map, Stars 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Evento {
  mes: string;
  dia: string;
  livro: string;
}

interface CronogramaProps {
  eventos?: Evento[];      
  imagemMesUrl?: string;   
}

export default function CronogramaLavandaComCard({ 
  eventos = [], 
  imagemMesUrl 
}: CronogramaProps) {
  
  const dataAtual = new Date();
  const mesAtualNome = dataAtual.toLocaleString('pt-BR', { month: 'long' })
    .toLowerCase()
    .trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const handleAddToCalendar = () => {
    if (!eventos || eventos.length === 0) return;
    const proximoEvento = eventos.find(e => e.livro && e.livro !== "Em Curadoria" && e.livro !== "");
    
    if (proximoEvento) {
      const msg = `Lembrete: Encontro do Clube - ${proximoEvento.livro}\nDia ${proximoEvento.dia} de ${proximoEvento.mes}\nLocal: Biblioteca Nacional de Brasília`;
      alert(msg); 
    } else {
      alert("Nenhum encontro confirmado no momento. Fique de olho no Instagram!");
    }
  };

  return (
    <div className="min-h-screen font-alice pb-40 relative overflow-hidden" style={{ background: 'var(--page-color-05)', color: 'var(--page-color-60)' }}>
      
      <header className="max-w-5xl mx-auto pt-32 pb-24 px-6 relative z-10 text-center">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-[1px] w-10" style={{ backgroundColor: 'var(--page-color-40)' }} />
          <span className="text-[10px] font-bold uppercase tracking-[0.6em]" style={{ color: 'var(--page-color-60)' }}>Informativo de Afeto</span>
          <div className="h-[1px] w-10" style={{ backgroundColor: 'var(--page-color-40)' }} />
        </div>
        
        <h1 className="text-7xl md:text-[100px] tracking-tighter italic font-light mb-10 leading-[0.8]" style={{ color: 'var(--page-color-60)' }}>
          Rodas & <span style={{ color: 'var(--page-color)' }} className="not-italic">Encontros</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-3xl mx-auto border-t pt-10" style={{ borderColor: 'var(--page-color-30)' }}>
          <p className="italic text-base leading-relaxed" style={{ color: 'var(--page-color-60)' }}>
            "A literatura como ponte para encontros presenciais sob o céu do Planalto Central. Um espaço de troca e acolhimento em Brasília."
          </p>
          <div className="flex flex-col justify-end">
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-sans font-bold opacity-80" style={{ color: 'var(--page-color)' }}>
              <MapPin size={14} /> Brasília - DF
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 relative z-10 space-y-48">
        
        <section className="space-y-16">
           <div className="flex flex-col items-center text-center space-y-4">
             <h2 className="text-5xl italic font-light text-[#2C3E50]">Agenda 2026</h2>
             <div className="h-px w-24" style={{ backgroundColor: 'var(--page-color-30)' }} />
           </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {eventos && eventos.length > 0 ? (
              eventos.map((item, idx) => {
                const itemMesLimpo = item.mes?.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const isMesAtual = itemMesLimpo === mesAtualNome;

                return (
                  <div key={idx} className={`group relative p-8 border transition-all duration-500 rounded-3xl ${isMesAtual ? 'bg-white shadow-xl -translate-y-2' : ''}`} 
                       style={{ 
                         borderColor: isMesAtual ? 'var(--page-color)' : 'var(--page-color-15)', 
                         background: isMesAtual ? 'white' : 'var(--page-color-05)' 
                       }}>
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-[0.3em] mb-4 block" style={{ color: isMesAtual ? 'var(--page-color)' : 'var(--page-color-60)' }}>
                          {item.mes}
                        </span>
                        <h3 className="text-5xl tracking-tighter font-light italic text-[#2C3E50]">{item.dia}</h3>
                      </div>
                      <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--page-color-15)' }}>
                         <p className={`text-[10px] italic leading-tight ${!item.livro || item.livro === "Em Curadoria" ? "opacity-30" : ""}`} 
                            style={!item.livro || item.livro === "Em Curadoria" ? undefined : { color: 'var(--page-color-60)' }}>
                           {item.livro || "Em Curadoria"}
                         </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-20 text-center italic opacity-40 border-2 border-dashed rounded-[3rem]" style={{ borderColor: 'var(--page-color-20)' }}>
                O cronograma de 2026 está sendo preparado com carinho...
              </div>
            )}

            
            <div className="p-8 border-2 border-dashed flex flex-col items-center justify-center text-center rounded-3xl" 
              style={{ borderColor: 'var(--page-color-30)', background: 'var(--page-color-10)' }}>
              <Stars size={24} style={{ color: 'var(--page-color)' }} className="mb-4 opacity-60" />
                <p className="text-[11px] italic leading-relaxed text-[#2C3E50]">
                    "A cada página, um novo horizonte. A cada encontro, um novo laço."
                </p>
            </div>
          </div>
        </section>

        
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start pb-20">
            <div className="bg-white border p-12 md:p-16 space-y-12 shadow-sm relative rounded-[3rem]" style={{ borderColor: 'var(--page-color-20)' }}>
                 <h3 className="text-4xl italic font-light text-[#2C3E50]">O Ritual do Cerrado</h3>
                <div className="space-y-10">
                    <div className="flex gap-6">
                        <Heart style={{ color: 'var(--page-color)' }} className="w-5 h-5 shrink-0" />
                        <div className="space-y-2">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#2C3E50]">Presença</h4>
                            <p className="text-sm italic opacity-70">Coração aberto para ouvir e ser ouvida.</p>
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <Map style={{ color: 'var(--page-color)' }} className="w-5 h-5 shrink-0" />
                        <div className="space-y-2">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#2C3E50]">Conforto</h4>
                            <p className="text-sm italic opacity-70">Uma canga macia ou nossa cadeirinha do cerrado.</p>
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <Sparkles style={{ color: 'var(--page-color)' }} className="w-5 h-5 shrink-0" />
                        <div className="space-y-2">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#2C3E50]">Partilha</h4>
                            <p className="text-sm italic opacity-70">Lanche coletivo e conversas sem fim.</p>
                        </div>
                    </div>
                </div>
                
                <Button 
                  onClick={handleAddToCalendar}
                  className="w-full text-white h-16 rounded-2xl font-sans font-bold uppercase text-[10px] tracking-[0.3em] transition-all shadow-lg hover:brightness-110 active:scale-95"
                  style={{ backgroundColor: 'var(--page-color-60)' }}
                >
                    Anotar Próximo Encontro <Calendar className="ml-3 w-4 h-4" />
                </Button>
            </div>

            <div className="flex flex-col items-center space-y-10">
                <div className="relative group cursor-pointer border-[12px] border-white shadow-xl rotate-1 hover:rotate-0 transition-transform bg-white overflow-hidden rounded-sm">
                    {imagemMesUrl ? (
                      <div className="relative w-full max-w-[450px]">
                         <img 
                          src={imagemMesUrl} 
                          alt="Cronograma Visual" 
                          className="w-full h-auto block object-cover grayscale hover:grayscale-0 transition-all duration-700" 
                        />
                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                            <Download size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                         </div>
                      </div>
                    ) : (
                      <div className="w-[450px] aspect-[4/3] flex items-center justify-center text-[10px] italic text-gray-400 bg-slate-50">Aguardando arte do mês...</div>
                    )}
                </div>
                <p style={{ color: 'var(--page-color)' }} className="text-[10px] font-black uppercase tracking-[0.4em]">Download da Arte Mensal</p>
            </div>
        </section>
      </main>
    </div>
  );
}