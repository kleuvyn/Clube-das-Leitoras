"use client";

import React, { useEffect, useState } from 'react';
import { 
  Instagram, ShoppingBag, Star, Feather, X 
} from "lucide-react"; 

const lavandaPrincipal = "#967BB6";
const azulPetroleo = "#2C3E50";

const CATEGORIAS = [
  "Bordado", "Tecido", "Crochê", "Macramê", "Saúde", "Bem-Estar",
  "Literatura", "Escrita", "Arte", "Papelaria", "Presentes",
  "Beleza", "Estilo", "Serviços Profissionais", "Gestão",
  "Fotografia", "Arquitetura", "Design", "Gastronomia",
  "Viagens", "Pets", "Outros"
];

interface Empreendedora {
  id: number;
  nome: string;
  negocio: string;
  categoria: string;
  instagram?: string;
  frase: string;
  fotoUrl?: string;
}

export default function VitrineEmpreendedoras() {
  const [empreendedoras, setEmpreendedoras] = useState<Empreendedora[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>("Todas");
  const [showFiltro, setShowFiltro] = useState(false);

  useEffect(() => {
    async function carregarVitrine() {
      try {
        const res = await fetch('/api/empreendedoras');
        const data = await res.json();
        setEmpreendedoras(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erro ao carregar vitrine:", err);
      } finally {
        setLoading(false);
      }
    }
    carregarVitrine();
  }, []);

  const filtradas = empreendedoras.filter(
    item => categoriaSelecionada === "Todas" || item.categoria === categoriaSelecionada
  );

  return (
    <div className="min-h-screen font-alice pb-40 relative overflow-hidden"
         style={{ background: `#FDFCFB url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')` }}>
      
      {/* HEADER EDITORIAL */}
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

      <main className="max-w-7xl mx-auto px-6 pt-16">
        
        {/* FILTRO REFINADO */}
        <div className="mb-20">
          <div className="flex items-center justify-between border-b border-black/5 pb-4">
            <button
              onClick={() => setShowFiltro(!showFiltro)}
              className="group flex items-center gap-4 text-[11px] uppercase tracking-[0.4em] text-black transition-all duration-500"
            >
              <div className="relative flex items-center justify-center">
                 <Feather 
                  size={16} 
                  className={`transition-all duration-700 ${showFiltro ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`} 
                  style={{ color: lavandaPrincipal }} 
                />
                <X 
                  size={16} 
                  className={`absolute transition-all duration-700 ${showFiltro ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}`} 
                />
              </div>
              <span className="group-hover:tracking-[0.5em] transition-all">
                {showFiltro ? "Recolher Índice" : `Explorar: ${categoriaSelecionada}`}
              </span>
            </button>

            {categoriaSelecionada !== "Todas" && (
              <button 
                onClick={() => setCategoriaSelecionada("Todas")}
                className="text-[9px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity border-b border-black/20"
              >
                Limpar Filtro
              </button>
            )}
          </div>

          {/* Área de Categorias em Grade Minimalista */}
          <div className={`grid transition-all duration-700 ease-in-out ${showFiltro ? 'grid-rows-[1fr] opacity-100 mt-12' : 'grid-rows-[0fr] opacity-0 mt-0'} overflow-hidden`}>
            <div className="min-h-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-8 pb-16">
                <button
                  onClick={() => { setCategoriaSelecionada("Todas"); setShowFiltro(false); }}
                  className={`group flex flex-col items-start gap-2 transition-all`}
                >
                  <span className={`text-[10px] uppercase tracking-[0.2em] transition-all ${categoriaSelecionada === "Todas" ? "text-black font-bold" : "text-black/30 group-hover:text-black"}`}>
                    Todas as Marcas
                  </span>
                  <div className={`h-[1px] bg-[#967BB6] transition-all duration-500 ${categoriaSelecionada === "Todas" ? "w-full" : "w-0 group-hover:w-8"}`} />
                </button>

                {CATEGORIAS.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setCategoriaSelecionada(cat); setShowFiltro(false); }}
                    className="group flex flex-col items-start gap-2 transition-all"
                  >
                    <span className={`text-left text-[10px] uppercase tracking-[0.2em] transition-all ${categoriaSelecionada === cat ? "text-black font-bold" : "text-black/30 group-hover:text-black"}`}>
                      {cat}
                    </span>
                    <div className={`h-[1px] bg-[#967BB6] transition-all duration-500 ${categoriaSelecionada === cat ? "w-full" : "w-0 group-hover:w-8"}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* VITRINE / GRID */}
        {loading ? (
          <div className="text-center py-40 italic opacity-40 text-black animate-pulse tracking-widest text-xs uppercase">Sintonizando afetos...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-12 gap-y-24 mb-48 transition-all duration-700">
            {filtradas.length > 0 ? (
              filtradas.map((item, idx) => (
                <div key={item.id || idx} className="group space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${idx * 50}ms` }}>
                  {/* Foto com Zoom no Hover */}
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border border-black/5 rounded-full rotate-6 group-hover:rotate-12 transition-all duration-700" />
                    <div className="absolute inset-0 rounded-full overflow-hidden flex items-center justify-center bg-white border border-black/5 shadow-sm">
                      {item.fotoUrl ? (
                        <img src={item.fotoUrl} alt={item.negocio} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                      ) : (
                        <span className="text-xl italic opacity-40" style={{ color: lavandaPrincipal }}>
                          {item.nome?.charAt(0) || "C"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: lavandaPrincipal }}>
                      {item.categoria}
                    </span>
                    <h3 className="text-3xl text-[#2C3E50] tracking-tighter leading-none group-hover:italic group-hover:font-light transition-all duration-500">
                      {item.negocio}
                    </h3>
                    <p className="text-[10px] uppercase tracking-widest opacity-40 text-black italic">por {item.nome}</p>
                  </div>

                  <div className="relative pl-6 border-l border-black/5">
                    <p className="text-sm italic leading-relaxed opacity-60 text-black">
                      "{item.frase}"
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
              ))
            ) : (
              <div className="col-span-full text-center py-20 italic opacity-40 text-black">Ainda não temos curadoria para esta categoria.</div>
            )}
          </div>
        )}

        {/* FOOTER CTA */}
        <section className="bg-white border border-black/5 p-12 md:p-24 text-center shadow-sm rounded-[3rem] mb-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
            <Star size={120} />
          </div>
          <div className="max-w-xl mx-auto space-y-8 relative z-10">
            <Star className="mx-auto opacity-20" size={32} style={{ color: lavandaPrincipal }} />
            <h2 className="text-5xl text-[#2C3E50] tracking-tight">
              Sua criatividade também <br/> 
              <span className="italic font-light" style={{ color: lavandaPrincipal }}>tem lugar aqui.</span>
            </h2>
            <p className="text-sm italic opacity-60 text-black leading-relaxed">
              Faz parte do clube e quer sua marca na vitrine? <br/> Venha tomar um café conosco e compartilhar sua história.
            </p>
            <div className="pt-6">
              <a
                href="mailto:clubedasleitorasbsb@gmail.com?subject=Quero%20divulgar%20meu%20empreendimento"
                className="inline-flex items-center gap-2 text-white px-14 py-5 rounded-2xl font-bold uppercase text-[10px] tracking-[0.3em] shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                style={{ backgroundColor: lavandaPrincipal }}
              >
                Falar com a Curadoria
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}