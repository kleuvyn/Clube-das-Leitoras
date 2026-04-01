"use client";

import React, { useEffect, useState } from 'react';
import { 
  Instagram, BookOpen, ShoppingCart, Globe, Quote, Feather, 
  Star, ArrowLeft, X, CheckCircle2, PencilLine, Heart 
} from "lucide-react";

// Definições de Estilo Editorial do Clube
const rosaPrincipal = "#C47E8A";
const marromTerra = "#4A3F35";
const papelCor = "#FDFCFB";
const bgStyle = { 
  backgroundColor: papelCor,
  backgroundImage: `url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')` 
};

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

export default function EscritorasPage() {
  const [escritoras, setEscritoras] = useState<Escritora[]>([]);
  const [loading, setLoading] = useState(true);
  const [ativa, setAtiva] = useState<Escritora | null>(null);

  // Estados do Modal de Cadastro Completo
  const [modalOpen, setModalOpen] = useState(false);
  const [solNome, setSolNome] = useState('');
  const [solEmail, setSolEmail] = useState('');
  const [solTelefone, setSolTelefone] = useState('');
  const [solTitulo, setSolTitulo] = useState('');

  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [modalOpen]);
  const [solGenero, setSolGenero] = useState('');
  const [solInstagram, setSolInstagram] = useState('');
  const [solLinkCompra, setSolLinkCompra] = useState('');
  const [solSite, setSolSite] = useState('');
  const [solSinopse, setSolSinopse] = useState('');
  const [solBio, setSolBio] = useState('');
  const [solEnviando, setSolEnviando] = useState(false);
  const [solEnviado, setSolEnviado] = useState(false);

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

  const enviarSolicitacaoEscritora = async () => {
    const nomeVal = solNome.trim();
    const emailVal = solEmail.trim();
    const telefoneVal = solTelefone.trim();
    const tituloVal = solTitulo.trim();

    if (!nomeVal || !emailVal || !telefoneVal || !tituloVal) {
      alert('Por favor, preencha seu nome, e-mail, telefone e o título do livro.');
      return;
    }

    setSolEnviando(true);
    try {
      const res = await fetch('/api/solicitacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'escritora',
          nome: nomeVal,
          email: emailVal,
          telefone: telefoneVal,
          livroTitulo: tituloVal,
          genero: solGenero,
          instagram: solInstagram,
          linkCompra: solLinkCompra,
          site: solSite,
          sinopse: solSinopse,
          bio: solBio,
        }),
      });
      if (!res.ok) throw new Error('Falha ao enviar');
      setSolEnviado(true);
      
      // Limpar campos após sucesso
      setSolNome(''); setSolEmail(''); setSolTelefone(''); setSolTitulo(''); setSolGenero(''); setSolSinopse(''); 
      setSolInstagram(''); setSolLinkCompra(''); setSolSite(''); setSolBio('');
      
      setTimeout(() => { setSolEnviado(false); setModalOpen(false); }, 3000);
    } catch (err) {
      alert('Erro ao enviar sua obra. Tente novamente em instantes.');
    } finally {
      setSolEnviando(false);
    }
  };

  /* ─── VISTA DETALHE (Quando clica em um livro) ─── */
  if (ativa) {
    return (
      <div className="min-h-screen font-serif pb-40 relative animate-in fade-in duration-500" style={bgStyle}>
        <header className="max-w-7xl mx-auto pt-24 pb-8 px-6">
          <button
            onClick={() => setAtiva(null)}
            className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] opacity-50 hover:opacity-100 transition-all"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
            Voltar ao Acervo
          </button>
        </header>

        <main className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
            
            <aside className="hidden lg:block lg:col-span-3 sticky top-10 space-y-2 border-l border-black/5 pl-6">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-30 mb-8">Outras Obras</p>
              {escritoras.map(e => (
                <button
                  key={e.id}
                  onClick={() => { setAtiva(e); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className={`w-full text-left py-3 border-b border-black/5 transition-all ${ativa.id === e.id ? 'translate-x-2' : 'opacity-40 hover:opacity-70'}`}
                >
                  <span className="text-[10px] italic block" style={{ color: ativa.id === e.id ? rosaPrincipal : 'inherit' }}>
                    {e.livroTitulo}
                  </span>
                  <span className="text-[8px] uppercase tracking-widest opacity-60">por {e.nome}</span>
                </button>
              ))}
            </aside>

            <article className="lg:col-span-6 space-y-12">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                   <div className="h-[1px] w-8 bg-black/20" />
                   <span className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">{ativa.genero || "Literatura"}</span>
                </div>
                <h2 className="text-5xl md:text-7xl text-[#2C3E50] font-light leading-tight">
                  {ativa.livroTitulo}
                </h2>
              </div>

              {ativa.capaUrl && (
                <div className="relative inline-block">
                  <div className="bg-white p-3 shadow-[20px_20px_60px_rgba(0,0,0,0.1)] border border-black/5 -rotate-1 transform transition-transform hover:rotate-0 duration-700">
                    <img src={ativa.capaUrl} alt={ativa.livroTitulo} className="max-w-full h-auto w-[320px] rounded-sm object-cover" />
                  </div>
                </div>
              )}

              <div className="prose prose-slate max-w-none">
                {ativa.bio && (
                  <div className="mb-10">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-30 mb-4">Sobre a Autora</h4>
                    <p className="text-lg leading-relaxed text-slate-700 italic">{ativa.bio}</p>
                  </div>
                )}

                {ativa.sinopse && (
                  <div className="relative p-10 bg-black/[0.02] border-l-4 rounded-r-xl" style={{ borderColor: rosaPrincipal }}>
                    <Quote size={24} className="absolute -top-3 -left-3 opacity-20" style={{ color: rosaPrincipal }} />
                    <p className="text-xl italic leading-relaxed text-slate-800">
                      {ativa.sinopse}
                    </p>
                  </div>
                )}
              </div>
            </article>

            <aside className="lg:col-span-3 space-y-6">
              <div className="bg-white/50 backdrop-blur-sm p-8 border border-black/5 rounded-3xl shadow-sm">
                 <div className="space-y-6">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-widest opacity-40 block mb-2">Autoria</span>
                      <p className="flex items-center gap-2 font-medium"><Feather size={14} style={{ color: rosaPrincipal }}/> {ativa.nome}</p>
                    </div>
                    {ativa.instagram && (
                      <a href={`https://instagram.com/${ativa.instagram.replace('@', '')}`} target="_blank" className="flex items-center gap-3 text-sm opacity-60 hover:opacity-100 transition-opacity">
                        <Instagram size={16} /> @{ativa.instagram.replace('@', '')}
                      </a>
                    )}
                 </div>

                 {ativa.linkCompra && (
                    <a
                      href={ativa.linkCompra}
                      target="_blank"
                      className="mt-8 flex items-center justify-center gap-3 w-full py-4 rounded-2xl text-white text-[10px] font-bold uppercase tracking-[0.2em] transition-transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-rose-900/10"
                      style={{ backgroundColor: rosaPrincipal }}
                    >
                      <ShoppingCart size={14} /> Adquirir Obra
                    </a>
                  )}
              </div>
            </aside>
          </div>
        </main>
      </div>
    );
  }

  /* ─── VISTA LISTA PRINCIPAL ─── */
  return (
    <div className="min-h-screen font-serif pb-40 relative" style={bgStyle}>
      <header className="max-w-6xl mx-auto pt-32 pb-20 px-6 text-center">
        <div className="flex items-center justify-center gap-6 mb-10 opacity-30">
          <div className="h-[1px] w-12 bg-black" />
          <span className="text-[10px] font-bold uppercase tracking-[0.5em]">Brasília • Acervo Literário</span>
          <div className="h-[1px] w-12 bg-black" />
        </div>
        <h1 className="text-7xl md:text-8xl text-[#4A3F35] tracking-tighter leading-none mb-8">
          Escritoras <span className="italic font-light" style={{ color: rosaPrincipal }}>do Clube</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg italic opacity-50 leading-relaxed border-t border-black/5 pt-8">
          "Um refúgio para as vozes que florescem no papel. Aqui celebramos as mulheres do nosso clube que transformam sentimentos em literatura."
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-30">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${rosaPrincipal} transparent` }} />
            <p className="text-[10px] uppercase tracking-widest font-bold">Folheando as páginas...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
            {escritoras.map((item) => (
              <div key={item.id} className="group cursor-pointer space-y-8" onClick={() => setAtiva(item)}>
                <div className="relative aspect-[3/4] bg-white rounded-sm shadow-[10px_10px_30px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-500 group-hover:shadow-[20px_20px_50px_rgba(0,0,0,0.1)] group-hover:-translate-y-2">
                  {item.capaUrl ? (
                    <img src={item.capaUrl} alt={item.livroTitulo} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50">
                      <BookOpen size={40} className="opacity-10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <span className="text-white text-[10px] font-bold uppercase tracking-widest border border-white/40 px-6 py-3 rounded-full backdrop-blur-sm">Conhecer Obra</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <span className="text-[9px] font-bold uppercase tracking-[0.4em]" style={{ color: rosaPrincipal }}>{item.genero || "Literatura"}</span>
                  <h3 className="text-3xl text-slate-800 leading-none group-hover:italic transition-all">{item.livroTitulo}</h3>
                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-6 h-[1px] bg-black/20" />
                    <p className="text-[10px] uppercase tracking-widest opacity-40 italic">por {item.nome}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── CALL TO ACTION (CONVITE) ─── */}
        <section className="mt-48 bg-white/40 border border-black/5 p-12 md:p-24 text-center rounded-[3rem] backdrop-blur-sm relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] rotate-12">
            <PencilLine size={200} />
          </div>

          <div className="max-w-2xl mx-auto space-y-10 relative z-10">
            <Star className="mx-auto opacity-20" size={32} style={{ color: rosaPrincipal }} />
            
            <div className="space-y-4">
              <h2 className="text-5xl md:text-6xl text-[#2C3E50] leading-tight font-light tracking-tight">
                Você também <br />
                <span className="italic" style={{ color: rosaPrincipal }}>escreve?</span>
              </h2>
              
              <p className="text-slate-600 italic text-lg leading-relaxed max-w-lg mx-auto">
                "Se você faz parte do clube e já publicou ou está escrevendo um livro, 
                queremos divulgar sua obra aqui. Venha compartilhar sua história com a gente!"
              </p>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="group inline-flex items-center gap-4 bg-[#4A3F35] text-white px-12 py-6 rounded-2xl font-bold uppercase text-[10px] tracking-[0.3em] hover:bg-black transition-all shadow-xl hover:-translate-y-1"
            >
              <Feather size={14} className="group-hover:rotate-12 transition-transform" /> 
              Quero fazer parte do acervo
            </button>
          </div>
        </section>
      </main>

      {/* ─── MODAL DE CADASTRO REFINADO ─── */}
      {modalOpen && (
        <div className="fixed inset-0 z-[999999] flex items-start md:items-center justify-center p-4 pt-10 overflow-y-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          
          <div className="relative w-full max-w-4xl bg-[#FDFCFB] rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[95vh]">
            <button onClick={() => setModalOpen(false)} className="absolute right-8 top-8 p-2 hover:bg-black/5 rounded-full transition-colors z-10">
              <X size={20} className="opacity-40" />
            </button>

            <div className="grid md:grid-cols-5 h-full min-h-0">
              <div className="hidden md:flex md:col-span-2 bg-[#C47E8A]/10 p-8 pt-12 flex-col justify-start border-r border-black/5">
                <div className="space-y-5">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                     <Heart size={24} style={{ color: rosaPrincipal }} />
                  </div>
                  <h3 className="text-4xl font-serif italic leading-tight text-slate-800">Nova Escritora</h3>
                  <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-[0.2em] font-bold">Cada página conta uma história, cada autora fortalece nosso clube.</p>
                </div>
                <div className="text-[8px] uppercase tracking-widest opacity-30 italic font-bold">Curadoria Literária</div>
              </div>

              <div className="md:col-span-3 p-8 md:p-10 flex flex-col min-h-0">
                {/* Cabeçalho sticky para manter título visível */}
                <div className="sticky top-0 left-0 right-0 z-20 bg-[#FDFCFB] pt-3 pb-4 md:pt-0 md:pb-0 border-b border-black/5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-serif italic">Nova Escritora</h3>
                    <button onClick={() => setModalOpen(false)} className="p-2 md:hidden">
                      <X size={20} className="opacity-60" />
                    </button>
                  </div>
                </div>

                {solEnviado ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                    <CheckCircle2 size={48} className="text-green-500 animate-bounce" />
                    <h4 className="text-2xl font-serif italic">Manuscrito Recebido!</h4>
                    <p className="text-sm text-slate-500">Obrigada por confiar sua história ao clube.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-6 flex-1 overflow-y-auto pr-2 pb-28 min-h-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold opacity-40">Nome da Escritora</label>
                        <input type="text" value={solNome} onChange={e => setSolNome(e.target.value)} className="w-full bg-transparent border-b border-black/10 py-2 focus:border-[#C47E8A] outline-none transition-colors" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold opacity-40">Telefone</label>
                        <input type="tel" value={solTelefone} onChange={e => setSolTelefone(e.target.value)} className="w-full bg-transparent border-b border-black/10 py-2 focus:border-[#C47E8A] outline-none transition-colors" placeholder="(61) 99999-9999" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold opacity-40">E-mail</label>
                        <input type="email" value={solEmail} onChange={e => setSolEmail(e.target.value)} className="w-full bg-transparent border-b border-black/10 py-2 focus:border-[#C47E8A] outline-none transition-colors" placeholder="nome@exemplo.com" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold opacity-40">Título do Livro</label>
                        <input type="text" value={solTitulo} onChange={e => setSolTitulo(e.target.value)} className="w-full bg-transparent border-b border-black/10 py-2 focus:border-[#C47E8A] outline-none transition-colors" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold opacity-40">Gênero Literário</label>
                        <input type="text" value={solGenero} onChange={e => setSolGenero(e.target.value)} className="w-full bg-transparent border-b border-black/10 py-2 focus:border-[#C47E8A] outline-none transition-colors" placeholder="Poesia, Romance..." />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold opacity-40">Instagram</label>
                        <input type="text" placeholder="@" value={solInstagram} onChange={e => setSolInstagram(e.target.value)} className="w-full bg-transparent border-b border-black/10 py-2 focus:border-[#C47E8A] outline-none transition-colors" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold opacity-40">Link de Compra</label>
                        <input type="text" value={solLinkCompra} onChange={e => setSolLinkCompra(e.target.value)} className="w-full bg-transparent border-b border-black/10 py-2 focus:border-[#C47E8A] outline-none transition-colors text-xs" placeholder="Amazon, Editora..." />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold opacity-40">Site / Blog</label>
                        <input type="text" value={solSite} onChange={e => setSolSite(e.target.value)} className="w-full bg-transparent border-b border-black/10 py-2 focus:border-[#C47E8A] outline-none transition-colors text-xs" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest font-bold opacity-40">Sinopse do Livro</label>
                      <textarea value={solSinopse} onChange={e => setSolSinopse(e.target.value)} className="w-full bg-black/5 rounded-xl p-4 text-sm focus:ring-1 focus:ring-[#C47E8A] outline-none" rows={3} />
                    </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold opacity-40">Bio da Escritora</label>
                        <textarea value={solBio} onChange={e => setSolBio(e.target.value)} className="w-full bg-black/5 rounded-xl p-4 text-sm focus:ring-1 focus:ring-[#C47E8A] outline-none" rows={2} />
                      </div>
                    </div>

                    <div className="sticky bottom-0 left-0 right-0 z-30 border-t border-black/10 p-4 bg-[#FDFCFB] backdrop-blur-sm">
                      <button
                        onClick={enviarSolicitacaoEscritora}
                        disabled={solEnviando}
                        className="w-full bg-[#C47E8A] text-white py-4 rounded-2xl font-bold uppercase text-[10px] tracking-[0.3em] shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50"
                      >
                        {solEnviando ? 'Submetendo...' : 'Submeter Obra'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}