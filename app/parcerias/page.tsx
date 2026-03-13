"use client";

import React, { useEffect, useState } from 'react';
import { Instagram, Star, Heart, Coffee, Quote } from 'lucide-react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";

const papelEditorial = "#FDFCFB"; 
const rosaGabi = "#B04D4A";      
const azulPetroleo = "#2C3E50";   

interface Editora {
  nome: string;
  img: string;
  link: string;
  info: string;
}

export default function PaginaParceriasDNA() {
  const [editoras, setEditoras] = useState<Editora[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarAliados() {
      try {
        const res = await fetch('/api/parcerias');
        const data = await res.json();
        if (Array.isArray(data)) {
          const lista = data.map((p: any) => ({
            nome: p.name,
            img: p.imagem || '',
            link: p.link || '',
            info: p.description || '',
          }));
          setEditoras(lista);
        }
      } catch (err) {
        console.error("Erro ao carregar parceiros:", err);
      } finally {
        setLoading(false);
      }
    }
    carregarAliados();
  }, []);

  return (
    <div className="min-h-screen font-alice pb-32 relative overflow-hidden"
         style={{ background: `#FDFCFB url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')` }}>
      
      
      <header className="max-w-5xl mx-auto pt-32 pb-24 px-6 relative z-10 text-center border-b border-black/5">
        <div className="flex items-center justify-center gap-4 mb-8 opacity-40">
          <div className="h-[1px] w-10 bg-black" />
          <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-black italic">Caderno de Parcerias</span>
          <div className="h-[1px] w-10 bg-black" />
        </div>

        <h1 className="text-7xl md:text-[100px] text-[#2C3E50] tracking-tighter leading-[0.8] mb-10">
          Nossos <span style={{ color: rosaGabi }} className="italic font-light">Aliados</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-3xl mx-auto border-t border-black/10 pt-10">
          <p className="text-base leading-relaxed opacity-60 text-black italic">
            "Uma xícara de café e uma boa editora: o segredo para os encontros que transformam nossas tardes."
          </p>
          <div className="flex flex-col justify-end items-start md:items-end">
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-sans font-bold" style={{ color: rosaGabi }}>
              <Star size={14} /> Curadoria Ciclo 2026
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 relative z-10">
        
        {loading ? (
          <div className="text-center py-20 italic opacity-40 text-[#2C3E50]">Reunindo nossos parceiros...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {editoras.map((editora, idx) => (
              <article key={idx} className="group bg-white p-8 rounded-[3.5rem] border border-black/5 shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col items-center text-center space-y-6 hover:-translate-y-2">
                
                
                <div className="relative w-full aspect-square bg-[#FDFCFB] rounded-[3rem] overflow-hidden p-10 flex items-center justify-center border border-black/[0.03] transition-transform duration-700 group-hover:scale-95">
                  <Image 
                    src={editora.img} 
                    alt={editora.nome}
                    fill
                    className="object-contain p-8 transition-all duration-1000"
                  />
                </div>

                <div className="space-y-3 px-2">
                  <h3 className="text-2xl tracking-tighter text-[#2C3E50] font-medium">
                    {editora.nome}
                  </h3>
                  <p className="text-[12px] italic font-light leading-relaxed opacity-50 text-black">
                    {editora.info}
                  </p>
                </div>

                <a 
                  href={editora.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-[#FDFCFB] shadow-sm border border-black/5 hover:scale-110 transition-all active:scale-90"
                >
                  <Instagram size={16} style={{ color: rosaGabi }} />
                </a>
              </article>
            ))}
          </div>
        )}

        
        <section className="mt-48 max-w-4xl mx-auto">
           <div className="bg-white rounded-[5rem] p-16 md:p-24 border border-black/5 text-center space-y-10 shadow-[0_40px_100px_-20px_rgba(176,74,90,0.12)] relative">
              
              <div className="space-y-4">
                <Coffee size={32} className="mx-auto opacity-10" style={{ color: rosaGabi }} />
                <h4 className="text-5xl md:text-6xl italic font-light tracking-tight text-[#2C3E50]">
                  Vamos tomar um <span style={{ color: rosaGabi }} className="not-italic font-normal">café?</span>
                </h4>
              </div>

              <p className="text-xl italic max-w-lg mx-auto leading-relaxed opacity-60 text-black">
                O Clube das Leitoras é uma rede viva. Se sua marca ou editora acredita no poder da partilha, nosso jornal está sempre aberto.
              </p>

              <Button 
                 asChild
                 className="h-20 px-12 text-white rounded-[2rem] font-bold uppercase text-[10px] tracking-[0.5em] transition-all hover:scale-105 active:scale-95 shadow-xl shadow-[#B04D4A]/20"
                 style={{ backgroundColor: rosaGabi }}
              >
                <a href="mailto:clubedasleitorasbsb@gmail.com">Falar com a Gabi</a>
              </Button>
           </div>
        </section>

      </main>

      <footer>
      </footer>
    </div>
  );
}