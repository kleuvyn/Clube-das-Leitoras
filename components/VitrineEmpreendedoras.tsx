"use client";

import React from 'react';
import { Instagram, ShoppingBag, Star } from "lucide-react"; 
import { Button } from "@/components/ui/button";

const lavandaPrincipal = "#967BB6";
const azulPetroleo = "#2C3E50";

interface Empreendedora {
  id: number;
  nome: string;
  negocio: string;
  categoria: string;
  instagram?: string;
  frase: string;
}

interface VitrineProps {
  lista: Empreendedora[];
  loading?: boolean;
}

export default function VitrineEmpreendedoras({ lista, loading = false }: VitrineProps) {
  return (
    <div className="min-h-screen bg-[#FDFCFB] font-alice pb-40 relative overflow-hidden">
      
      
      <header className="max-w-5xl mx-auto pt-32 pb-24 px-6 text-center border-b border-black/5">
        <div className="flex items-center justify-center gap-4 mb-8 opacity-40">
          <div className="h-[1px] w-10 bg-black" />
          <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-black italic">Brasília • Vitrine de Afeto</span>
          <div className="h-[1px] w-10 bg-black" />
        </div>
        
        <h1 className="text-7xl md:text-[100px] text-[#2C3E50] tracking-tighter leading-[0.8] mb-10">
          Vitrine <span style={{ color: lavandaPrincipal }} className="italic font-light">Criativa</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-3xl mx-auto border-t border-black/10 pt-10">
          <p className="text-base leading-relaxed opacity-60 text-black italic">
            "Um espaço dedicado ao talento que floresce nas mãos das nossas leitoras. Aqui, o empreendedorismo é feito de afeto e histórias."
          </p>
          <div className="flex flex-col justify-end items-start md:items-end">
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-sans font-bold" style={{ color: lavandaPrincipal }}>
              <ShoppingBag size={14} /> Apoie as Mãos Locais
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-24 space-y-48">
        {loading ? (
          <div className="text-center py-20 italic opacity-40 text-black animate-pulse">Sintonizando talentos locais...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-12 gap-y-24">
              {lista.map((item, idx) => (
              <div key={item.id || idx} className="group space-y-6">
                
                
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border border-black/5 rounded-full rotate-6 group-hover:rotate-12 transition-all duration-700" />
                    <div className="absolute inset-0 rounded-full flex items-center justify-center bg-white border border-black/5 shadow-sm">
                         <span className="text-xl italic opacity-40" style={{ color: lavandaPrincipal }}>
                            {item.nome?.charAt(0) || "C"}
                         </span>
                    </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: lavandaPrincipal }}>
                    {item.categoria}
                  </span>
                  <h3 className="text-3xl text-[#2C3E50] tracking-tighter leading-none group-hover:italic group-hover:font-light transition-all">
                    {item.negocio}
                  </h3>
                  <p className="text-[10px] uppercase tracking-widest opacity-40 text-black italic">por {item.nome}</p>
                </div>

                <div className="relative pl-6 border-l border-black/5">
                  <p className="text-sm italic leading-relaxed opacity-60 text-black">
                    {item.frase}
                  </p>
                </div>

                {item.instagram && (
                  <a 
                    href={`https://instagram.com/${item.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-all pt-2"
                    style={{ color: azulPetroleo }}
                  >
                    <Instagram size={12} style={{ color: lavandaPrincipal }} /> {item.instagram}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        
        <section className="bg-white border border-black/5 p-12 md:p-20 text-center shadow-sm rounded-[3rem]">
          <div className="max-w-xl mx-auto space-y-8">
            <Star className="mx-auto opacity-20" size={32} style={{ color: lavandaPrincipal }} />
            <h2 className="text-5xl text-[#2C3E50] tracking-tight">Sua criatividade também <br/> <span className="italic font-light" style={{ color: lavandaPrincipal }}>tem lugar aqui.</span></h2>
            <p className="text-sm italic opacity-60 text-black leading-relaxed">
              Faz parte do clube e quer sua marca na vitrine? <br/> Venha tomar um café conosco e compartilhar sua história.
            </p>
            <div className="pt-6">
                <Button 
                className="text-white px-14 py-8 h-auto rounded-2xl font-bold uppercase text-[10px] tracking-[0.3em] shadow-lg hover:scale-[1.02] transition-all"
                style={{ backgroundColor: lavandaPrincipal }}
                >
                Falar com a Curadoria
                </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}