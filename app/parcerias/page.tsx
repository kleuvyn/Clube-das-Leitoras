"use client";

import React, { useEffect, useState } from 'react';
import { Instagram, Star, Heart, Coffee, Quote, X } from 'lucide-react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { uploadFile } from '@/lib/upload-client';

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

  const [parceriaModalOpen, setParceriaModalOpen] = useState(false);
  const [parceriaNome, setParceriaNome] = useState(''); // Nova Aliança
  const [parceriaTelefone, setParceriaTelefone] = useState('');
  const [parceriaEmail, setParceriaEmail] = useState('');
  const [parceriaSite, setParceriaSite] = useState('');
  const [parceriaEditora, setParceriaEditora] = useState('');
  const [parceriaDescricao, setParceriaDescricao] = useState('');
  const [parceriaLink, setParceriaLink] = useState(''); // Link / Instagram
  const [parceriaEnviando, setParceriaEnviando] = useState(false);
  const [parceriaEnviado, setParceriaEnviado] = useState(false);

  useEffect(() => {
    if (parceriaModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [parceriaModalOpen]);

  useEffect(() => {
    async function carregarParceiras() {
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
        console.error("Erro ao carregar parceiras:", err);
      } finally {
        setLoading(false);
      }
    }
    carregarParceiras();
  }, []);

  return (
    <div className="min-h-screen font-serif pb-32 relative overflow-hidden"
         style={{ background: `${papelEditorial} url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')` }}>
      
      <header className="max-w-5xl mx-auto pt-32 pb-24 px-6 relative z-10 text-center border-b border-black/5">
        <div className="flex items-center justify-center gap-4 mb-8 opacity-40">
          <div className="h-[1px] w-10 bg-black" />
          <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-black italic">Caderno de Parcerias</span>
          <div className="h-[1px] w-10 bg-black" />
        </div>

        <h1 className="text-7xl md:text-[100px] text-[#2C3E50] tracking-tighter leading-[0.8] mb-10">
          Nossas <span style={{ color: rosaGabi }} className="italic font-light">parceiras</span>
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
          <div className="text-center py-20 italic opacity-40 text-[#2C3E50]">Reunindo nossas parceiras...</div>
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
                 onClick={() => setParceriaModalOpen(true)}
                 className="h-16 w-full max-w-[280px] mx-auto px-8 text-white rounded-[2rem] font-bold uppercase text-[10px] tracking-[0.4em] transition-all hover:scale-105 active:scale-95 shadow-xl shadow-[#B04D4A]/20"
                 style={{ backgroundColor: rosaGabi }}
              >
                Falar com a Gabi
              </Button>
           </div>
        </section>

        {/* ─── MODAL REFINADO ─── */}
        {parceriaModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-start md:items-center justify-center p-4 pt-20 md:pt-0 overflow-y-auto">
            <div className="absolute inset-0 bg-[#2C3E50]/40 backdrop-blur-sm" onClick={() => setParceriaModalOpen(false)} />
            
            <div className="relative w-full max-w-4xl bg-[#FDFCFB] rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[95vh] mt-20 md:mt-0">
              <button onClick={() => setParceriaModalOpen(false)} className="absolute right-4 top-4 p-2 hover:bg-black/5 rounded-full transition-colors z-10">
                <X size={20} className="opacity-40" />
              </button>

              <div className="grid md:grid-cols-5 min-h-[80vh] max-h-[95vh] overflow-hidden">
                {/* Coluna Lateral Editorial */}
                <div className="hidden md:flex md:col-span-2 bg-[#B04D4A]/5 p-12 flex-col justify-between border-r border-black/5">
                  <div className="space-y-8">
                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm rotate-3">
                       <Coffee size={28} style={{ color: rosaGabi }} />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-4xl font-serif italic leading-tight text-[#2C3E50]">Nova <br/>Aliada</h3>
                      <div className="h-[1px] w-12 bg-[#B04D4A]/30" />
                      <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-[0.2em] font-bold">
                        Buscamos conexões que compartilham o propósito de florescer a literatura feminina.
                      </p>
                    </div>
                  </div>
                  <div className="text-[9px] uppercase tracking-[0.4em] opacity-30 italic font-bold text-[#2C3E50]">
                    DNA Club • Parcerias 2026
                  </div>
                </div>

                {/* Coluna do Formulário */}
                <div className="md:col-span-3 p-6 md:p-14 overflow-y-auto max-h-[90vh]">
                  {parceriaEnviado ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20">
                      <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                        <Heart size={32} className="text-green-600 animate-pulse" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-3xl font-serif italic text-[#2C3E50]">Proposta Recebida!</h4>
                        <p className="text-sm text-slate-500 max-w-xs mx-auto">A Gabi recebeu seu convite. Em breve, prepararemos o café para essa conversa.</p>
                      </div>
                      <button onClick={() => { setParceriaModalOpen(false); setParceriaEnviado(false); }} className="text-[10px] uppercase tracking-widest font-bold opacity-40 hover:opacity-100 underline underline-offset-8 transition-opacity">Voltar ao caderno</button>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <header className="space-y-2">
                        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#B04D4A]">Nova Aliança</span>
                        <h2 className="text-2xl text-[#2C3E50] font-medium tracking-tight">Cadastre sua parceria</h2>
                      </header>

                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-4">
                        <div className="group space-y-1">
                          <label className="text-[9px] uppercase tracking-widest font-bold opacity-40">Nome</label>
                          <input value={parceriaNome} onChange={e => setParceriaNome(e.target.value)} className="w-full bg-transparent border-b border-black/10 py-2 focus:border-[#B04D4A] outline-none transition-colors text-sm" />
                        </div>

                        <div className="group space-y-1">
                          <label className="text-[9px] uppercase tracking-widest font-bold opacity-40">Telefone</label>
                          <input value={parceriaTelefone} onChange={e => setParceriaTelefone(e.target.value)} placeholder="(61) 9xxxx-xxxx" className="w-full bg-transparent border-b border-black/10 py-2 focus:border-[#B04D4A] outline-none transition-colors text-sm" />
                        </div>

                        <div className="group space-y-1">
                          <label className="text-[9px] uppercase tracking-widest font-bold opacity-40">E-mail</label>
                          <input value={parceriaEmail} onChange={e => setParceriaEmail(e.target.value)} placeholder="nome@seuevento.com" className="w-full bg-transparent border-b border-black/10 py-2 focus:border-[#B04D4A] outline-none transition-colors text-sm" />
                        </div>

                        <div className="group space-y-1">
                          <label className="text-[9px] uppercase tracking-widest font-bold opacity-40">Site</label>
                          <input value={parceriaSite} onChange={e => setParceriaSite(e.target.value)} placeholder="https://..." className="w-full bg-transparent border-b border-black/10 py-2 focus:border-[#B04D4A] outline-none transition-colors text-sm" />
                        </div>

                        <div className="group space-y-1">
                          <label className="text-[9px] uppercase tracking-widest font-bold opacity-40">Nome da Editora</label>
                          <input value={parceriaEditora} onChange={e => setParceriaEditora(e.target.value)} className="w-full bg-transparent border-b border-black/10 py-2 focus:border-[#B04D4A] outline-none transition-colors text-sm" />
                        </div>

                        <div className="group space-y-1">
                          <label className="text-[9px] uppercase tracking-widest font-bold opacity-40">Descrição</label>
                          <textarea value={parceriaDescricao} onChange={e => setParceriaDescricao(e.target.value)} className="w-full bg-black/[0.03] rounded-2xl p-4 text-sm focus:ring-1 focus:ring-[#B04D4A] outline-none min-h-[120px]" />
                        </div>

                        <div className="group space-y-1">
                          <label className="text-[9px] uppercase tracking-widest font-bold opacity-40">Link / Instagram</label>
                          <input value={parceriaLink} onChange={e => setParceriaLink(e.target.value)} placeholder="https://..." className="w-full bg-transparent border-b border-black/10 py-2 focus:border-[#B04D4A] outline-none transition-colors text-sm" />
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
                                mensagem: `${parceriaDescricao}`,
                              }),
                            });
                            if (!response.ok) throw new Error();
                            setParceriaEnviado(true);
                            toast.success('Cadastro de parceria enviado!');
                            setParceriaNome('');
                            setParceriaTelefone('');
                            setParceriaEmail('');
                            setParceriaSite('');
                            setParceriaEditora('');
                            setParceriaDescricao('');
                            setParceriaLink('');
                          } catch (error) {
                            toast.error('Erro ao enviar cadastro de parceria.');
                          } finally {
                            setParceriaEnviando(false);
                          }
                        }}
                        disabled={parceriaEnviando}
                        className="w-full bg-[#B04D4A] text-white py-5 rounded-2xl font-bold uppercase text-[10px] tracking-[0.4em] shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50"
                      >
                        {parceriaEnviando ? 'Enviando...' : 'Enviar Cadastro'}
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