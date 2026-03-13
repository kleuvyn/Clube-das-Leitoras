"use client";

import React, { useEffect, useState } from 'react';
import { Instagram, BookOpen, ShoppingCart, Globe, Quote, Feather, Star, ArrowLeft } from "lucide-react";

const rosaPrincipal = "#C47E8A";
const marromTerra = "#4A3F35";

interface Escritora {
  id: string;
  nome: string;
  livroTitulo: string;
  genero?: string | null;
  sinopse?: string | null;
  instagram?: string | null;
  linkCompra?: string | null;
  capaUrl?: string | null;
  site?: string | null;
  bio?: string | null;
}

const bgStyle = { background: `#FDFCFB url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')` };

export default function EscritorasPage() {
  const [escritoras, setEscritoras] = useState<Escritora[]>([]);
  const [loading, setLoading] = useState(true);
  const [ativa, setAtiva] = useState<Escritora | null>(null);

  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch('/api/escritoras');
        const data = await res.json();
        setEscritoras(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erro ao carregar escritoras:", err);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  /* ─── VISTA DETALHE ─── */
  if (ativa) {
    return (
      <div className="min-h-screen font-alice pb-40 relative overflow-hidden" style={bgStyle}>
        <header className="max-w-7xl mx-auto pt-32 pb-8 px-6 border-b border-black/5">
          <button
            onClick={() => setAtiva(null)}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft size={13} /> Voltar às escritoras
          </button>
        </header>

        <main className="max-w-7xl mx-auto px-6 pt-16">
          <div className="grid lg:grid-cols-12 gap-16 items-start">

            {/* Sidebar esquerda — lista */}
            <aside className="lg:col-span-3 border-r border-black/5 pr-8 space-y-2">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-30 text-black mb-6">
                Escritoras do Clube
              </p>
              {escritoras.map(e => {
                const isAtiva = ativa.id === e.id;
                return (
                  <button
                    key={e.id}
                    onClick={() => setAtiva(e)}
                    className={`w-full text-left transition-all duration-300 py-4 border-b border-black/5 ${
                      isAtiva ? 'opacity-100 translate-x-1' : 'opacity-40 hover:opacity-70'
                    }`}
                  >
                    <span className="text-[8px] font-bold uppercase tracking-widest text-black block mb-1 opacity-60">
                      {e.genero}
                    </span>
                    <span
                      className="text-base italic block leading-tight"
                      style={{ color: isAtiva ? rosaPrincipal : 'black' }}
                    >
                      {e.livroTitulo}
                    </span>
                    <span className="text-[8px] opacity-40 block mt-1">por {e.nome}</span>
                  </button>
                );
              })}
            </aside>

            {/* Centro — detalhe */}
            <article className="lg:col-span-6 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  {ativa.genero && (
                    <span
                      className="text-[9px] font-bold uppercase tracking-[0.4em] px-3 py-1 border border-black/10 rounded-full"
                      style={{ color: rosaPrincipal }}
                    >
                      {ativa.genero}
                    </span>
                  )}
                  <span className="text-[9px] font-bold uppercase tracking-[0.4em] px-3 py-1 border border-black/20 rounded-full text-slate-500">
                    por {ativa.nome}
                  </span>
                </div>
                <h2 className="text-6xl md:text-7xl text-[#2C3E50] tracking-tighter leading-[0.9]">
                  {ativa.livroTitulo}
                </h2>
              </div>

              {ativa.capaUrl && (
                <div className="relative group max-w-xs">
                  <div className="bg-white p-4 shadow-xl border border-black/5 -rotate-1 group-hover:rotate-0 transition-transform duration-700">
                    <img
                      src={ativa.capaUrl}
                      alt={ativa.livroTitulo}
                      style={{ width: '100%', height: 'auto' }}
                      className="rounded-sm"
                    />
                    <div className="mt-3 pt-3 border-t border-black/5">
                      <span className="text-[8px] font-bold uppercase tracking-[0.3em] opacity-25 block text-center italic">
                        {ativa.nome} · {new Date().getFullYear()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {ativa.bio && (
                <div className="pt-4 border-t border-black/5">
                  <p className="text-base leading-relaxed opacity-60 text-black">{ativa.bio}</p>
                </div>
              )}

              {ativa.sinopse && (
                <div className="relative pl-6 border-l-2 border-black/5">
                  <Quote size={14} className="absolute -left-1 top-0 opacity-20" style={{ color: rosaPrincipal }} />
                  <p className="text-xl italic leading-relaxed opacity-60 text-black">
                    &ldquo;{ativa.sinopse}&rdquo;
                  </p>
                </div>
              )}
            </article>

            {/* Sidebar direita — info */}
            <aside className="lg:col-span-3 space-y-8">
              <section className="bg-white p-8 border border-black/5 shadow-sm rounded-2xl">
                <h4 className="text-[9px] font-bold uppercase tracking-widest mb-6 opacity-30 text-black">
                  Sobre a Autora
                </h4>
                <div className="space-y-5 text-sm italic opacity-60 text-black">
                  {ativa.nome && (
                    <div className="flex items-start gap-4">
                      <Feather size={15} style={{ color: rosaPrincipal }} className="opacity-70 mt-0.5 shrink-0" />
                      <span>{ativa.nome}</span>
                    </div>
                  )}
                  {ativa.genero && (
                    <div className="flex items-start gap-4">
                      <BookOpen size={15} style={{ color: rosaPrincipal }} className="opacity-70 mt-0.5 shrink-0" />
                      <span>{ativa.genero}</span>
                    </div>
                  )}
                  {ativa.instagram && (
                    <div className="flex items-center gap-4">
                      <Instagram size={15} style={{ color: rosaPrincipal }} className="opacity-70 shrink-0" />
                      <a
                        href={`https://instagram.com/${ativa.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:opacity-100 transition-opacity underline underline-offset-2"
                      >
                        {ativa.instagram}
                      </a>
                    </div>
                  )}
                  {ativa.site && (
                    <div className="flex items-center gap-4">
                      <Globe size={15} style={{ color: rosaPrincipal }} className="opacity-70 shrink-0" />
                      <a
                        href={ativa.site}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:opacity-100 transition-opacity underline underline-offset-2 break-all"
                      >
                        Site / Blog
                      </a>
                    </div>
                  )}
                </div>
              </section>

              {ativa.linkCompra && (
                <a
                  href={ativa.linkCompra}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-white text-[10px] font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
                  style={{ backgroundColor: rosaPrincipal }}
                >
                  <ShoppingCart size={13} /> Onde Comprar
                </a>
              )}
            </aside>

          </div>
        </main>
      </div>
    );
  }

  /* ─── VISTA LISTA ─── */
  return (
    <div
      className="min-h-screen font-alice pb-40 relative overflow-hidden"
      style={bgStyle}
    >
      
      <header className="max-w-5xl mx-auto pt-32 pb-24 px-6 text-center border-b border-black/5">
        <div className="flex items-center justify-center gap-4 mb-8 opacity-40">
          <div className="h-[1px] w-10 bg-black" />
          <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-black italic">
            Brasília • Palavras que Florescem
          </span>
          <div className="h-[1px] w-10 bg-black" />
        </div>

        <h1 className="text-7xl md:text-[90px] text-[#4A3F35] tracking-tighter leading-[0.85] mb-10">
          Escritoras{" "}
          <span style={{ color: rosaPrincipal }} className="italic font-light">
            do Clube
          </span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-3xl mx-auto border-t border-black/10 pt-10">
          <p className="text-base leading-relaxed opacity-60 text-black italic">
            "Um espaço dedicado às leitoras que também são autoras. Aqui, cada livro carrega a alma de quem o escreveu e o amor de quem o leu."
          </p>
          <div className="flex flex-col justify-end items-start md:items-end">
            <div
              className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-sans font-bold"
              style={{ color: rosaPrincipal }}
            >
              <Feather size={14} /> Apoie Autoras Locais
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-24 space-y-48">
        {loading ? (
          <div className="text-center py-20 italic opacity-40 text-black animate-pulse">
            Abrindo as páginas...
          </div>
        ) : escritoras.length === 0 ? (
          <div className="text-center py-24 space-y-4">
            <BookOpen size={48} className="mx-auto opacity-20" style={{ color: rosaPrincipal }} />
            <p className="italic opacity-40 text-black text-lg">
              Em breve, as histórias das nossas escritoras estarão aqui.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-16 gap-y-24">
            {escritoras.map((item, idx) => (
              <div
                key={item.id || idx}
                className="group space-y-6 cursor-pointer"
                onClick={() => setAtiva(item)}
              >
                
                <div className="relative">
                  {item.capaUrl ? (
                    <div className="relative w-36 h-52 shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:-rotate-1">
                      <img
                        src={item.capaUrl}
                        alt={`Capa de ${item.livroTitulo}`}
                        className="w-full h-full object-cover rounded-sm"
                      />
                      <div
                        className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-all duration-500"
                        style={{ boxShadow: `4px 4px 0 ${rosaPrincipal}40` }}
                      />
                    </div>
                  ) : (
                    <div
                      className="relative w-36 h-52 flex items-center justify-center rounded-sm border border-black/10 group-hover:border-black/20 transition-all"
                      style={{ backgroundColor: `${rosaPrincipal}15` }}
                    >
                      <BookOpen size={32} className="opacity-30" style={{ color: rosaPrincipal }} />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {item.genero && (
                    <span
                      className="text-[9px] font-bold uppercase tracking-[0.3em]"
                      style={{ color: rosaPrincipal }}
                    >
                      {item.genero}
                    </span>
                  )}
                  <h3 className="text-3xl text-[#2C3E50] tracking-tighter leading-none group-hover:italic group-hover:font-light transition-all">
                    {item.livroTitulo}
                  </h3>
                  <p className="text-[10px] uppercase tracking-widest opacity-40 text-black italic">
                    por {item.nome}
                  </p>
                </div>

                {item.bio && (
                  <p className="text-sm opacity-50 text-black leading-relaxed line-clamp-3">
                    {item.bio}
                  </p>
                )}

                <span
                  className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.3em] opacity-0 group-hover:opacity-60 transition-all"
                  style={{ color: rosaPrincipal }}
                >
                  Ver detalhes →
                </span>
              </div>
            ))}
          </div>
        )}

        
        <section className="bg-white border border-black/5 p-12 md:p-20 text-center shadow-sm rounded-[3rem]">
          <div className="max-w-xl mx-auto space-y-8">
            <Star className="mx-auto opacity-20" size={32} style={{ color: rosaPrincipal }} />
            <h2 className="text-5xl text-[#2C3E50] tracking-tight">
              Você também{" "}
              <br />
              <span className="italic font-light" style={{ color: rosaPrincipal }}>
                escreve?
              </span>
            </h2>
            <p className="text-sm italic opacity-60 text-black leading-relaxed">
              Se você faz parte do clube e já publicou ou está escrevendo um livro,
              <br />
              queremos divulgar sua obra aqui. Venha compartilhar sua história com a gente!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <a
                href="mailto:clubedasleitorasbsb@gmail.com?subject=Quero%20divulgar%20meu%20livro&body=Ol%C3%A1%2C%20sou%20escritora%20e%20gostaria%20de%20divulgar%20meu%20livro%20no%20Clube%20das%20Leitoras!"
                className="inline-flex items-center gap-2 text-white px-14 py-5 rounded-2xl font-bold uppercase text-[10px] tracking-[0.3em] shadow-lg hover:scale-[1.02] transition-all"
                style={{ backgroundColor: rosaPrincipal }}
              >
                <Feather size={14} /> Quero Divulgar Meu Livro
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

