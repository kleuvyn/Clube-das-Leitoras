"use client";

import React, { useEffect, useState } from 'react';
import { Globe, Calendar, Laptop, ArrowRight, Info, Video, Download, Archive, ChevronDown, ChevronUp, Loader2, Youtube, FileText, Send, MessageCircle, Heart, Book, Edit3, X } from 'lucide-react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { normalizeDateValue } from '@/lib/utils';

const papelEditorial = "#FDFCFB";
const azulPetroleo = "#2C3E50";
const verdeMusgo = "#4F5E46";
const instagramHeartColor = '#E1306C';

interface Encontro {
  id: string;
  data: string;
  tema: string;
  linkMeet: string | null;
  linkLive: string | null;
  linkDrive: string | null;
  imagem: string | null;
  status: string;
}

interface RodaOnlineData {
  titulo: string;
  autora: string;
  imagem: string;
  parceiro: string;
  descricao: string | string[];
  ambiente: string;
  dataHora: string;
  notaCuradoria: string;
  linkInscricao: string;
  videoUrl: string;
  linkDrive: string;
}

interface ReflexaoRoda {
  id: string;
  autoraNome: string;
  autoraEmail?: string | null;
  texto: string;
  likes?: number;
  replyToId?: string | null;
  createdAt: string | number | Date;
}

function SecaoReflexoesRoda({ rodaId, temaNome }: { rodaId: string; temaNome: string }) {
  const [reflexoes, setReflexoes] = useState<ReflexaoRoda[]>([]);
  const [loadingR, setLoadingR] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [nome, setNome] = useState('');
  const [texto, setTexto] = useState('');
  const [replyToReflectionId, setReplyToReflectionId] = useState<string | null>(null);
  const [replyTexto, setReplyTexto] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [editingReflectionId, setEditingReflectionId] = useState<string | null>(null);
  const [editingReflectionText, setEditingReflectionText] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [savingLike, setSavingLike] = useState<string | null>(null);
  const [likedReflectionIds, setLikedReflectionIds] = useState<Set<string>>(new Set());

  const carregar = async () => {
    setLoadingR(true);
    try {
      const res = await fetch(`/api/rodaonline/reflexoes?rodaId=${rodaId}`);
      const data = await res.json();
      setReflexoes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setReflexoes([]);
    } finally { setLoadingR(false); }
  };

  useEffect(() => { carregar(); }, [rodaId]);

  useEffect(() => {
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
      return match ? decodeURIComponent(match[1]) : null;
    };
    setUserEmail(getCookie('clube-user-email'));
    setUserName(getCookie('clube-user-name'));

    try {
      const stored = window.localStorage.getItem('likedReflexoes');
      if (stored) {
        const ids = JSON.parse(stored) as string[];
        setLikedReflectionIds(new Set(Array.isArray(ids) ? ids : []));
      }
    } catch {
      setLikedReflectionIds(new Set());
    }
  }, []);

  const canEditReflection = (reflexao: ReflexaoRoda) => {
    const emailMatch = reflexao.autoraEmail && userEmail && reflexao.autoraEmail.trim().toLowerCase() === userEmail.trim().toLowerCase();
    const nameMatch = !reflexao.autoraEmail && userName && reflexao.autoraNome.trim().toLowerCase() === userName.trim().toLowerCase();
    return Boolean(emailMatch || nameMatch);
  };

  const startEditingReflection = (reflexao: ReflexaoRoda) => {
    setEditingReflectionId(reflexao.id);
    setEditingReflectionText(reflexao.texto);
  };

  const cancelEditingReflection = () => {
    setEditingReflectionId(null);
    setEditingReflectionText('');
  };

  const saveReflectionEdit = async (reflexaoId: string) => {
    if (!editingReflectionText.trim()) return toast.error('O comentário não pode ficar vazio.');
    setSavingEdit(true);
    try {
      const res = await fetch('/api/rodaonline/reflexoes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reflexaoId, texto: editingReflectionText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Erro ao atualizar reflexão.');
      } else {
        toast.success('Reflexão atualizada!');
        setReflexoes(prev => prev.map(r => r.id === reflexaoId ? { ...r, texto: editingReflectionText.trim() } : r));
        cancelEditingReflection();
      }
    } catch (err) {
      toast.error('Erro de conexão.');
    } finally {
      setSavingEdit(false);
    }
  };

  const persistLikedReflexoes = (ids: Set<string>) => {
    try {
      window.localStorage.setItem('likedReflexoes', JSON.stringify(Array.from(ids)));
    } catch {
      // ignore
    }
  };

  const likeReflection = async (reflexaoId: string) => {
    setSavingLike(reflexaoId);
    try {
      const res = await fetch('/api/rodaonline/reflexoes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reflexaoId, action: 'like' }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Erro ao curtir reflexão.');
      } else {
        setReflexoes(prev => prev.map(r => r.id === reflexaoId ? { ...r, likes: data.likes ?? (r.likes || 0) + 1 } : r));
        setLikedReflectionIds(prev => {
          const next = new Set(prev);
          next.add(reflexaoId);
          persistLikedReflexoes(next);
          return next;
        });
      }
    } catch (err) {
      toast.error('Erro de conexão.');
    } finally {
      setSavingLike(null);
    }
  };

  const startReplying = (reflexaoId: string) => {
    setReplyToReflectionId(reflexaoId);
    setReplyTexto('');
  };

  const cancelReplying = () => {
    setReplyToReflectionId(null);
    setReplyTexto('');
  };

  const sendReply = async (reflexaoId: string) => {
    if (!nome.trim() || !replyTexto.trim()) return toast.error('Preencha seu nome e sua resposta.');
    setEnviando(true);
    try {
      const res = await fetch('/api/rodaonline/reflexoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rodaId, autoraNome: nome.trim(), texto: replyTexto.trim(), replyToId: reflexaoId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Erro ao enviar resposta.');
      } else {
        toast.success('Resposta publicada!');
        setReplyTexto('');
        setReplyToReflectionId(null);
        carregar();
      }
    } catch { toast.error('Erro de conexão.'); }
    finally { setEnviando(false); }
  };

  const enviar = async () => {
    if (!nome.trim() || !texto.trim()) return toast.error('Preencha seu nome e sua reflexão.');
    setEnviando(true);
    try {
      const res = await fetch('/api/rodaonline/reflexoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rodaId, autoraNome: nome.trim(), texto: texto.trim() }),
      });
      const data = await res.json();
      if (!res.ok) toast.error(data.error || 'Erro ao enviar.');
      else { toast.success('Reflexão compartilhada!'); setTexto(''); carregar(); }
    } catch { toast.error('Erro de conexão.'); }
    finally { setEnviando(false); }
  };

  return (
    <div className="mt-6 space-y-6 border-t pt-6" style={{ borderColor: `${verdeMusgo}20` }}>
      <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40" style={{ color: azulPetroleo }}>
        Reflexões — {temaNome}
      </p>
      {loadingR ? (
        <div className="flex justify-center py-6"><Loader2 size={20} className="animate-spin opacity-20"/></div>
      ) : reflexoes.length === 0 ? (
        <p className="italic text-sm opacity-40 text-center py-4" style={{ color: azulPetroleo }}>
          Seja a primeira a compartilhar uma reflexão sobre este encontro.
        </p>
      ) : (
        <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
          {reflexoes.map(r => (
            <div key={r.id} className="bg-white/60 rounded-2xl p-5 space-y-3 border border-black/5">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Book size={14} style={{ color: verdeMusgo }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: verdeMusgo }}>{r.autoraNome}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] opacity-30">{normalizeDateValue(r.createdAt).toLocaleDateString('pt-BR')}</span>
                    <button
                      type="button"
                      onClick={() => likeReflection(r.id)}
                      disabled={savingLike === r.id}
                      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest hover:opacity-80 disabled:opacity-40 ${likedReflectionIds.has(r.id) ? 'text-[#E1306C]' : 'text-[#2C3E50]'}`}
                    >
                      <Heart
                        size={14}
                        fill={likedReflectionIds.has(r.id) ? '#E1306C' : 'none'}
                        style={{ color: likedReflectionIds.has(r.id) ? '#E1306C' : '#2C3E50' }}
                      />
                      {savingLike === r.id ? '...' : `${r.likes ?? 0}`}
                    </button>
                    <button
                      type="button"
                      onClick={() => startReplying(r.id)}
                      className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#2C3E50] opacity-70 hover:opacity-100"
                    >
                      Responder
                    </button>
                    {canEditReflection(r) && (
                      <button
                        type="button"
                        onClick={() => startEditingReflection(r)}
                        className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#2C3E50] opacity-70 hover:opacity-100"
                      >
                        <Edit3 size={12} /> Editar
                      </button>
                    )}
                  </div>
                </div>
                {editingReflectionId === r.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editingReflectionText}
                      onChange={(e) => setEditingReflectionText(e.target.value)}
                      rows={4}
                      className="w-full p-4 bg-white rounded-2xl border border-black/10 text-sm outline-none resize-none"
                    />
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => saveReflectionEdit(r.id)}
                        disabled={savingEdit}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2C3E50] text-white text-[10px] font-bold uppercase tracking-[0.2em] disabled:opacity-40"
                      >
                        {savingEdit ? 'Salvando...' : 'Salvar'}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditingReflection}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 text-[10px] font-bold uppercase tracking-[0.2em]"
                      >
                        <X size={12} /> Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm italic leading-relaxed opacity-70" style={{ color: azulPetroleo }}>&quot;{r.texto}&quot;</p>
                    {replyToReflectionId === r.id && (
                      <div className="mt-4 space-y-3 bg-[#F7F7F5] rounded-3xl p-4 border border-black/5">
                        <textarea
                          value={replyTexto}
                          onChange={(e) => setReplyTexto(e.target.value)}
                          rows={3}
                          className="w-full p-4 bg-white rounded-2xl border border-black/10 text-sm outline-none resize-none"
                          placeholder="Responder a esta reflexão..."
                        />
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => sendReply(r.id)}
                            disabled={enviando}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2C3E50] text-white text-[10px] font-bold uppercase tracking-[0.2em] disabled:opacity-40"
                          >
                            {enviando ? 'Enviando...' : 'Responder'}
                          </button>
                          <button
                            type="button"
                            onClick={cancelReplying}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 text-[10px] font-bold uppercase tracking-[0.2em]"
                          >
                            <X size={12} /> Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="space-y-3 bg-white/40 rounded-3xl p-6 border border-black/5">
        <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" className="w-full p-3 bg-white rounded-xl text-sm outline-none border border-black/5 font-alice" />
        <textarea value={texto} onChange={e => setTexto(e.target.value)} placeholder="Compartilhe sua reflexão sobre este encontro..." rows={3} className="w-full p-3 bg-white rounded-xl text-sm outline-none border border-black/5 resize-none font-alice" />
        <button onClick={enviar} disabled={enviando} className="flex items-center gap-2 px-5 py-2.5 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl disabled:opacity-40 transition-opacity" style={{ backgroundColor: verdeMusgo }}>
          {enviando ? <Loader2 size={12} className="animate-spin"/> : <Send size={12}/>}
          Compartilhar Reflexão
        </button>
      </div>
    </div>
  );
}

export default function RodaOnlineFuncional() {
  const [conteudo, setConteudo] = useState<RodaOnlineData | null>(null);
  const [heroRodaId, setHeroRodaId] = useState<string | null>(null);
  const [heroAberto, setHeroAberto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [encontros, setEncontros] = useState<Encontro[]>([]);
  const [encerrados, setEncerrados] = useState<Encontro[]>([]);
  const [abertos, setAbertos] = useState<Set<string>>(new Set());
  const [pageEncontros, setPageEncontros] = useState(1);
  const [pageEncerrados, setPageEncerrados] = useState(1);
  const limitEncontros = 6;
  const limitEncerrados = 6;

  const toggleAberto = (id: string) =>
    setAbertos(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  useEffect(() => {
    async function carregarRoda() {
      try {
        const res = await fetch('/api/rodaonline');
        const data = await res.json();
        
        const ativas = data.filter((r: any) => r.status === 'ativo');
        const encerradas = data.filter((r: any) => r.status === 'encerrado');

        if (ativas.length > 0) {
          const r = ativas[0];
          setHeroRodaId(r.id);
          setConteudo({
            titulo: r.title || '',
            autora: r.author || '',
            imagem: r.imageUrl || '',
            parceiro: r.parceiro || '',
            descricao: r.description || '',
            ambiente: r.ambiente || '',
            dataHora: r.date ? new Date(r.date).toLocaleString('pt-BR') : '',
            notaCuradoria: r.notaCuradoria || '',
            linkInscricao: r.link || '',
            videoUrl: r.videoUrl || '',
            linkDrive: r.linkDrive || '',
          });
        }

        const mapRoda = (r: any) => ({
          id: r.id,
          data: r.date ? new Date(r.date).toLocaleString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
          tema: r.title || '',
          linkMeet: r.link ?? null,
          linkLive: r.videoUrl ?? null,
          linkDrive: r.linkDrive ?? null,
          imagem: r.imageUrl ?? null,
          status: r.status,
        });
        setEncontros(ativas.slice(1).map(mapRoda));
        setEncerrados(encerradas.map(mapRoda));
      } catch (err) {
        console.error("Erro ao carregar roda online:", err);
      } finally {
        setLoading(false);
      }
    }
    carregarRoda();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center italic opacity-30 font-alice text-[#2C3E50]">
        Sintonizando a conexão com a nossa Roda...
      </div>
    );
  }

  if (!conteudo) {
      return (
        <div className="min-h-screen flex items-center justify-center italic opacity-30 font-alice text-[#2C3E50]">
         Nenhum encontro agendado para este momento.
        </div>
      );
  }

  
  const paragrafos = Array.isArray(conteudo.descricao) 
    ? conteudo.descricao 
    : (conteudo.descricao ? conteudo.descricao.split('\n').filter(p => p.trim() !== '') : []);
  const totalEncontrosPages = Math.max(1, Math.ceil(encontros.length / limitEncontros));
  const totalEncerradosPages = Math.max(1, Math.ceil(encerrados.length / limitEncerrados));
  const encontrosPaginados = encontros.slice((pageEncontros - 1) * limitEncontros, pageEncontros * limitEncontros);
  const encerradosPaginados = encerrados.slice((pageEncerrados - 1) * limitEncerrados, pageEncerrados * limitEncerrados);

  return (
    <div className="min-h-screen text-[#2C3E50] font-alice pb-32 relative overflow-hidden" 
         style={{ background: `${papelEditorial} url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')` }}>
      
      
      <header className="max-w-5xl mx-auto pt-32 pb-24 px-6 relative z-10 text-center border-b border-black/5">
        <div className="flex items-center justify-center gap-4 mb-8 opacity-40">
          <div className="h-px w-10 bg-black" />
          <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-black italic">Edição Extra • Encontro Digital</span>
          <div className="h-px w-10 bg-black" />
        </div>
        
        <h1 className="text-7xl md:text-[100px] tracking-tighter leading-[0.8] mb-10">
          Roda <span style={{ color: verdeMusgo }} className="italic font-light">On-line</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-3xl mx-auto border-t border-black/10 pt-10">
          <p className="text-base leading-relaxed opacity-60 text-black italic">
            "Para que a distância não seja barreira, mas um novo caminho para as nossas conversas de café e alma."
          </p>
          <div className="flex flex-col justify-end items-start md:items-end">
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-sans font-bold" style={{ color: verdeMusgo }}>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 relative z-10 mt-24">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start mb-32">
          
          
          <div className="lg:col-span-5 relative">
            <div className="aspect-3/4 relative bg-white shadow-2xl rounded-sm overflow-hidden p-6 border border-black/5">
               {conteudo.imagem ? (
                 <div className="relative w-full h-full">
                    <Image 
                      src={conteudo.imagem} 
                      alt={conteudo.titulo}
                      fill
                      className="object-contain"
                    />
                 </div>
               ) : (
                 <div className="w-full h-full bg-[#F4F1EA] flex items-center justify-center italic opacity-20">
                    Capa indisponível
                 </div>
               )}
            </div>
            
            
            <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full shadow-2xl flex items-center justify-center p-6 rotate-[8deg] border border-black/5" 
                 style={{ background: '#FAF8F5' }}>
              <div className="text-center">
                  <span className="block text-[8px] font-mono font-bold uppercase tracking-widest opacity-30 text-[#2C3E50]">Curadoria</span>
                  <span className="block text-sm font-bold italic my-1" style={{ color: verdeMusgo }}>{conteudo.parceiro}</span>
                  <div className="h-px w-8 bg-[#4F5E46]/20 mx-auto my-1" />
                  <span className="block text-[8px] font-mono font-bold opacity-30">ENCONTRO VIRTUAL</span>
              </div>
            </div>
          </div>

          
          <div className="lg:col-span-7 space-y-12">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-px w-10" style={{ backgroundColor: `${verdeMusgo}40` }} />
                  <span style={{ color: verdeMusgo }} className="text-[9px] font-mono font-bold uppercase tracking-widest">A Obra do Mês</span>
                </div>
                <h2 className="text-5xl md:text-6xl tracking-tighter leading-[0.95] text-[#2C3E50]">{conteudo.titulo}</h2>
                <p className="text-2xl italic font-light opacity-50 text-[#2C3E50]">Escrito por {conteudo.autora}</p>
              </div>

              
              <div className="text-base leading-tight space-y-3 font-light italic text-[#2C3E50]/80 text-justify" style={{ textAlign: 'justify' }}>
                {paragrafos.length > 0 ? (
                  paragrafos.map((paragrafo, idx) => (
                    <p 
                      key={idx} 
                      className={idx === 0 ? "first-letter:text-7xl first-letter:font-serif first-letter:mr-3 first-letter:float-left first-letter:leading-none" : ""}
                      style={idx === 0 ? { color: verdeMusgo } : undefined}
                    >
                      {paragrafo}
                    </p>
                  ))
                ) : (
                  <p>Aguardando detalhes da nossa próxima jornada literária...</p>
                )}
              </div>

              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                <div className="p-8 rounded-[2.5rem] bg-white border border-black/5 shadow-sm flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${verdeMusgo}15`, color: verdeMusgo }}>
                        <Laptop size={24} />
                    </div>
                    <div>
                      <span className="block text-[9px] font-mono font-bold uppercase tracking-widest opacity-40">Local Digital</span>
                      <span className="text-lg italic text-[#2C3E50]">{conteudo.ambiente}</span>
                    </div>
                </div>
                <div className="p-8 rounded-[2.5rem] bg-white border border-black/5 shadow-sm flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${verdeMusgo}15`, color: verdeMusgo }}>
                        <Calendar size={24} />
                    </div>
                    <div>
                      <span className="block text-[9px] font-mono font-bold uppercase tracking-widest opacity-40">Encontro em</span>
                      <span className="text-lg italic text-[#2C3E50]">{conteudo.dataHora}</span>
                    </div>
                </div>
              </div>

              {(conteudo.linkInscricao || conteudo.videoUrl || conteudo.linkDrive) && (
                <div className="flex flex-wrap gap-3 pt-2">
                  {conteudo.linkInscricao && (
                    <a href={conteudo.linkInscricao} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-3 text-white text-[10px] font-bold uppercase tracking-widest rounded-2xl"
                      style={{ backgroundColor: verdeMusgo }}>
                      <Video size={13} /> Entrar no Meet
                    </a>
                  )}
                  {conteudo.videoUrl && (
                    <a href={conteudo.videoUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-3 text-[10px] font-bold uppercase tracking-widest rounded-2xl border"
                      style={{ color: '#c0392b', borderColor: '#c0392b40' }}>
                      <Youtube size={13} /> Assistir Gravação
                    </a>
                  )}
                  {conteudo.linkDrive && (
                    <a href={conteudo.linkDrive} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-3 text-[10px] font-bold uppercase tracking-widest rounded-2xl border"
                      style={{ color: verdeMusgo, borderColor: `${verdeMusgo}40` }}>
                      <Download size={13} /> Material / Drive
                    </a>
                  )}
                </div>
              )}

              {heroRodaId && (
                <div className="pt-8 mt-6 border-t border-[#8C7B6E]/20">
                  <button
                    onClick={() => setHeroAberto(p => !p)}
                    className="w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-4 px-8 py-4 rounded-full border transition-all duration-500 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                    style={{
                      backgroundColor: heroAberto ? '#8C7B6E' : '#FAFAF5',
                      borderColor: heroAberto ? '#8C7B6E' : 'rgba(140, 123, 110, 0.4)',
                      color: heroAberto ? '#FFFFFF' : '#8C7B6E'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <MessageCircle size={16} className={heroAberto ? "opacity-100" : "opacity-80"} />
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em]">
                        {heroAberto ? 'Fechar Caderno Proibido' : 'Abrir Caderno Proibido'}
                      </span>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-500 ${heroAberto ? 'bg-white/20' : 'bg-[#8C7B6E]/10 group-hover:bg-[#8C7B6E] group-hover:text-white'}`}>
                      {heroAberto ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                    </div>
                  </button>
                  
                  {heroAberto && (
                    <div className="mt-8 relative before:absolute before:inset-0 before:bg-white/40 before:rounded-xl before:-z-10 p-6 sm:p-8 border border-[#8C7B6E]/10 shadow-[0_0_20px_rgba(140,123,110,0.03)] animate-in fade-in slide-in-from-top-4 duration-500">
                      <SecaoReflexoesRoda rodaId={heroRodaId} temaNome={conteudo.titulo}/>
                    </div>
                  )}
                </div>
              )}
          </div>
        </section>

        {(encontros.length > 0 || encerrados.length > 0) && (
          <section className="mt-24 space-y-8">
            {encontros.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-black/5" />
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.6em] opacity-40 flex items-center gap-2" style={{ color: azulPetroleo }}>
                    <Calendar size={12} /> Próximos Encontros
                  </h2>
                  <div className="h-px flex-1 bg-black/5" />
                </div>

                {encontrosPaginados.map(enc => (
                  <div key={enc.id} className="bg-white rounded-[3rem] border border-black/5 shadow-sm overflow-hidden transition-all duration-500">
                    <div className="flex flex-col md:flex-row gap-0">
                      {enc.imagem && (
                        <div className="md:w-48 shrink-0">
                          <img src={enc.imagem} alt={enc.tema} className="w-full h-full object-cover min-h-40" />
                        </div>
                      )}
                      <div className="flex-1 p-8 md:p-10 space-y-4">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full opacity-60 w-fit" style={{ backgroundColor: `${verdeMusgo}15`, color: verdeMusgo }}>
                          <Calendar size={10} /> {enc.data}
                        </span>
                        <h3 className="text-2xl italic font-light" style={{ color: azulPetroleo }}>{enc.tema}</h3>
                        <div className="flex flex-wrap gap-3 pt-1">
                          {enc.linkMeet && (
                            <a href={enc.linkMeet} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white rounded-xl"
                              style={{ backgroundColor: verdeMusgo }}>
                              <Video size={11} /> Entrar no Meet
                            </a>
                          )}
                          {enc.linkDrive && (
                            <a href={enc.linkDrive} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl border"
                              style={{ color: verdeMusgo, borderColor: `${verdeMusgo}40` }}>
                              <Download size={11} /> Material / Drive
                            </a>
                          )}
                        </div>
                        <button onClick={() => toggleAberto(enc.id)} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider opacity-30 hover:opacity-60 transition-opacity pt-2" style={{ color: azulPetroleo }}>
                          <MessageCircle size={11}/>
                          {abertos.has(enc.id) ? 'Fechar Caderno Proibido' : 'Abrir Caderno Proibido'}
                          {abertos.has(enc.id) ? <ChevronUp size={11}/> : <ChevronDown size={11}/>}
                        </button>
                      </div>
                    </div>
                    {abertos.has(enc.id) && (
                      <div className="px-8 md:px-10 pb-8 md:pb-10 animate-in fade-in duration-300">
                        <SecaoReflexoesRoda rodaId={enc.id} temaNome={enc.tema}/>
                      </div>
                    )}
                  </div>
                ))}

                {totalEncontrosPages > 1 && (
                  <div className="flex items-center justify-center gap-4 pt-2">
                    <button
                      onClick={() => setPageEncontros(p => Math.max(1, p - 1))}
                      disabled={pageEncontros === 1}
                      className="px-4 py-2 rounded-lg font-bold uppercase text-[9px] tracking-widest disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ backgroundColor: pageEncontros === 1 ? '#ddd' : verdeMusgo, color: 'white' }}
                    >
                      ← Anterior
                    </button>
                    <span className="text-xs italic opacity-60" style={{ color: azulPetroleo }}>{pageEncontros}/{totalEncontrosPages}</span>
                    <button
                      onClick={() => setPageEncontros(p => Math.min(totalEncontrosPages, p + 1))}
                      disabled={pageEncontros >= totalEncontrosPages}
                      className="px-4 py-2 rounded-lg font-bold uppercase text-[9px] tracking-widest disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ backgroundColor: pageEncontros >= totalEncontrosPages ? '#ddd' : verdeMusgo, color: 'white' }}
                    >
                      Próxima →
                    </button>
                  </div>
                )}
              </div>
            )}

            {encerrados.length > 0 && (
              <div className="space-y-6 pt-6">
                <div className="flex items-center gap-6 pb-4">
                  <div className="h-px flex-1 bg-[#8C7B6E]/20" />
                  <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-[#8C7B6E] flex items-center gap-3">
                    <Archive size={14} className="opacity-70" /> Encontros Anteriores
                  </h2>
                  <div className="h-px flex-1 bg-[#8C7B6E]/20" />
                </div>
                <div className="space-y-10">
                  {encerradosPaginados.map(enc => (
                    <div 
                      key={enc.id} 
                      className="group relative bg-[#FAFAF5] border border-[#8C7B6E]/10 rounded-sm shadow-sm transition-all duration-700 hover:shadow-md hover:border-[#8C7B6E]/30"
                    >
                      {/* Efeito de folha dupla/Páginas empilhadas no fundo */}
                      <div className="absolute top-1 left-1 right-[-4px] bottom-[-4px] border border-[#8C7B6E]/10 rounded-sm bg-[#FAFAF5]/50 -z-10 transition-transform group-hover:translate-x-1 group-hover:translate-y-1"></div>
                      
                      {/* Faixa lateral estilo fita de livro */}
                      <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-[#8C7B6E]/20 group-hover:bg-[#8C7B6E]/40 transition-colors duration-500" />
                      <div className="absolute top-0 bottom-0 left-1.5 w-px bg-[#8C7B6E]/10" />

                      <button 
                        onClick={() => toggleAberto(enc.id)} 
                        className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-8 p-8 sm:p-10 pl-10 sm:pl-12 text-left"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-8 sm:gap-10 flex-1">
                          
                          {/* Fotografia vintage refinada com fita crepe visual */}
                          <div className="shrink-0 self-start sm:self-auto relative">
                            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-8 h-3 bg-white/40 border border-white/60 shadow-sm rotate-[-3deg] z-10 hidden sm:block backdrop-blur-sm" />
                            
                            <div className="p-2 bg-white border border-[#8C7B6E]/15 shadow-[0_4px_15px_-5px_rgba(0,0,0,0.05)] rotate-1 group-hover:-rotate-1 transition-transform duration-700 group-hover:scale-105">
                              {enc.imagem ? (
                                <img src={enc.imagem} alt={enc.tema} className="w-full h-40 sm:w-32 sm:h-44 object-cover opacity-95 group-hover:opacity-100 transition-opacity duration-500 relative z-0" />
                              ) : (
                                <div className="w-full h-40 sm:w-32 sm:h-44 bg-[#8C7B6E]/5 flex items-center justify-center border border-[#8C7B6E]/10">
                                  <Archive className="opacity-20 text-[#8C7B6E]" size={24} />
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex-1 space-y-5">
                            <div className="space-y-3">
                              <div className="flex items-center justify-start">
                                <span className="flex items-center gap-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em] pl-3 py-1 border-l border-[#8C7B6E]/30 text-[#8C7B6E]/70 bg-gradient-to-r from-[#8C7B6E]/5 to-transparent">
                                  REGISTRO ❧ {enc.data}
                                </span>
                              </div>
                              <h3 className="font-serif text-3xl sm:text-4xl text-[#4A443F] leading-[1.15] group-hover:text-[#8C7B6E] transition-colors duration-500 tracking-tight">
                                {enc.tema}
                              </h3>
                            </div>
                            
                            <div className="inline-flex items-center gap-3 pt-2">
                              <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-500 ${abertos.has(enc.id) ? 'bg-[#8C7B6E] border-[#8C7B6E] text-white' : 'border-[#8C7B6E]/20 text-[#8C7B6E] group-hover:bg-[#8C7B6E]/10'}`}>
                                <ChevronDown size={14} className={`transition-transform duration-500 ${abertos.has(enc.id) ? 'rotate-180' : '-rotate-90'}`} />
                              </div>
                              <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.2em] text-[#8C7B6E]/80 group-hover:text-[#8C7B6E] transition-colors">
                                {abertos.has(enc.id) ? 'Fechar registro' : 'Deixar reflexão no Caderno'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>

                      {abertos.has(enc.id) && (
                        <div className="px-8 pb-8 sm:px-12 sm:pb-10 pt-0 space-y-8 animate-in fade-in slide-in-from-top-4 duration-700 relative z-10">
                          <div className="flex items-center justify-center opacity-40">
                            <div className="w-16 h-px bg-[#8C7B6E]"></div>
                            <span className="mx-4 text-[#8C7B6E] text-lg font-serif">❦</span>
                            <div className="w-16 h-px bg-[#8C7B6E]"></div>
                          </div>
                          
                          <div className="flex flex-wrap justify-center gap-4">
                            {enc.linkLive && (
                              <a href={enc.linkLive} target="_blank" rel="noopener noreferrer"
                                className="group/btn flex items-center gap-2.5 px-6 py-2.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white bg-[#4A443F] hover:bg-[#8C7B6E] transition-colors duration-500">
                                <Youtube size={14} className="opacity-70 group-hover/btn:opacity-100" /> Gravação do Encontro
                              </a>
                            )}
                            {enc.linkDrive && (
                              <a href={enc.linkDrive} target="_blank" rel="noopener noreferrer"
                                className="group/btn flex items-center gap-2.5 px-6 py-2.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#4A443F] border border-[#8C7B6E]/30 hover:border-[#8C7B6E]/60 hover:bg-[#8C7B6E]/5 transition-all duration-500">
                                <FileText size={14} className="opacity-50 group-hover/btn:opacity-100" /> Material de Estudo
                              </a>
                            )}
                          </div>
                          
                          <div className="pt-6 relative before:absolute before:inset-0 before:bg-white/40 before:rounded-sm before:-z-10 p-6 sm:p-8 border border-[#8C7B6E]/10 shadow-[0_0_20px_rgba(140,123,110,0.03)] mt-6">
                            <SecaoReflexoesRoda rodaId={enc.id} temaNome={enc.tema}/>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {totalEncerradosPages > 1 && (
                  <div className="flex items-center justify-center gap-6 pt-6">
                    <button
                      onClick={() => setPageEncerrados(p => Math.max(1, p - 1))}
                      disabled={pageEncerrados === 1}
                      className="px-6 py-2.5 rounded-full font-bold uppercase text-[10px] tracking-widest text-[#4A443F] bg-[#FAFAF5] border border-[#8C7B6E]/30 hover:bg-[#8C7B6E]/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      ← Anterior
                    </button>
                    <span className="text-xs italic text-[#8C7B6E]" >
                      {pageEncerrados} <span className="opacity-50">/ {totalEncerradosPages}</span>
                    </span>
                    <button
                      onClick={() => setPageEncerrados(p => Math.min(totalEncerradosPages, p + 1))}
                      disabled={pageEncerrados >= totalEncerradosPages}
                      className="px-6 py-2.5 rounded-full font-bold uppercase text-[10px] tracking-widest text-[#4A443F] bg-[#FAFAF5] border border-[#8C7B6E]/30 hover:bg-[#8C7B6E]/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      Próxima →
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>

      <footer>
      </footer>
    </div>
  );
}