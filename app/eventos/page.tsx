"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import {
  MapPin, Clock, Camera,
  DollarSign, Phone, ExternalLink, CheckCircle2, XCircle, Users, Calendar,
  Star, ArrowLeft,
} from "lucide-react";

const ocreDestaque = "var(--page-color)";

const fotosClubeDoLivro = [
  "/Clube%20do%20Livro/20260222_103046.jpg",
  "/Clube%20do%20Livro/20260222_103050.jpg",
  "/Clube%20do%20Livro/05cc4bfe-a161-4e28-8ab0-d8c237e3c352.jpg",
  "/Clube%20do%20Livro/16556b6a-79c0-4f6b-aad7-51060b8bea3b.jpg",
  "/Clube%20do%20Livro/23bcdf68-eecc-451c-9b3f-f915ac64758f.jpg",
  "/Clube%20do%20Livro/25e39576-54b3-4511-90fb-b35429a7268f.jpg",
  "/Clube%20do%20Livro/3e440074-a493-45b8-82af-315254a52778.jpg",
  "/Clube%20do%20Livro/47011e31-a35a-4d75-b581-a6fcd0a29a58.jpg",
  "/Clube%20do%20Livro/54263aa5-18ea-4e3c-ae4c-92beb3d3a917.jpg",
  "/Clube%20do%20Livro/8db3fd79-26e0-40d1-a5d2-af5b9d4c1653.jpg",
  "/Clube%20do%20Livro/96764b63-fa3a-4b3a-81d2-c4193d5f56ac.jpg",
  "/Clube%20do%20Livro/a19ae900-4873-412f-ab48-49a9ff536cd6.jpg",
  "/Clube%20do%20Livro/c0907d86-7c41-42e4-9cb0-1756f560a0df.jpg",
  "/Clube%20do%20Livro/c120a400-cad2-4baf-ac15-322299acfbe7.jpg",
  "/Clube%20do%20Livro/d94864d3-50b1-4559-ab74-30539fae8f7a.jpg",
  "/Clube%20do%20Livro/dc9234b0-5ab1-4d61-9ea4-d36b63c7fda9.jpg",
  "/Clube%20do%20Livro/e50fbd41-56ad-4b64-a45d-e2037cc1d438.jpg",
  "/Clube%20do%20Livro/f0b29818-1aeb-40bf-a389-1b506922c442.jpg",
  "/Clube%20do%20Livro/faeb0a68-254a-45e7-bb28-69318f2580e3.jpg",
  "/Clube%20do%20Livro/F98E7F83-DC7E-4426-AAE6-E63DAACB0E6D.png",
  "/Clube%20do%20Livro/IMG_4233.JPG",
  "/Clube%20do%20Livro/IMG_4394.JPG",
  "/Clube%20do%20Livro/IMG_4427.PNG",
  "/Clube%20do%20Livro/IMG_4428.PNG",
  "/Clube%20do%20Livro/IMG_4429.PNG",
  "/Clube%20do%20Livro/IMG_4430.PNG",
  "/Clube%20do%20Livro/IMG_4431.PNG",
  "/Clube%20do%20Livro/IMG_4432.PNG",
  "/Clube%20do%20Livro/IMG_4433.PNG",
  "/Clube%20do%20Livro/IMG_4434.PNG",
  "/Clube%20do%20Livro/IMG_4435.PNG",
  "/Clube%20do%20Livro/IMG_4436.PNG",
  "/Clube%20do%20Livro/IMG_4437.PNG",
];

interface Evento {
  id: string;
  titulo: string;
  dataFormatada: string;
  horario: string;
  local: string;
  descricao: string;
  imagemPadrao: string;
  valor: string | null;
  telefone: string | null;
  linkInscricao: string | null;
  totalVou: number;
  totalNaoVou: number;
}

function getUserEmail(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/clube-user-email=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [fotosGaleria, setFotosGaleria] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [ativo, setAtivo] = useState<Evento | null>(null);
  const [rsvp, setRsvp] = useState<Record<string, 'vou' | 'nao_vou' | null>>({});
  const [rsvpLoading, setRsvpLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const email = getUserEmail();
    setUserEmail(email);

    async function carregarDados() {
      try {
        const res = await fetch('/api/eventos');
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped = data.map((e: any) => ({
            id: e.id,
            titulo: e.title || '',
            dataFormatada: e.date
              ? new Date(e.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', timeZone: 'UTC' })
              : '',
            horario: e.horaInicio || '',
            local: e.location || '',
            descricao: e.description || '',
            imagemPadrao: e.imageUrl || '',
            valor: e.valor ?? null,
            telefone: e.telefone ?? null,
            linkInscricao: e.linkInscricao ?? null,
            totalVou: e.totalVou ?? 0,
            totalNaoVou: e.totalNaoVou ?? 0,
          }));
          setEventos(mapped);

          if (email && mapped.length > 0) {
            const respostas: Record<string, 'vou' | 'nao_vou' | null> = {};
            await Promise.all(mapped.map(async (ev: Evento) => {
              try {
                const r = await fetch(`/api/eventos/confirmar?eventoId=${ev.id}&email=${encodeURIComponent(email)}`);
                const d = await r.json();
                respostas[ev.id] = d.status ?? null;
              } catch { respostas[ev.id] = null; }
            }));
            setRsvp(respostas);
          }
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    carregarDados();

    const sortear = () => {
      setFotosGaleria([...fotosClubeDoLivro].sort(() => Math.random() - 0.5).slice(0, 4));
    };
    sortear();
    const intervalo = setInterval(sortear, 5000);
    return () => clearInterval(intervalo);
  }, []);

  const handleRsvp = useCallback(async (eventoId: string, status: 'vou' | 'nao_vou') => {
    if (!userEmail) return;
    const anterior = rsvp[eventoId];
    const novoStatus = anterior === status ? null : status;
    setRsvpLoading(p => ({ ...p, [eventoId]: true }));
    setRsvp(p => ({ ...p, [eventoId]: novoStatus }));
    setEventos(prev => prev.map(ev => {
      if (ev.id !== eventoId) return ev;
      let vou = ev.totalVou;
      let nao = ev.totalNaoVou;
      if (anterior === 'vou') vou--;
      if (anterior === 'nao_vou') nao--;
      if (novoStatus === 'vou') vou++;
      if (novoStatus === 'nao_vou') nao++;
      const updated = { ...ev, totalVou: Math.max(0, vou), totalNaoVou: Math.max(0, nao) };
      if (ativo?.id === eventoId) setAtivo(updated);
      return updated;
    }));
    try {
      if (novoStatus === null) {
        await fetch(`/api/eventos/confirmar?eventoId=${eventoId}&email=${encodeURIComponent(userEmail)}`, { method: 'DELETE' });
      } else {
        await fetch('/api/eventos/confirmar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventoId, email: userEmail, status: novoStatus }),
        });
      }
    } catch {}
    finally { setRsvpLoading(p => ({ ...p, [eventoId]: false })); }
  }, [userEmail, rsvp, ativo]);

  const abrirDetalhe = (ev: Evento) => setAtivo(ev);
  const fecharDetalhe = () => setAtivo(null);

  /* ─── VISTA DETALHE — estilo Livro do Mês ─── */
  if (ativo) {
    return (
      <div className="min-h-screen font-alice pb-40 relative overflow-hidden" style={{ background: `#FDFCFB url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')` }}>
        <header className="max-w-7xl mx-auto pt-32 pb-8 px-6 border-b border-black/5">
          <button
            onClick={fecharDetalhe}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft size={13} /> Voltar aos eventos
          </button>
        </header>

        <main className="max-w-7xl mx-auto px-6 pt-16">
          <div className="grid lg:grid-cols-12 gap-16 items-start">

            {/* Sidebar esquerda — lista */}
            <aside className="lg:col-span-3 border-r border-black/5 pr-8 space-y-2">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-30 text-black mb-6">
                Próximos Encontros
              </p>
              {eventos.map(ev => {
                const isAtivo = ativo.id === ev.id;
                return (
                  <button
                    key={ev.id}
                    onClick={() => setAtivo(ev)}
                    className={`w-full text-left transition-all duration-300 py-4 border-b border-black/5 ${
                      isAtivo ? 'opacity-100 translate-x-1' : 'opacity-40 hover:opacity-70'
                    }`}
                  >
                    <span className="text-[8px] font-bold uppercase tracking-widest text-black block mb-1 opacity-60">
                      {ev.dataFormatada}
                    </span>
                    <span
                      className="text-base italic block leading-tight"
                      style={{ color: isAtivo ? 'var(--page-color)' : 'black' }}
                    >
                      {ev.titulo}
                    </span>
                    {ev.horario && (
                      <span className="text-[8px] opacity-40 flex items-center gap-1 mt-1">
                        <Clock size={9} /> {ev.horario}
                      </span>
                    )}
                  </button>
                );
              })}
            </aside>

            {/* Centro — detalhe */}
            <article className="lg:col-span-6 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className="text-[9px] font-bold uppercase tracking-[0.4em] px-3 py-1 border border-black/10 rounded-full"
                    style={{ color: ocreDestaque }}
                  >
                    Encontro
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.4em] px-3 py-1 border border-black/20 rounded-full text-slate-500">
                    {ativo.dataFormatada}
                  </span>
                </div>
                <h2 className="text-6xl md:text-7xl text-[#2C3E50] tracking-tighter leading-[0.9]">
                  {ativo.titulo}
                </h2>
              </div>

              <div className="relative group max-w-lg">
                <div className="bg-white p-4 shadow-xl border border-black/5 -rotate-1 group-hover:rotate-0 transition-transform duration-700">
                  {ativo.imagemPadrao ? (
                    <Image
                      src={ativo.imagemPadrao}
                      alt={ativo.titulo}
                      width={0}
                      height={0}
                      sizes="100vw"
                      style={{ width: '100%', height: 'auto' }}
                    />
                  ) : (
                    <div className="w-full aspect-video flex flex-col items-center justify-center bg-[#FDFCFB] border border-dashed border-black/10 gap-4">
                      <Camera size={32} className="opacity-10" />
                      <span className="text-[9px] uppercase font-bold tracking-widest opacity-20">Foto em breve</span>
                    </div>
                  )}
                  <div className="mt-3 pt-3 border-t border-black/5">
                    <span className="text-[8px] font-bold uppercase tracking-[0.3em] opacity-25 block text-center italic">
                      Clube das Leitoras · {new Date().getFullYear()}
                    </span>
                  </div>
                </div>
              </div>

              {ativo.descricao && (
                <div className="pt-4 border-t border-black/5">
                  <p className="text-xl italic leading-relaxed opacity-60 text-black">
                    &ldquo;{ativo.descricao}&rdquo;
                  </p>
                </div>
              )}

              <div className="pt-6 border-t border-black/5 space-y-4">
                {userEmail ? (
                  <>
                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-40">Confirmar presença</p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleRsvp(ativo.id, 'vou')}
                        disabled={rsvpLoading[ativo.id]}
                        className={`flex items-center gap-2 px-7 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                          rsvp[ativo.id] === 'vou' ? 'border-transparent text-white' : 'border-current opacity-50 hover:opacity-80 text-black'
                        }`}
                        style={rsvp[ativo.id] === 'vou' ? { backgroundColor: ocreDestaque, borderColor: ocreDestaque } : {}}
                      >
                        <CheckCircle2 size={14} /> Vou!
                      </button>
                      <button
                        onClick={() => handleRsvp(ativo.id, 'nao_vou')}
                        disabled={rsvpLoading[ativo.id]}
                        className={`flex items-center gap-2 px-7 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                          rsvp[ativo.id] === 'nao_vou' ? 'border-rose-400 bg-rose-50 text-rose-400' : 'border-current opacity-30 hover:opacity-60 text-black'
                        }`}
                      >
                        <XCircle size={14} /> Não vou
                      </button>
                    </div>
                    {rsvp[ativo.id] && (
                      <p className="text-[9px] italic opacity-30">
                        {rsvp[ativo.id] === 'vou' ? 'Sua presença está confirmada ✓' : 'Você sinalizou que não irá'}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-[9px] italic opacity-30 uppercase tracking-widest">
                    Faça login para confirmar presença
                  </p>
                )}
                <div className="flex items-center gap-3 text-[9px] text-black/30 font-bold uppercase tracking-widest pt-2">
                  <Users size={11} />
                  {ativo.totalVou} confirmada{ativo.totalVou !== 1 ? 's' : ''}
                  {ativo.totalNaoVou > 0 && (
                    <span>· {ativo.totalNaoVou} não {ativo.totalNaoVou === 1 ? 'vai' : 'vão'}</span>
                  )}
                </div>
              </div>
            </article>

            {/* Sidebar direita — logística */}
            <aside className="lg:col-span-3 space-y-8">
              <section className="bg-white p-8 border border-black/5 shadow-sm rounded-2xl">
                <h4 className="text-[9px] font-bold uppercase tracking-widest mb-6 opacity-30 text-black">
                  Detalhes do Evento
                </h4>
                <div className="space-y-6 text-sm italic opacity-60 text-black">
                  {ativo.local && (
                    <div className="flex items-start gap-4">
                      <MapPin size={16} style={{ color: ocreDestaque }} className="opacity-70 mt-0.5 shrink-0" />
                      <span>{ativo.local}</span>
                    </div>
                  )}
                  {ativo.horario && (
                    <div className="flex items-center gap-4">
                      <Clock size={16} style={{ color: ocreDestaque }} className="opacity-70 shrink-0" />
                      <span>{ativo.horario}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <DollarSign size={16} style={{ color: ocreDestaque }} className="opacity-70 shrink-0" />
                    <span>{ativo.valor || 'Entrada gratuita'}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Calendar size={16} style={{ color: ocreDestaque }} className="opacity-70 shrink-0" />
                    <span>{ativo.dataFormatada}</span>
                  </div>
                </div>
              </section>

              {(ativo.linkInscricao || ativo.telefone) && (
                <section className="space-y-3">
                  {ativo.linkInscricao && (
                    <a
                      href={ativo.linkInscricao}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-white text-[10px] font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
                      style={{ backgroundColor: ocreDestaque }}
                    >
                      <ExternalLink size={13} /> Fazer Inscrição
                    </a>
                  )}
                  {ativo.telefone && (
                    <a
                      href={`https://wa.me/55${ativo.telefone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-opacity hover:opacity-70"
                      style={{ borderColor: ocreDestaque, color: ocreDestaque }}
                    >
                      <Phone size={13} /> WhatsApp
                    </a>
                  )}
                </section>
              )}
            </aside>

          </div>
        </main>
      </div>
    );
  }

  /* ─── VISTA LISTA — layout original de cards ─── */
  return (
    <div className="min-h-screen font-alice pb-40 relative overflow-hidden" style={{ background: `#FDFCFB url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')` }}>

      <header className="max-w-5xl mx-auto pt-32 pb-24 px-6 relative z-10 text-center">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px w-10" style={{ backgroundColor: 'var(--page-color-40)' }} />
          <span style={{ color: 'var(--page-color)' }} className="text-[10px] font-bold uppercase tracking-[0.6em]">
            Pausas Necessárias & Encontros
          </span>
          <div className="h-px w-10" style={{ backgroundColor: 'var(--page-color-40)' }} />
        </div>

        <h1 className="text-7xl md:text-[100px] text-[#2C3E50] tracking-tighter italic font-light mb-10 leading-[0.8]">
          Afeto & <span style={{ color: ocreDestaque }} className="not-italic">Experiências</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-3xl mx-auto border-t pt-10"
             style={{ borderColor: 'var(--page-color-30)' }}>
          <p style={{ color: 'var(--page-color)' }} className="italic text-base leading-relaxed">
            &ldquo;Momentos desenhados para pausar o mundo, silenciar o ruído externo e mergulhar profundamente em novas histórias.&rdquo;
          </p>
          <div className="flex flex-col justify-end items-start md:items-end">
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-sans font-bold opacity-80"
                 style={{ color: ocreDestaque }}>
              <Star size={14} /> Curadoria de Momentos • 2026
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 space-y-32">

        <section className="space-y-24">
          {loading ? (
            <p className="text-center italic opacity-40 animate-pulse">Buscando encontros...</p>
          ) : eventos.length === 0 ? (
            <p className="text-center italic opacity-30">Nenhum evento agendado por enquanto.</p>
          ) : eventos.map((evento) => (
            <div key={evento.id}
                 className="group grid grid-cols-1 md:grid-cols-12 gap-12 items-start border-b border-black/5 pb-20">

              <div className="md:col-span-8 space-y-6">
                <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.3em]"
                     style={{ color: ocreDestaque }}>
                  <span>{evento.dataFormatada}</span>
                  {evento.horario && (
                    <>
                      <span className="opacity-20 text-black">|</span>
                      <div className="flex items-center gap-1.5 opacity-60">
                        <Clock size={12} />
                        <span>{evento.horario}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-4">
                  <h3
                    className="text-4xl md:text-5xl text-[#2C3E50] tracking-tight group-hover:italic transition-all duration-500 cursor-pointer hover:underline underline-offset-4"
                    onClick={() => abrirDetalhe(evento)}
                  >
                    {evento.titulo}
                  </h3>
                  <p className="text-lg italic opacity-50 text-black leading-relaxed line-clamp-2 max-w-2xl">
                    {evento.descricao}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-5 text-[9px] uppercase font-bold tracking-widest opacity-40 text-black">
                  {evento.local && (
                    <span className="flex items-center gap-1.5"><MapPin size={11} /> {evento.local}</span>
                  )}
                  {evento.valor && (
                    <span className="flex items-center gap-1.5"><DollarSign size={11} /> {evento.valor}</span>
                  )}
                  {evento.telefone && (
                    <a
                      href={`https://wa.me/55${evento.telefone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 opacity-100 hover:opacity-70 transition-opacity"
                      style={{ color: ocreDestaque }}
                    >
                      <Phone size={11} /> {evento.telefone}
                    </a>
                  )}
                  {evento.linkInscricao && (
                    <a
                      href={evento.linkInscricao}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 opacity-100 hover:opacity-70 transition-opacity"
                      style={{ color: ocreDestaque }}
                    >
                      <ExternalLink size={11} /> Inscrições
                    </a>
                  )}
                </div>

                <div className="pt-2 space-y-3">
                  <div className="flex items-center gap-4 text-[10px] text-black/30 font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1.5">
                      <Users size={11} />
                      {evento.totalVou} {evento.totalVou === 1 ? 'confirmada' : 'confirmadas'}
                    </span>
                    {evento.totalNaoVou > 0 && (
                      <span>{evento.totalNaoVou} não {evento.totalNaoVou === 1 ? 'vai' : 'vão'}</span>
                    )}
                  </div>

                  {userEmail ? (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleRsvp(evento.id, 'vou')}
                        disabled={rsvpLoading[evento.id]}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                          rsvp[evento.id] === 'vou'
                            ? 'border-transparent text-white'
                            : 'border-current opacity-40 hover:opacity-80 text-black'
                        }`}
                        style={rsvp[evento.id] === 'vou' ? { backgroundColor: ocreDestaque, borderColor: ocreDestaque } : {}}
                      >
                        <CheckCircle2 size={13} /> Vou!
                      </button>
                      <button
                        onClick={() => handleRsvp(evento.id, 'nao_vou')}
                        disabled={rsvpLoading[evento.id]}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                          rsvp[evento.id] === 'nao_vou'
                            ? 'border-rose-400 bg-rose-50 text-rose-400'
                            : 'border-current opacity-30 hover:opacity-60 text-black'
                        }`}
                      >
                        <XCircle size={13} /> Não vou
                      </button>
                      {rsvp[evento.id] && (
                        <span className="text-[9px] italic opacity-30">
                          {rsvp[evento.id] === 'vou' ? 'Sua presença está confirmada ✓' : 'Você sinalizou que não irá'}
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-[9px] italic opacity-30 uppercase tracking-widest">
                      Faça login para confirmar presença
                    </p>
                  )}
                </div>

                <button
                  onClick={() => abrirDetalhe(evento)}
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.25em] transition-opacity hover:opacity-60"
                  style={{ color: ocreDestaque }}
                >
                  Ver detalhes →
                </button>
              </div>

              <div className="md:col-span-4 flex justify-end">
                <div
                  className="p-3 bg-white shadow-xl -rotate-2 group-hover:rotate-0 transition-all duration-700 border border-black/5 w-full max-w-xs cursor-pointer"
                  onClick={() => abrirDetalhe(evento)}
                >
                  <div className="overflow-hidden transition-all duration-1000">
                    <Image
                      src={evento.imagemPadrao || fotosClubeDoLivro[0]}
                      alt={evento.titulo}
                      width={0}
                      height={0}
                      sizes="100vw"
                      style={{ width: '100%', height: 'auto' }}
                      className="scale-110 group-hover:scale-100 transition-transform duration-1000"
                    />
                  </div>
                  <div className="mt-3 py-2 border-t border-black/5">
                    <span className="text-[8px] font-bold uppercase tracking-[0.3em] opacity-30 block text-center italic">
                      Encontro {new Date().getFullYear()}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </section>

        <section className="bg-white/50 border border-black/5 p-12 md:p-20 space-y-16 rounded-3xl text-center">
          <div className="space-y-4">
            <Camera className="w-5 h-5 mx-auto opacity-20" style={{ color: ocreDestaque }} />
            <h2 className="text-5xl text-[#2C3E50] tracking-tight">
              Nossas <span className="italic font-light" style={{ color: ocreDestaque }}>Memórias</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {fotosGaleria.map((url, i) => (
              <div key={i} className="bg-white p-2 pb-8 shadow-sm rotate-1 hover:rotate-0 transition-all border border-black/5">
                <div className="aspect-square overflow-hidden relative transition-all duration-700">
                  <Image src={url} alt="Memória" fill className="object-cover" />
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
