"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Trophy, Book, ChevronDown, ChevronUp, Loader2, CheckCircle2, Vote, History, Star, ShoppingCart } from "lucide-react";
import { toast } from 'sonner';

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
      const salvo = localStorage.getItem('clube_voto_atual');
      if (salvo && data.ativa) {
        const livroAindaExiste = data.livros.some((l: Livro) => l.id === salvo);
        if (!livroAindaExiste) {
          localStorage.removeItem('clube_voto_atual');
          setVotoAtual(null);
        } else {
          setVotoAtual(salvo);
        }
      } else {
        setVotoAtual(salvo);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const totalVotos = dados?.livros?.reduce((acc, l) => acc + l.votos, 0) || 0;
  const vencedor = dados?.livros?.[0] || null;

  const votar = async (livroId: string) => {
    if (votoAtual) return toast.error('Você já votou nesta rodada!');
    if (!dados?.ativa) return toast.error('A votação está encerrada.');
    setVotando(true);
    try {
      const res = await fetch('/api/votacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opcaoId: livroId, voterKey: getVoterKey() }),
      });
      if (!res.ok) throw new Error('Erro ao votar');
      localStorage.setItem('clube_voto_atual', livroId);
      setVotoAtual(livroId);
      toast.success('🗳️ Voto registrado!');
      await carregar();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setVotando(false);
    }
  };

  const enviarSugestao = async () => {
    if (!sugestao.titulo.trim() || !sugestao.autor.trim()) return toast.error('Preencha os campos.');
    setEnviandoSugestao(true);
    try {
      const res = await fetch('/api/livros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...sugestao, isVotacao: true, voterKey: getVoterKey() }),
      });
      if (!res.ok) throw new Error('Erro ao indicar');
      toast.success('📚 Sugestão enviada!');
      setSugestao({ titulo: '', autor: '', capaUrl: '', indicadoPor: '' });
      setShowSugestao(false);
      await carregar();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setEnviandoSugestao(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center italic opacity-30 font-alice">Abrindo os portões do clube...</div>;

  return (
    <div className="min-h-screen pb-32 font-alice relative" style={{ background: `#FDFCFB url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')` }}>
      
      {/* HEADER EDITORIAL */}
      <header className="max-w-5xl mx-auto pt-32 pb-20 px-6 text-center border-b border-black/5">
        <div className="flex items-center justify-center gap-4 mb-8 opacity-40">
          <div className="h-px w-10 bg-black" />
          <span className="text-[10px] font-bold uppercase tracking-[0.6em] italic text-black">
            {dados?.ativa ? `Votação Aberta · ${dados.prazo}` : 'Votação em Pausa'}
          </span>
          <div className="h-px w-10 bg-black" />
        </div>

        <h1 className="text-7xl md:text-[100px] text-[#2C3E50] tracking-tighter leading-[0.8] mb-10">
          Nossas <span style={{ color: ocre }} className="italic font-light">Escolhas</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-3xl mx-auto border-t border-black/10 pt-10">
          <p className="text-base leading-relaxed text-black/60 italic">
            "Escolher um livro é traçar o mapa da nossa próxima aventura coletiva. Qual horizonte vamos explorar?"
          </p>
          <div className="flex flex-col justify-end items-start md:items-end gap-3">
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-bold text-black">
              <Vote size={14} className="text-[#CC7222]" /> {totalVotos} participações registradas
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 space-y-24 mt-20">
        
        {/* DESTAQUE DO MOMENTO */}
        <section className="space-y-12">
          {totalVotos > 0 && vencedor && (
            <div className="relative overflow-hidden rounded-[3rem] p-10 border-2 transition-all hover:shadow-2xl"
                 style={{ borderColor: `${ocre}30`, background: `linear-gradient(135deg, ${ocre}08 0%, ${ocre}02 100%)` }}>
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="w-32 h-48 shrink-0 overflow-hidden rounded-2xl shadow-xl border-4 border-white bg-white">
                  {vencedor.capaUrl ? (
                    <img src={vencedor.capaUrl} alt={vencedor.titulo} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-10"><Book size={40}/></div>
                  )}
                </div>
                <div className="space-y-3 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.5em]" style={{ color: ocre }}>Preferido do Momento</span>
                  <h2 className="text-4xl italic font-light text-black">{vencedor.titulo}</h2>
                  <p className="text-xs uppercase tracking-widest text-black/40">por {vencedor.autor}</p>
                  <div className="flex items-baseline gap-4 pt-4">
                    <span className="text-6xl font-light italic" style={{ color: ocre }}>
                      {Math.round((vencedor.votos / totalVotos) * 100)}%
                    </span>
                    <span className="text-xs text-black/30 font-bold uppercase tracking-tighter">{vencedor.votos} votos</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LISTA DE CANDIDATOS COM AS FOFINHAS (CAPAS) */}
          <div className="grid grid-cols-1 gap-6">
            {dados?.livros.map((livro, idx) => {
              const pct = totalVotos > 0 ? Math.round((livro.votos / totalVotos) * 100) : 0;
              const foiVotado = votoAtual === livro.id;

              return (
                <div key={livro.id} className="group bg-white/60 border border-black/5 rounded-[2.5rem] p-8 transition-all hover:bg-white hover:shadow-sm">
                  <div className="flex gap-6 items-center">
                    <div className="w-20 h-28 shrink-0 overflow-hidden rounded-xl shadow-sm border border-black/5 bg-slate-50">
                        {livro.capaUrl ? (
                            <img src={livro.capaUrl} alt={livro.titulo} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center opacity-20"><Book size={20} /></div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-2xl italic font-light truncate text-black pr-4">{livro.titulo}</h3>
                        <span className="text-2xl font-light italic" style={{ color: ocre }}>{pct}%</span>
                      </div>
                      <p className="text-[10px] uppercase tracking-widest text-black/40 mb-4">por {livro.autor}</p>
                      
                      <div className="h-1.5 w-full rounded-full bg-black/5 overflow-hidden mb-6">
                        <div className="h-full transition-all duration-1000 rounded-full"
                             style={{ width: `${pct}%`, backgroundColor: ocre, opacity: idx === 0 ? 1 : 0.4 }}/>
                      </div>

                      <button
                        onClick={() => votar(livro.id)}
                        disabled={votando || !!votoAtual}
                        className={`w-full py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                          foiVotado ? 'bg-[#CC7222] text-white border-transparent shadow-lg' : 
                          votoAtual ? 'opacity-20 grayscale cursor-not-allowed text-black/40' : 
                          'hover:border-[#CC7222] hover:text-[#CC7222] text-black/60'
                        }`}
                      >
                        {foiVotado ? '✓ Sua Escolha' : votoAtual ? 'Votação Concluída' : 'Votar neste livro'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ÁREA DE SUGESTÃO */}
        <section className="space-y-8">
          <div className="bg-white/40 border border-black/5 rounded-[3rem] overflow-hidden">
            <button onClick={() => !votoAtual && setShowSugestao(!showSugestao)} 
                    className={`w-full p-10 text-left transition-colors ${votoAtual ? 'cursor-default opacity-50' : 'hover:bg-white/60'}`}>
              <div className="flex justify-between items-center">
                <h3 className="text-3xl italic font-light text-black">Alguma sugestão em mente?</h3>
                {!votoAtual && (showSugestao ? <ChevronUp size={20}/> : <ChevronDown size={20}/>)}
              </div>
            </button>
            {showSugestao && !votoAtual && (
              <div className="px-10 pb-10 space-y-4 pt-4 animate-in slide-in-from-top-2">
                <div className="grid md:grid-cols-2 gap-4">
                  <input placeholder="Título *" className="p-4 rounded-xl border border-black/5 bg-white italic outline-none"
                         value={sugestao.titulo} onChange={e => setSugestao({...sugestao, titulo: e.target.value})} />
                  <input placeholder="Autor(a) *" className="p-4 rounded-xl border border-black/5 bg-white outline-none"
                         value={sugestao.autor} onChange={e => setSugestao({...sugestao, autor: e.target.value})} />
                </div>
                <button onClick={enviarSugestao} disabled={enviandoSugestao} 
                        className="bg-[#CC7222] text-white px-8 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                  {enviandoSugestao ? 'Enviando...' : 'Registrar Indicação'}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* HISTÓRICO RESTAURADO */}
        {dados?.historico && dados.historico.length > 0 && (
          <section className="pt-20 border-t border-black/5">
            <div className="flex items-center gap-4 mb-12 opacity-30 text-black">
              <History size={16}/>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.5em]">Memória de Escolhas</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-10">
              {dados.historico.map(h => (
                <div key={h.id} className="flex gap-6 group">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 border border-black/5 bg-white text-ocre text-sm font-bold italic shadow-sm" style={{ color: ocre }}>
                    {h.porcentagem}%
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase opacity-30 tracking-widest text-black">{h.periodo}</p>
                    <h4 className="text-lg italic font-light text-black">{h.vencedorTitulo}</h4>
                    <p className="text-[10px] uppercase opacity-40 text-black">{h.vencedorAutor}</p>
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