"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Instagram, Star, Heart, Coffee, Quote, X, Globe } from 'lucide-react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { uploadFile } from '@/lib/upload-client';

const bgEditorial = "#FAFAF5"; 
const textoEscuro = "#4A443F";      
const corDestaque = "#8C7B6E";   

interface Editora {
  nome: string;
  img: string;
  link: string;
  website?: string;
  coupon?: string;
  info: string;
}

export default function PaginaParceriasDNA() {
  const [editoras, setEditoras] = useState<Editora[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0, hasMore: false });
  const limit = 12;

  const [parceriaModalOpen, setParceriaModalOpen] = useState(false);
  const [parceriaNome, setParceriaNome] = useState(''); // Nova Aliança
  const [parceriaTelefone, setParceriaTelefone] = useState('');
  const [parceriaEmail, setParceriaEmail] = useState('');
  const [parceriaSite, setParceriaSite] = useState('');
  const [parceriaEditora, setParceriaEditora] = useState('');
  const [parceriaDescricao, setParceriaDescricao] = useState('');
  const [parceriaLink, setParceriaLink] = useState(''); // Link / Instagram
  const [parceriaLogoUrl, setParceriaLogoUrl] = useState('');
  const [parceriaUploadingLogo, setParceriaUploadingLogo] = useState(false);
  const parceriaLogoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.body.style.overflow = parceriaModalOpen ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [parceriaModalOpen]);
  const [parceriaEnviando, setParceriaEnviando] = useState(false);
  const [parceriaEnviado, setParceriaEnviado] = useState(false);

  useEffect(() => {
    async function carregarParceiras() {
      setLoading(true);
      try {
        const res = await fetch(`/api/parcerias?page=${page}&limit=${limit}`, { cache: 'no-store' });
        const data = await res.json();
        if (Array.isArray(data?.data)) {
          const lista = data.data.map((p: any) => ({
            nome: p.name,
            img: p.imagem || '',
            link: p.link || '',
            website: p.website || '',
            coupon: p.coupon || '',
            info: p.description || '',
          }));
          setEditoras(lista);
          setPagination(data.pagination || { total: 0, pages: 0, hasMore: false });
        }
      } catch (err) {
        console.error("Erro ao carregar parceiras:", err);
      } finally {
        setLoading(false);
      }
    }
    carregarParceiras();
  }, [page]);

  return (
    <div className="min-h-screen font-serif pb-32 relative overflow-hidden" style={{ background: `#FDFCFB url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')` }}>
      
      <header className="max-w-5xl mx-auto pt-32 pb-24 px-6 relative z-10 text-center border-b border-black/5">
        <div className="flex items-center justify-center gap-4 mb-8 opacity-40">
          <div className="h-px w-10 bg-[#8C7B6E]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-[#8C7B6E] italic">Caderno de Parcerias</span>
          <div className="h-px w-10 bg-[#8C7B6E]" />
        </div>

        <h1 className="text-7xl md:text-[100px] text-[#4A443F] tracking-tighter leading-[0.8] mb-10">
          Nossas <span style={{ color: corDestaque }} className="italic font-light">parceiras</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-3xl mx-auto border-t border-black/10 pt-10">
          <p className="text-base leading-relaxed opacity-80 text-[#4A443F] italic">
            "Uma xícara de café e uma boa editora: o segredo para os encontros que transformam nossas tardes."
          </p>
          <div className="flex flex-col justify-end items-start md:items-end">
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-sans font-bold" style={{ color: corDestaque }}>
              <Star size={14} /> Curadoria Ciclo 2026
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 relative z-10">
        
        {loading ? (
          <div className="text-center py-20 italic opacity-40 text-[#4A443F]">Reunindo nossas parceiras...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {editoras.map((editora, idx) => (
              <article key={idx} className="group flex flex-col bg-white border border-[#E5E0D8] rounded-[2rem] overflow-hidden hover:shadow-[0_20px_60px_-15px_rgba(140,123,110,0.15)] transition-all duration-700 hover:-translate-y-2">
                
                {/* Cabeçalho do Card (Logo em Fundo Acetinado) */}
                <div className="relative w-full h-56 bg-[#FAFAF5] flex items-center justify-center border-b border-[#E5E0D8]/60 p-8">
                  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pointer-events-none" />
                  <div className="relative w-32 h-32 md:w-40 md:h-40 bg-white rounded-full p-4 shadow-sm border border-[#E5E0D8] flex items-center justify-center overflow-hidden transition-transform duration-700 group-hover:scale-105 group-hover:shadow-md">
                    <Image 
                      src={editora.img} 
                      alt={editora.nome}
                      fill
                      className="object-contain p-4"
                    />
                  </div>
                </div>

                {/* Corpo (Jornal Editorial) */}
                <div className="flex-1 flex flex-col p-8 md:p-10 bg-white relative">
                  
                  {/* Decoração superior */}
                  <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-[#8C7B6E]/20 to-transparent" />
                  
                  <div className="text-center mb-6">
                    <h3 className="text-3xl tracking-tighter text-[#4A443F] font-serif italic mb-3">
                      {editora.nome}
                    </h3>
                    <p className="text-[13px] font-sans font-light leading-relaxed text-[#4A443F]/70">
                      {editora.info}
                    </p>
                  </div>

                  <div className="flex-1" />

                  {/* Detalhes (Cupom & Site) em caixas texturizadas */}
                  <div className="space-y-3 mt-6">
                    {editora.coupon && (
                      <div className="bg-[#FAFAF5] border border-dashed border-[#8C7B6E]/30 rounded-xl p-4 flex flex-col items-center justify-center gap-1 group-hover:border-[#8C7B6E]/60 transition-colors relative overflow-hidden">
                        <span className="text-[8px] uppercase tracking-[0.4em] font-bold text-[#8C7B6E]/60 block relative z-10">cupom exclusivo</span>
                        <div className="flex items-center gap-2 relative z-10 pt-1">
                          <Star size={12} className="text-[#8C7B6E]" />
                          <span className="text-sm font-sans font-bold tracking-[0.2em] text-[#4A443F] select-all">{editora.coupon}</span>
                          <Star size={12} className="text-[#8C7B6E]" />
                        </div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-[#4A443F]/60 mt-2">ativo no checkout</p>
                      </div>
                    )}

                    {(editora.website || editora.link) && (
                      <div className="flex items-center justify-center gap-4 pt-4 border-t border-[#E5E0D8]/60 mt-4">
                        {editora.website && (
                          <a href={editora.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#4A443F]/70 hover:text-[#8C7B6E] transition-colors px-4 py-2 rounded-full hover:bg-[#FAFAF5] border border-transparent hover:border-[#E5E0D8]">
                            <Globe size={14} className="text-[#8C7B6E]" />
                            <span className="text-[9px] uppercase tracking-[0.3em] font-bold mt-[2px]">acessar o site</span>
                          </a>
                        )}
                        {editora.link && (
                          <a href={editora.link} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex items-center justify-center p-3 rounded-full bg-[#FAFAF5] text-[#8C7B6E] hover:bg-[#F3EDE8] hover:text-[#744E44] border border-[#E5E0D8] transition-all shadow-sm">
                            <Instagram size={16} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>

              </article>
            ))}
          </div>
        )}

        {!loading && pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-6 mt-12">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-6 py-2 rounded-lg font-bold uppercase text-[10px] tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ backgroundColor: page === 1 ? '#ddd' : rosaGabi, color: 'white' }}
            >
              ← Anterior
            </button>
            <span className="text-sm text-slate-500 italic">Página {page} de {pagination.pages}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!pagination.hasMore}
              className="px-6 py-2 rounded-lg font-bold uppercase text-[10px] tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ backgroundColor: !pagination.hasMore ? '#ddd' : rosaGabi, color: 'white' }}
            >
              Próxima →
            </button>
          </div>
        )}

        <section className="mt-40 max-w-4xl mx-auto px-4">
           <div className="bg-white rounded-3xl p-16 md:p-24 border border-[#E5E0D8] text-center space-y-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 pointer-events-none">
                <Coffee size={120} />
              </div>

              <div className="space-y-4 relative z-10">
                <Coffee size={28} className="mx-auto opacity-20" style={{ color: corDestaque }} />
                <h4 className="text-4xl md:text-5xl italic font-serif tracking-tight text-[#4A443F]">
                  Vamos tomar um <span style={{ color: corDestaque }} className="not-italic font-normal">café?</span>
                </h4>
              </div>

              <p className="text-sm md:text-base italic max-w-md mx-auto leading-relaxed opacity-80 text-[#4A443F] relative z-10">
                O Clube das Leitoras é uma rede viva. Se sua marca ou editora acredita no poder da partilha, nosso jornal está sempre aberto.
              </p>

              <Button 
                 onClick={() => setParceriaModalOpen(true)}
                 className="mt-4 h-14 w-full max-w-[240px] mx-auto px-8 bg-transparent text-[#4A443F] border border-[#E5E0D8] rounded-xl font-bold uppercase text-[9px] tracking-[0.3em] transition-all hover:bg-[#FAFAF5] hover:border-[#8C7B6E]/30 relative z-10"
              >
                falar com a gabi
              </Button>
           </div>
        </section>

        {/* ─── MODAL REFINADO ─── */}
        {parceriaModalOpen && (
          <div className="fixed inset-0 z-[1000000] flex items-start md:items-center justify-center p-4 pt-24 md:pt-20 overflow-y-auto">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setParceriaModalOpen(false)} />
            
            <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[95vh] mt-20 md:mt-0 border border-[#E5E0D8]">
              <button onClick={() => setParceriaModalOpen(false)} className="absolute right-4 top-4 p-2 hover:bg-black/5 rounded-full transition-colors z-10">
                <X size={20} className="opacity-40" />
              </button>

              <div className="grid md:grid-cols-5 min-h-[80vh] max-h-[95vh] overflow-hidden">
                {/* Coluna Lateral Editorial */}
                <div className="hidden md:flex md:col-span-2 bg-[#FAFAF5] p-12 flex-col justify-between border-r border-[#E5E0D8]">
                  <div className="space-y-8">
                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center border border-[#E5E0D8]">
                       <Coffee size={24} style={{ color: corDestaque }} />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-4xl font-serif italic leading-tight text-[#4A443F]">Nova <br/>Aliada</h3>
                      <div className="h-px w-12 bg-[#8C7B6E]" />
                      <p className="text-[10px] text-[#4A443F]/70 leading-relaxed uppercase tracking-[0.2em] font-bold">
                        Buscamos conexões que compartilham o propósito de florescer a literatura feminina.
                      </p>
                    </div>
                  </div>
                  <div className="text-[9px] uppercase tracking-[0.4em] opacity-30 italic font-bold text-[#4A443F]">
                    DNA Club • Parcerias 2026
                  </div>
                </div>

                {/* Coluna do Formulário */}
                <div className="md:col-span-3 p-6 md:p-14 overflow-y-auto max-h-[90vh]">
                  {parceriaEnviado ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20">
                      <div className="w-16 h-16 bg-[#FAFAF5] border border-[#E5E0D8] rounded-full flex items-center justify-center">
                        <Heart size={24} className="text-[#8C7B6E] animate-pulse" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-3xl font-serif italic text-[#4A443F]">Proposta Recebida!</h4>
                        <p className="text-sm text-[#4A443F]/60 max-w-xs mx-auto">A Gabi recebeu seu convite. Em breve, prepararemos o café para essa conversa.</p>
                      </div>
                      <button onClick={() => { setParceriaModalOpen(false); setParceriaEnviado(false); }} className="text-[10px] uppercase tracking-widest font-bold opacity-60 text-[#4A443F] hover:opacity-100 hover:text-[#8C7B6E] underline underline-offset-8 transition-colors">Voltar ao caderno</button>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <header className="space-y-2">
                        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#8C7B6E]">Nova Aliança</span>
                        <h2 className="text-2xl text-[#4A443F] font-serif italic tracking-tight">Cadastre sua parceria</h2>
                      </header>

                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-4">
                        <div className="group space-y-1">
                          <label className="text-[9px] uppercase tracking-widest font-bold opacity-40 text-[#4A443F]">Nome</label>
                          <input value={parceriaNome} onChange={e => setParceriaNome(e.target.value)} className="w-full bg-transparent border-b border-[#E5E0D8] py-2 focus:border-[#8C7B6E] outline-none transition-colors text-sm text-[#4A443F]" />
                        </div>

                        <div className="group space-y-1">
                          <label className="text-[9px] uppercase tracking-widest font-bold opacity-40 text-[#4A443F]">Telefone</label>
                          <input value={parceriaTelefone} onChange={e => setParceriaTelefone(e.target.value)} placeholder="(61) 9xxxx-xxxx" className="w-full bg-transparent border-b border-[#E5E0D8] py-2 focus:border-[#8C7B6E] outline-none transition-colors text-sm text-[#4A443F] placeholder:text-[#4A443F]/20" />
                        </div>

                        <div className="group space-y-1">
                          <label className="text-[9px] uppercase tracking-widest font-bold opacity-40 text-[#4A443F]">E-mail</label>
                          <input value={parceriaEmail} onChange={e => setParceriaEmail(e.target.value)} placeholder="nome@seuevento.com" className="w-full bg-transparent border-b border-[#E5E0D8] py-2 focus:border-[#8C7B6E] outline-none transition-colors text-sm text-[#4A443F] placeholder:text-[#4A443F]/20" />
                        </div>

                        <div className="group space-y-1">
                          <label className="text-[9px] uppercase tracking-widest font-bold opacity-40 text-[#4A443F]">Site</label>
                          <input value={parceriaSite} onChange={e => setParceriaSite(e.target.value)} placeholder="https://..." className="w-full bg-transparent border-b border-[#E5E0D8] py-2 focus:border-[#8C7B6E] outline-none transition-colors text-sm text-[#4A443F] placeholder:text-[#4A443F]/20" />
                        </div>

                        <div className="group space-y-1">
                          <label className="text-[9px] uppercase tracking-widest font-bold opacity-40 text-[#4A443F]">Nome da Editora</label>
                          <input value={parceriaEditora} onChange={e => setParceriaEditora(e.target.value)} className="w-full bg-transparent border-b border-[#E5E0D8] py-2 focus:border-[#8C7B6E] outline-none transition-colors text-sm text-[#4A443F]" />
                        </div>

                        <div className="group space-y-1 mt-2">
                          <label className="text-[9px] uppercase tracking-widest font-bold opacity-40 text-[#4A443F]">Descrição</label>
                          <textarea value={parceriaDescricao} onChange={e => setParceriaDescricao(e.target.value)} className="w-full bg-[#FAFAF5] border border-[#E5E0D8] rounded-xl p-4 text-sm focus:ring-1 focus:ring-[#8C7B6E] focus:border-[#8C7B6E] outline-none min-h-30 text-[#4A443F]" />
                        </div>

                        <div className="group space-y-1 mt-2">
                          <label className="text-[9px] uppercase tracking-widest font-bold opacity-40 text-[#4A443F]">Link / Instagram</label>
                          <input value={parceriaLink} onChange={e => setParceriaLink(e.target.value)} placeholder="https://..." className="w-full bg-transparent border-b border-[#E5E0D8] py-2 focus:border-[#8C7B6E] outline-none transition-colors text-sm text-[#4A443F] placeholder:text-[#4A443F]/20" />
                        </div>

                        <div className="group space-y-1 mt-2">
                          <label className="text-[9px] uppercase tracking-widest font-bold opacity-40 text-[#4A443F]">Logo / Identidade Visual</label>
                          <div className="flex items-center gap-4 mt-2">
                            <button
                              type="button"
                              onClick={() => parceriaLogoInputRef.current?.click()}
                              disabled={parceriaUploadingLogo}
                              className="inline-flex items-center justify-center rounded-xl border border-[#E5E0D8] bg-[#FAFAF5] px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-[#4A443F] transition-all hover:bg-white hover:border-[#8C7B6E] disabled:cursor-wait disabled:opacity-50"
                            >
                              {parceriaUploadingLogo ? 'Carregando...' : 'Anexar Logo'}
                            </button>
                            {parceriaLogoUrl && (
                              <span className="text-[10px] text-[#8C7B6E] italic flex-1 truncate">Arquivo anexado ✓</span>
                            )}
                          </div>
                          <input
                            type="file"
                            ref={parceriaLogoInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setParceriaUploadingLogo(true);
                              try {
                                const url = await uploadFile(file);
                                setParceriaLogoUrl(url);
                              } catch (err: any) {
                                alert(err?.message || 'Erro ao enviar logo.');
                              } finally {
                                setParceriaUploadingLogo(false);
                                if (parceriaLogoInputRef.current) parceriaLogoInputRef.current.value = '';
                              }
                            }}
                          />
                        </div>
                      </div>
                      </div>

                      <button
                        onClick={async () => {
                          if (!parceriaNome || !parceriaTelefone || !parceriaEmail || !parceriaSite || !parceriaEditora || !parceriaDescricao || !parceriaLink) {
                            toast.error('Preencha todos os campos obrigatórios.');
                            return;
                          }
                          setParceriaEnviando(true);
                          try {
                            const response = await fetch('/api/solicitacoes', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                tipo: 'parceria',
                                nome: parceriaNome,
                                email: parceriaEmail || 'nao-informado@clube.com',
                                telefone: parceriaTelefone,
                                site: parceriaSite,
                                editora: parceriaEditora,
                                descricao: parceriaDescricao,
                                linkInstagram: parceriaLink,
                                logoUrl: parceriaLogoUrl || null,
                                mensagem: `${parceriaDescricao}`,
                              }),
                            });
                            const data = await response.json().catch(() => ({}));
                            if (!response.ok) {
                              const message = data?.error || 'Erro ao enviar.';
                              toast.error(message);
                              return;
                            }
                            setParceriaEnviado(true);
                            toast.success('Formulário enviado!');
                            setParceriaNome('');
                            setParceriaTelefone('');
                            setParceriaEmail('');
                            setParceriaSite('');
                            setParceriaEditora('');
                            setParceriaDescricao('');
                            setParceriaLink('');
                            setParceriaLogoUrl('');
                          } catch (error) {
                            toast.error('Erro ao enviar.');
                          } finally {
                            setParceriaEnviando(false);
                          }
                        }}
                        disabled={parceriaEnviando}
                        className="w-full bg-[#4A443F] text-white py-4 rounded-xl font-bold uppercase text-[9px] tracking-[0.4em] hover:bg-[#8C7B6E] transition-all disabled:opacity-50 mt-4"
                      >
                        {parceriaEnviando ? 'Enviando...' : 'Enviar'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}