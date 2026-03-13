"use client";

import React, { useEffect, useState } from 'react';
import { Globe, Calendar, Laptop, ArrowRight, Info, Video, Download, Archive, ChevronDown, ChevronUp, Loader2, Youtube, FileText, Send, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

const papelEditorial = "#FDFCFB";
const azulPetroleo = "#2C3E50";
const verdeMusgo = "#4F5E46"; 

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
  texto: string;
  createdAt: string;
}

function SecaoReflexoesRoda({ rodaId, temaNome }: { rodaId: string; temaNome: string }) {
  const [reflexoes, setReflexoes] = useState<ReflexaoRoda[]>([]);
  const [loadingR, setLoadingR] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [nome, setNome] = useState('');
  const [texto, setTexto] = useState('');

  const carregar = async () => {
    setLoadingR(true);
    try {
      const res = await fetch(`/api/rodaonline/reflexoes?rodaId=${rodaId}`);
      const data = await res.json();
      setReflexoes(Array.isArray(data) ? data : []);
    } catch {}
    finally { setLoadingR(false); }
  };

  useEffect(() => { carregar(); }, [rodaId]);

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
            <div key={r.id} className="bg-white/60 rounded-2xl p-5 space-y-2 border border-black/5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: verdeMusgo }}>{r.autoraNome}</span>
                <span className="text-[9px] opacity-30">{new Date(r.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
              <p className="text-sm italic leading-relaxed opacity-70" style={{ color: azulPetroleo }}>"{r.texto}"</p>
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
                <h2 className="text-6xl md:text-7xl tracking-tighter leading-[0.9] text-[#2C3E50]">{conteudo.titulo}</h2>
                <p className="text-2xl italic font-light opacity-50 text-[#2C3E50]">Escrito por {conteudo.autora}</p>
              </div>

              
              <div className="text-base leading-tight space-y-3 font-light italic text-[#2C3E50]/80">
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
                <div className="pt-4 border-t border-black/5">
                  <button
                    onClick={() => setHeroAberto(p => !p)}
                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider opacity-30 hover:opacity-60 transition-opacity"
                    style={{ color: azulPetroleo }}
                  >
                    <MessageCircle size={11}/>
                    {heroAberto ? 'Fechar Reflexões' : 'Reflexões deste Encontro'}
                    {heroAberto ? <ChevronUp size={11}/> : <ChevronDown size={11}/>}
                  </button>
                  {heroAberto && (
                    <div className="mt-4 animate-in fade-in duration-300">
                      <SecaoReflexoesRoda rodaId={heroRodaId} temaNome={conteudo.titulo}/>
                    </div>
                  )}
                </div>
              )}
          </div>
        </section>

        {/* Cronograma de Encontros */}
        {(encontros.length > 0 || encerrados.length > 0) && <section className="mt-24 space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-black/5" />
            <h2 className="text-[10px] font-bold uppercase tracking-[0.6em] opacity-40 flex items-center gap-2" style={{ color: azulPetroleo }}>
              <Calendar size={12} /> Cronograma de Encontros
            </h2>
            <div className="h-px flex-1 bg-black/5" />
          </div>

          {encontros.length === 0 ? (
            <div className="text-center py-16 space-y-4 opacity-30">
              <Calendar size={36} className="mx-auto" />
              <p className="italic text-lg" style={{ color: azulPetroleo }}>Em breve novas datas serão anunciadas.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {encontros.map(enc => (
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
                        {abertos.has(enc.id) ? 'Fechar Reflexões' : 'Reflexões deste Encontro'}
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
            </div>
          )}

          {encerrados.length > 0 && (
            <div className="space-y-6 pt-6">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-black/5" />
                <h2 className="text-[10px] font-bold uppercase tracking-[0.6em] opacity-40 flex items-center gap-2" style={{ color: azulPetroleo }}>
                  <Archive size={12} /> Encontros Anteriores
                </h2>
                <div className="h-px flex-1 bg-black/5" />
              </div>
              <div className="space-y-4">
                {encerrados.map(enc => (
                  <div key={enc.id} className="border border-black/5 rounded-[2.5rem] overflow-hidden bg-white/60">
                    <button onClick={() => toggleAberto(enc.id)} className="w-full flex items-center justify-between gap-4 p-7 text-left hover:bg-white/80 transition-colors">
                      <div className="flex items-center gap-5">
                        {enc.imagem && <img src={enc.imagem} alt={enc.tema} className="w-14 h-14 object-cover rounded-2xl opacity-70" />}
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-widest opacity-40" style={{ color: azulPetroleo }}>{enc.data}</span>
                          <p className="text-lg italic font-light opacity-60" style={{ color: azulPetroleo }}>{enc.tema}</p>
                        </div>
                      </div>
                      <ChevronDown size={16} className={`opacity-30 shrink-0 transition-transform duration-300 ${abertos.has(enc.id) ? 'rotate-180' : ''}`} />
                    </button>
                    {abertos.has(enc.id) && (
                      <div className="px-7 pb-7 space-y-4 animate-in fade-in duration-300">
                        <div className="flex flex-wrap gap-3">
                          {enc.linkLive && (
                            <a href={enc.linkLive} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white rounded-xl"
                              style={{ backgroundColor: '#c0392b' }}>
                              <Youtube size={11} /> Assistir Gravação
                            </a>
                          )}
                          {enc.linkDrive && (
                            <a href={enc.linkDrive} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl border"
                              style={{ color: verdeMusgo, borderColor: `${verdeMusgo}40` }}>
                              <FileText size={11} /> Material
                            </a>
                          )}
                        </div>
                        <SecaoReflexoesRoda rodaId={enc.id} temaNome={enc.tema}/>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>}
      </main>

      <footer>
      </footer>
    </div>
  );
}