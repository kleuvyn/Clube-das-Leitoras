"use client";

import React from 'react';
import Image from 'next/image';
import Link from "next/link";
import { ArrowLeft, Share2, Quote, Minus, Star, MapPin } from "lucide-react"; 
import { Button } from "@/components/ui/button";

const corDestaque = "var(--page-color)"; 

export default function ConteudoClubeLayout({ params }: { params: { slug: string } }) {
  const tituloFormatado = params.slug.replace(/-/g, ' ');

  return (
    <div className="min-h-screen text-[#42382F] pb-20 font-alice selection:bg-[#F4D9C1] relative overflow-hidden"
         style={{ background: `#FDFCFB url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')` }}>
      
      

      
      <header className="max-w-5xl mx-auto pt-40 pb-24 px-6 relative z-10">
        <div className="flex flex-col items-center text-center">
          
          <Link href="/" className="inline-flex items-center text-[9px] font-bold uppercase tracking-[0.5em] mb-12 transition-all hover:-translate-x-2 group" style={{ color: corDestaque }}>
            <ArrowLeft className="w-3 h-3 mr-2 group-hover:scale-125 transition-transform" /> Voltar ao Ninho
          </Link>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="h-[1px] w-10 opacity-30" style={{ backgroundColor: corDestaque }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.6em]" style={{ color: corDestaque }}>
              Ocupação Literária
            </span>
            <div className="h-[1px] w-10 opacity-30" style={{ backgroundColor: corDestaque }} />
          </div>

          <h1 className="text-5xl md:text-7xl text-[#2C241B] tracking-tighter leading-none italic font-light mb-10 capitalize">
            {tituloFormatado}
          </h1>

          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-3xl border-t border-[#F4EFEA] pt-8">
            <div className="relative">
              <Quote className="absolute -left-6 -top-2 w-8 h-8 opacity-20" style={{ color: corDestaque }} />
              <p className="text-[#7A6D5D] italic text-sm leading-relaxed pl-4">
                "Um movimento para viver a cidade através das páginas e do afeto compartilhado. Brasília se torna o nosso cenário principal."
              </p>
            </div>
            <div className="flex flex-col justify-end">
                <p className="text-[#7A6D5D] text-[10px] uppercase tracking-[0.2em] leading-relaxed font-sans font-bold opacity-70">
                  Edição Especial de Curadoria • 2026 • Espaços de troca, escuta e acolhimento em cada capítulo.
                </p>
            </div>
          </div>
          
          <div className="h-px w-full bg-[#F4EFEA] mt-12" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="bg-[#FDFBF9] border border-[#F4EFEA] p-8 md:p-20 shadow-sm relative mb-20">
          <Quote className="absolute top-10 right-10 w-12 h-12 text-[#F4D9C1]/30 -rotate-12 pointer-events-none" />

          <article className="space-y-16">
             <p className="text-2xl md:text-3xl italic text-[#7A6D5D] leading-snug border-l-2 pl-8 py-2" style={{ borderColor: corDestaque }}>
                O Clube das Leitoras não é apenas sobre livros, é sobre a pausa necessária no meio do asfalto da capital.
             </p>

             <section className="space-y-12">
                <div className="flex items-center gap-4">
                    <Minus className="w-8" style={{ color: "#93A37F" }} />
                    <h2 className="text-4xl italic text-[#2C241B] tracking-tight">
                       Como <span style={{ color: corDestaque }}>Participar</span>
                    </h2>
                </div>
                
                <div className="grid gap-4">
                   {[
                     "Escolha seu plano de assinatura mensal no nosso grupo oficial.",
                     "Receba o guia de leitura do mês e o cronograma de Brasília."
                   ].map((texto, idx) => (
                     <div key={idx} className="flex items-center gap-8 p-10 bg-white border border-[#F4EFEA] hover:border-[#94A7BC]/40 transition-all duration-500">
                        <span className="text-4xl font-light italic leading-none" style={{ color: "#F4D9C1" }}>{idx + 1}.</span>
                        <span className="text-lg italic text-[#7A6D5D] leading-relaxed">{texto}</span>
                     </div>
                   ))}
                </div>
             </section>

             
             <div className="mt-24 p-12 md:p-20 bg-[#2C241B] text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full -mr-32 -mt-32 blur-3xl opacity-10" style={{ backgroundColor: corDestaque }} />
                
                <div className="relative z-10 space-y-10 text-center md:text-left">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                       <Star className="w-4 h-4 text-[#E6B34D] fill-[#E6B34D]" />
                       <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#94A7BC]">Próximo Encontro</span>
                    </div>
                    <h4 className="text-4xl md:text-5xl italic font-light tracking-tight">Roda de Conversa</h4>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 text-sm italic text-white/60">
                    <div className="flex items-center gap-2">
                        <MapPin size={14} style={{ color: corDestaque }} />
                        <span>Biblioteca Nacional de Brasília</span>
                    </div>
                    <span>Domingo, Março às 10h</span>
                  </div>
                  
                  <Button className="hover:bg-[#FDFCFB] hover:text-[#2C241B] text-white px-12 h-16 rounded-none font-sans font-black uppercase text-[10px] tracking-[0.4em] transition-all shadow-xl active:scale-95" style={{ backgroundColor: corDestaque }}>
                     Reservar meu lugar <Share2 className="ml-4 w-4 h-4" />
                  </Button>
                </div>
             </div>
          </article>
        </div>

        
        <footer className="mt-32 text-center pb-20 flex flex-col items-center gap-12">
           <div className="w-px h-16 bg-[#F4EFEA]" />
           
           <div className="space-y-4">
               <p className="text-[9px] font-bold uppercase tracking-[1em] italic opacity-50" style={{ color: corDestaque }}>Curadoria de Afeto</p>
               <Button variant="ghost" className="text-[#94A7BC] hover:bg-transparent font-bold uppercase text-[10px] tracking-widest gap-3">
                  Conversar com o Ninho <ArrowLeft className="w-3 h-3 rotate-180" />
               </Button>
           </div>
        </footer>
      </main>
    </div>
  );
}