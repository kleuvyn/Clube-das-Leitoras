"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { TrendingUp, Trophy, Book, User, ChevronDown, ChevronUp, Loader2, CheckCircle2, Vote, History, Star, ShoppingCart } from "lucide-react";
import { toast } from 'sonner';

const papelEditorial = "#FDFCFB";
const azulPetroleo = "#2C3E50";
const ocre = "#CC7222";

interface Livro {
  id: string;
  titulo: string;
  autor: string;
  capaUrl: string | null;
  indicadoPor: string | null;
  votos: number;
  linkCompra?: string | null;
}

interface Historico {
  id: string;
  periodo: string;
  vencedorTitulo: string;
  vencedorAutor: string;
  vencedorVotos: number;
  totalVotos: number;
  porcentagem: number;
}

interface VotacaoState {
  ativa: boolean;
  prazo: string;
  livros: Livro[];
  historico: Historico[];
}

function getVoterKey(): string {
  if (typeof window === 'undefined') return '';
  let key = localStorage.getItem('clube_voter_key');
  if (!key) {
    key = crypto.randomUUID();
    localStorage.setItem('clube_voter_key', key);
  }
  return key;
}

function getVotoSalvo(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('clube_voto_atual');
}

function salvarVoto(livroId: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('clube_voto_atual', livroId);
}

export default function VotacaoPage() {
  const [dados, setDados] = useState<VotacaoState | null>(null);
  const [loading, setLoading] = useState(true);
  const [votando, setVotando] = useState(false);
  const [votoAtual, setVotoAtual] = useState<string | null>(null);
  const [showSugestao, setShowSugestao] = useState(false);
  const [enviandoSugestao, setEnviandoSugestao] = useState(false);
  const [sugestao, setSugestao] = useState({ titulo: '', autor: '', capaUrl: '', indicadoPor: '' });

  const carregar = useCallback(async () => {
    try {
      const res = await fetch('/api/votacao');
      const data = await res.json();
      setDados(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
    setVotoAtual(getVotoSalvo());
  }, [carregar]);

  const totalVotos = dados?.livros?.reduce((acc, l) => acc + l.votos, 0) || 0;
  const vencedor = dados?.livros?.[0] || null; 

  const votar = async (livroId: string) => {
    if (votoAtual) return toast.error('Você já votou nesta rodada!');
    if (!dados?.ativa) return toast.error('A votação está encerrada.');
    const voterKey = getVoterKey();
    setVotando(true);
    try {
      const res = await fetch('/api/votacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opcaoId: livroId, voterKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          salvarVoto(livroId);
          setVotoAtual(livroId);
          toast.info('Seu voto já estava registrado.');
        } else {
          toast.error(data.error || 'Erro ao votar.');
        }
        return;
      }
      salvarVoto(livroId);
      setVotoAtual(livroId);
      toast.success('🗳️ Seu voto foi registrado!');
      carregar();
    } catch {
      toast.error('Erro de conexão.');
    } finally {
      setVotando(false);
    }
  };

  const enviarSugestao = async () => {
    if (votoAtual) return toast.error('Você já votou nesta rodada — não é possível indicar outro livro.');
    if (!sugestao.titulo.trim() || !sugestao.autor.trim()) {
      return toast.error('Título e autor são obrigatórios.');
    }
    setEnviandoSugestao(true);
    const voterKey = getVoterKey();
    try {
      const res = await fetch('/api/livros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: sugestao.titulo.trim(),
          autor: sugestao.autor.trim(),
          capaUrl: sugestao.capaUrl.trim() || null,
          indicadoPor: sugestao.indicadoPor.trim() || null,
          isVotacao: true,
          voterKey,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) return toast.error('Você já votou nesta rodada!');
        return toast.error(data.error || 'Erro ao enviar sugestão.');
      }
      
      const livroId = data.livroId ?? data.id;
      if (livroId) { salvarVoto(livroId); setVotoAtual(livroId); }
      toast.success(data.message === 'Voto computado!' ? '✨ Livro já cadastrado — seu voto foi somado!' : '📚 Livro indicado com sucesso!');
      setSugestao({ titulo: '', autor: '', capaUrl: '', indicadoPor: '' });
      setShowSugestao(false);
      carregar();
    } catch {
      toast.error('Erro de conexão.');
    } finally {
      setEnviandoSugestao(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-alice text-[#2C3E50] opacity-30 italic">
      Carregando votação...
    </div>
  );

  return (
    <div className="min-h-screen pb-32 font-alice relative overflow-hidden"
         style={{ background: `#FDFCFB url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')` }}>

      
      <header className="max-w-5xl mx-auto pt-32 pb-24 px-6 text-center border-b border-black/5">
        <div className="flex items-center justify-center gap-4 mb-8 opacity-40">
          <div className="h-px w-10 bg-black" />
          <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-black italic">
            {dados?.ativa ? `Votação Aberta · Prazo: ${dados.prazo || 'Em aberto'}` : 'Votação Encerrada'}
          </span>
          <div className="h-px w-10 bg-black" />
        </div>

        <h1 className="text-7xl md:text-[100px] text-[#2C3E50] tracking-tighter leading-[0.8] mb-10">
          Nossas <span style={{ color: ocre }} className="italic font-light">Escolhas</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-3xl mx-auto border-t border-black/10 pt-10">
          <p className="text-base leading-relaxed opacity-60 text-black italic">
            {dados?.ativa
              ? '"Votar é dar voz ao nosso desejo de descoberta. Cada título aqui floresce em nossas conversas."'
              : '"As escolhas que fizemos juntas nos trouxeram até aqui. Aguarde a próxima rodada."'}
          </p>
          <div className="flex flex-col justify-end items-start md:items-end gap-3">
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-sans font-bold" style={{ color: ocre }}>
              <Vote size={14} /> {totalVotos} {totalVotos === 1 ? 'voto' : 'votos'} registrados
            </div>
            {votoAtual && (
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full" style={{ color: ocre, backgroundColor: `${ocre}15` }}>
                <CheckCircle2 size={12}/> Você já votou
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 space-y-24 mt-24">

        
        {dados?.livros && dados.livros.length > 0 ? (
          <section className="space-y-10">
            <div className="mb-8 text-center text-[12px] font-bold uppercase tracking-widest opacity-60 text-black">
              Clique em um livro para votar ou indique um novo abaixo.
            </div>
            
            {totalVotos > 0 && vencedor && (
              <div className="relative overflow-hidden rounded-[3rem] p-10 md:p-14 border-2"
                   style={{ borderColor: `${ocre}40`, background: `linear-gradient(135deg, ${ocre}08 0%, ${ocre}02 100%)` }}>
                <div className="flex items-center gap-3 mb-6">
                  <Trophy size={18} style={{ color: ocre }} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.5em]" style={{ color: ocre }}>Liderando</span>
                </div>
                <div className="flex gap-8 items-start">
                  {vencedor.capaUrl && (
                    <img src={vencedor.capaUrl} alt={vencedor.titulo}
                         className="w-24 h-32 object-cover rounded-2xl shadow-lg shrink-0" />
                  )}
                  <div className="space-y-2">
                    <h2 className="text-4xl italic font-light" style={{ color: azulPetroleo }}>{vencedor.titulo}</h2>
                    <p className="text-sm uppercase tracking-widest opacity-40" style={{ color: azulPetroleo }}>por {vencedor.autor}</p>
                    {vencedor.indicadoPor && (
                      <p className="text-xs italic opacity-30">indicado por {vencedor.indicadoPor}</p>
                    )}
                    <div className="flex items-baseline gap-3 pt-2">
                      <span className="text-5xl font-light italic" style={{ color: ocre }}>
                        {totalVotos > 0 ? Math.round((vencedor.votos / totalVotos) * 100) : 0}%
                      </span>
                      <span className="text-xs opacity-40">{vencedor.votos} {vencedor.votos === 1 ? 'voto' : 'votos'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            
            <div className="space-y-8">
              {dados.livros.map((livro, idx) => {
                const pct = totalVotos > 0 ? Math.round((livro.votos / totalVotos) * 100) : 0;
                const foiVotado = votoAtual === livro.id;
                const isWinning = idx === 0 && totalVotos > 0;

                return (
                  <div key={livro.id} className="group bg-white/60 border border-black/5 rounded-[2.5rem] p-8 md:p-10 space-y-5 hover:bg-white transition-all">
                    <div className="flex gap-6 items-start">
                      {livro.capaUrl ? (
                        <img src={livro.capaUrl} alt={livro.titulo}
                             className="w-16 h-22 object-cover rounded-xl shadow shrink-0" />
                      ) : (
                        <div className="w-16 h-22 rounded-xl bg-black/5 flex items-center justify-center shrink-0">
                          <Book size={20} className="opacity-20"/>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-4 mb-1">
                          <h3 className="text-2xl italic font-light" style={{ color: azulPetroleo }}>{livro.titulo}</h3>
                          <span className="text-3xl font-light italic shrink-0" style={{ color: ocre }}>{pct}%</span>
                        </div>
                        <p className="text-[11px] uppercase tracking-widest opacity-40" style={{ color: azulPetroleo }}>por {livro.autor}</p>
                        {livro.indicadoPor && (
                          <p className="text-xs italic opacity-30 mt-1">indicado por {livro.indicadoPor}</p>
                        )}
                        {livro.linkCompra && (
                          <a href={livro.linkCompra} target="_blank" rel="noopener noreferrer"
                             className="inline-flex items-center gap-1.5 mt-1 text-[9px] font-bold uppercase tracking-widest opacity-50 hover:opacity-90 transition-opacity"
                             style={{ color: ocre }}>
                            <ShoppingCart size={9}/> Onde comprar
                          </a>
                        )}
                      </div>
                    </div>

                    
                    <div className="h-2 w-full rounded-full bg-black/5 overflow-hidden">
                      <div className="h-full transition-all duration-700 ease-out rounded-full"
                           style={{ width: `${pct}%`, backgroundColor: ocre, opacity: isWinning ? 1 : 0.4 }}/>
                    </div>

                    
                    {dados.ativa && (
                      <button
                        onClick={() => votar(livro.id)}
                        disabled={votando || !!votoAtual}
                        className={`w-full py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                          foiVotado
                            ? 'bg-[#CC7222] text-white border-transparent shadow-lg'
                            : votoAtual
                            ? 'bg-transparent text-black/20 border-black/5 cursor-not-allowed'
                            : 'bg-white text-[#2C3E50] border-black/10 hover:border-[#CC7222]/40 hover:bg-white'
                        }`}
                      >
                        {votando ? <Loader2 size={14} className="animate-spin mx-auto"/> :
                         foiVotado ? '✓ Seu voto' :
                         votoAtual ? 'Votação encerrada para você' : 'Escolher esta leitura →'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <div className="text-center py-24 opacity-30 space-y-4">
            <Vote size={48} className="mx-auto" style={{ color: ocre }}/>
            <p className="italic text-xl" style={{ color: azulPetroleo }}>Nenhum livro indicado ainda.</p>
          </div>
        )}

        
        <section className="space-y-8">
          <div className="flex items-center gap-6">
            <div className="h-px flex-1 bg-black/5"/>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.6em] opacity-40" style={{ color: azulPetroleo }}>Indicar um Livro</h2>
            <div className="h-px flex-1 bg-black/5"/>
          </div>

          {votoAtual ? (
            <div className="bg-white/50 rounded-[3rem] border border-black/5 p-10 text-center space-y-3">
              <CheckCircle2 size={28} style={{ color: ocre }} className="mx-auto"/>
              <p className="text-lg italic font-light" style={{ color: azulPetroleo }}>Seu voto já foi registrado nesta rodada.</p>
              <p className="text-sm italic opacity-40" style={{ color: azulPetroleo }}>Aguarde o resultado — você poderá votar novamente na próxima rodada.</p>
            </div>
          ) : (
            <div className="bg-white/50 rounded-[3rem] border border-black/5 overflow-hidden">
              <button onClick={() => setShowSugestao(s => !s)}
                      className="w-full flex items-center justify-between p-10 text-left hover:bg-white/80 transition-colors">
                <div className="space-y-2">
                  <h3 className="text-3xl italic font-light" style={{ color: azulPetroleo }}>
                    Tem um livro em <span style={{ color: ocre }}>mente?</span>
                  </h3>
                  <p className="text-sm italic opacity-50" style={{ color: azulPetroleo }}>
                    Indique e, se já houver outra votante com o mesmo livro, seu voto será somado.
                  </p>
                </div>
                {showSugestao ? <ChevronUp size={20} className="opacity-30"/> : <ChevronDown size={20} className="opacity-30"/>}
              </button>

              {showSugestao && (
                <div className="px-10 pb-10 space-y-5 border-t border-black/5 pt-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      value={sugestao.titulo}
                      onChange={e => setSugestao(s => ({ ...s, titulo: e.target.value }))}
                      placeholder="Título do livro *"
                      className="w-full p-4 bg-[#FDFCFB] rounded-2xl text-sm outline-none border border-black/5 font-alice italic"
                    />
                    <input
                      value={sugestao.autor}
                      onChange={e => setSugestao(s => ({ ...s, autor: e.target.value }))}
                      placeholder="Autora / Autor *"
                      className="w-full p-4 bg-[#FDFCFB] rounded-2xl text-sm outline-none border border-black/5 font-alice"
                    />
                  </div>
                  <input
                    value={sugestao.capaUrl}
                    onChange={e => setSugestao(s => ({ ...s, capaUrl: e.target.value }))}
                    placeholder="Link da capa (URL da imagem, opcional)"
                    className="w-full p-4 bg-[#FDFCFB] rounded-2xl text-sm outline-none border border-black/5 font-alice"
                  />
                  <input
                    value={sugestao.indicadoPor}
                    onChange={e => setSugestao(s => ({ ...s, indicadoPor: e.target.value }))}
                    placeholder="Seu nome (opcional)"
                    className="w-full p-4 bg-[#FDFCFB] rounded-2xl text-sm outline-none border border-black/5 font-alice"
                  />
                  <button
                    onClick={enviarSugestao}
                    disabled={enviandoSugestao}
                    className="flex items-center gap-2 px-8 py-4 text-white text-[10px] font-bold uppercase tracking-widest rounded-2xl disabled:opacity-40 transition-opacity"
                    style={{ backgroundColor: ocre }}
                  >
                    {enviandoSugestao ? <Loader2 size={14} className="animate-spin"/> : <Star size={14}/>}
                    Indicar para o Clube
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        
        {dados?.historico && dados.historico.length > 0 && (
        {!dados.ativa && dados?.historico && dados.historico.length > 0 && (
          <section className="space-y-10 border-t border-black/5 pt-16">
            <div className="flex items-center gap-6">
              <History size={18} style={{ color: ocre }} className="opacity-50"/>
              <h3 className="text-3xl italic font-light" style={{ color: azulPetroleo }}>Escolhas Anteriores</h3>
              <div className="h-px flex-1 bg-black/5"/>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {dados.historico.map(h => (
                <div key={h.id} className="flex gap-6 group items-center">
                  <div className="w-20 h-24 rounded-2xl flex flex-col items-center justify-center shrink-0 transition-all group-hover:shadow-xl"
                       style={{ background: `${ocre}15` }}>
                    <span className="text-sm font-mono font-bold" style={{ color: ocre }}>{h.porcentagem}%</span>
                    <span className="text-[8px] font-mono font-bold opacity-30 uppercase">{h.totalVotos} v.</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-mono font-bold uppercase tracking-widest opacity-30" style={{ color: azulPetroleo }}>{h.periodo}</p>
                    <h4 className="text-xl italic font-light" style={{ color: azulPetroleo }}>{h.vencedorTitulo}</h4>
                    <p className="text-[10px] font-mono uppercase tracking-widest opacity-40" style={{ color: azulPetroleo }}>por {h.vencedorAutor}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
