'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Play, Pause, RotateCcw, ChevronRight, Quote, ArrowDown, Timer, Scale } from 'lucide-react';

interface Participante {
  id: string;
  nome: string;
  ordem: number;
  falou: boolean;
  tempoUtilizado: number;
  minutosAdicionaisUsados: number;
}

interface ActiveBook {
  livro: string | null;
  autora: string | null;
  foto: string | null;
  mes: string | null;
  ano: number | null;
}

export default function RodaDeVozes({ activeBook }: { activeBook: ActiveBook | null }) {
  const palette = {
    bg: '#FDFCFB',
    surface: '#FAF6F2',
    text: '#2C3E50',
    textSoft: 'rgba(0,0,0,0.6)',
    border: 'rgba(0,0,0,0.05)',
    accent: '#8C7A66',
  };

  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const participantesRef = useRef<Participante[]>([]);
  const [rodaStatus, setRodaStatus] = useState<'ativa' | 'pausada' | 'encerrada'>('ativa');
  const [novoNome, setNovoNome] = useState('');
  const [falando, setFalando] = useState<number | null>(null);
  const [falandoAvulso, setFalandoAvulso] = useState<string | null>(null);
  const [nomeMaoLevantada, setNomeMaoLevantada] = useState('');
  const [filaMaoLevantada, setFilaMaoLevantada] = useState<string[]>([]);
  const [tempo, setTempo] = useState(120); // 2 minutos
  const [rodando, setRodando] = useState(false);
  const [minutosAdicionais, setMinutosAdicionais] = useState(0);
  const falandoRef = useRef<number | null>(null);
  const falandoAvulsoRef = useRef<string | null>(null);
  const filaMaoLevantadaRef = useRef<string[]>([]);
  const minutosAdicionaisRef = useRef(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const setParticipantesState = (next: Participante[] | ((prev: Participante[]) => Participante[])) => {
    setParticipantes((prev) => {
      const updated = typeof next === 'function' ? next(prev) : next;
      participantesRef.current = updated;
      return updated;
    });
  };

  const setFilaMaoLevantadaState = (next: string[] | ((prev: string[]) => string[])) => {
    setFilaMaoLevantada((prev) => {
      const updated = typeof next === 'function' ? next(prev) : next;
      filaMaoLevantadaRef.current = updated;
      return updated;
    });
  };

  const reorderParticipants = (list: Participante[]) => {
    const notSpoken = list.filter((participant) => !participant.falou);
    const spoken = list.filter((participant) => participant.falou);
    return [...notSpoken, ...spoken];
  };

  const marcarComoFalou = (index: number, usedTime: number) => {
    setParticipantesState((prev) => {
      const updated = prev.map((participant, idx) =>
        idx === index
          ? {
              ...participant,
              falou: true,
              tempoUtilizado: participant.tempoUtilizado + usedTime,
            }
          : participant,
      );
      return reorderParticipants(updated);
    });
  };

  // Carregar participantes ao montar
  useEffect(() => {
    carregarParticipantes();
  }, []);

  const carregarParticipantes = async () => {
    try {
      setCarregando(true);
      const res = await fetch('/api/roda-vozes', { cache: 'no-store' });
      if (!res.ok) {
        const errorText = await res.text();
        let message = errorText;
        try {
          const parsed = JSON.parse(errorText);
          message = parsed?.error || parsed?.message || errorText;
        } catch {
          message = errorText;
        }
        console.error('roda-vozes fetch failed', res.status, message);
        throw new Error(message || `Erro HTTP ${res.status}`);
      }
      const data = await res.json();
      if (!data || data.success === false) {
        const message = data?.error || 'Erro ao buscar participantes';
        console.error('roda-vozes returned failure payload', message, data);
        throw new Error(message);
      }
      setParticipantesState(reorderParticipants(data.participantes || []));
      setRodaStatus(data.roda?.status || 'ativa');
      setErro('');
    } catch (err: any) {
      console.error('Erro:', err);
      setErro(err.message?.includes('Erro') ? err.message : 'Erro ao carregar participantes');
    } finally {
      setCarregando(false);
    }
  };

  // Cronômetro
  useEffect(() => {
    if (!rodando) return;

    const intervalo = setInterval(() => {
      setTempo((prev) => {
        if (prev <= 0) {
          setRodando(false);
          const usedTime = 120 + minutosAdicionaisRef.current * 60;
          const currentIndex = falandoRef.current;
          const currentAvulso = falandoAvulsoRef.current;
          if (currentIndex !== null) {
            marcarComoFalou(currentIndex, usedTime);
          }

          if (currentAvulso) {
            setFalandoAvulso(null);
            falandoAvulsoRef.current = null;
          }

          setFalando(null);
          falandoRef.current = null;
          setTempo(120);
          setMinutosAdicionais(0);
          minutosAdicionaisRef.current = 0;

          const nextQueue = filaMaoLevantadaRef.current[0];
          if (nextQueue) {
            setFilaMaoLevantadaState((prevList) => prevList.slice(1));
            iniciarFalaAvulsa(nextQueue);
          } else {
            const nextIndex = participantesRef.current.findIndex(
              (participant, idx) => idx !== currentIndex && !participant.falou,
            );
            if (nextIndex >= 0) {
              iniciarFala(nextIndex);
            }
          }

          // Emitir aviso sonoro leve
          if (typeof window !== 'undefined') {
            try {
              const audio = new AudioContext();
              const oscillator = audio.createOscillator();
              const gain = audio.createGain();
              oscillator.connect(gain);
              gain.connect(audio.destination);
              oscillator.frequency.value = 800;
              gain.gain.setValueAtTime(0.3, audio.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.5);
              oscillator.start(audio.currentTime);
              oscillator.stop(audio.currentTime + 0.5);
            } catch (e) {
              // Ignorar erros de áudio
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalo);
  }, [rodando]);

  const adicionarParticipante = async () => {
    if (novoNome.trim() === '') return;

    if (rodaStatus !== 'ativa') {
      setErro('A Roda de Vozes está desativada e não aceita novos participantes.');
      return;
    }

    try {
      const res = await fetch('/api/roda-vozes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: novoNome.trim() }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        let message = errorText;
        try {
          const parsed = JSON.parse(errorText);
          message = parsed?.error || parsed?.message || errorText;
        } catch {
          message = errorText;
        }
        throw new Error(message || 'Erro ao adicionar');
      }

      const data = await res.json();
      setParticipantesState(reorderParticipants([...participantesRef.current, data.participante]));
      setNovoNome('');
      setErro('');
    } catch (err: any) {
      console.error('Erro:', err);
      setErro(err.message?.includes('Erro') ? err.message : 'Erro ao adicionar participante');
    }
  };

  const iniciarFala = (index: number) => {
    setFalandoAvulso(null);
    falandoAvulsoRef.current = null;
    setFalando(index);
    falandoRef.current = index;
    setTempo(120);
    setMinutosAdicionais(0);
    minutosAdicionaisRef.current = 0;
    setRodando(false);
  };

  const iniciarFalaAvulsa = (nome: string) => {
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) return;

    setFalando(null);
    falandoRef.current = null;
    setFalandoAvulso(nomeLimpo);
    falandoAvulsoRef.current = nomeLimpo;
    setTempo(120);
    setMinutosAdicionais(0);
    minutosAdicionaisRef.current = 0;
    setRodando(false);
  };

  const adicionarMaoLevantada = () => {
    const nomeLimpo = nomeMaoLevantada.trim();
    if (!nomeLimpo) return;
    setFilaMaoLevantadaState((prev) => [...prev, nomeLimpo]);
    setNomeMaoLevantada('');
  };

  const chamarProximaMaoLevantada = () => {
    const proxima = filaMaoLevantadaRef.current[0];
    if (!proxima) return;
    setFilaMaoLevantadaState((prev) => prev.slice(1));
    iniciarFalaAvulsa(proxima);
  };

  const proximaParticipante = () => {
    if (falandoAvulso) {
      setFalandoAvulso(null);
      falandoAvulsoRef.current = null;
      setTempo(120);
      setMinutosAdicionais(0);
      minutosAdicionaisRef.current = 0;

      const nextQueue = filaMaoLevantadaRef.current[0];
      if (nextQueue) {
        chamarProximaMaoLevantada();
        return;
      }

      const nextParticipant = participantesRef.current.findIndex((participant) => !participant.falou);
      if (nextParticipant >= 0) {
        iniciarFala(nextParticipant);
      }
      return;
    }

    if (falando === null) {
      const nextQueue = filaMaoLevantadaRef.current[0];
      if (nextQueue) {
        chamarProximaMaoLevantada();
        return;
      }

      const nextIndex = participantes.findIndex((participant) => !participant.falou);
      if (nextIndex >= 0) {
        iniciarFala(nextIndex);
      }
      return;
    }

    const usedTime = 120 + minutosAdicionais * 60 - tempo;
    marcarComoFalou(falando, usedTime > 0 ? usedTime : 0);

    const nextIndex = participantes.findIndex(
      (participant, idx) => idx > falando && !participant.falou,
    );
    if (nextIndex >= 0) {
      iniciarFala(nextIndex);
    } else {
      setFalando(null);
      setTempo(120);
      setMinutosAdicionais(0);
    }
  };

  const formatarTempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${mins}:${segs.toString().padStart(2, '0')}`;
  };

  const corTempo = tempo <= 30 && tempo > 0 ? '#dc2626' : tempo === 0 ? '#dc2626' : palette.accent;
  const tamanhoTexto = tempo === 0 ? 'text-5xl' : 'text-6xl';

  return (
    <div
      className="min-h-screen font-alice pb-32 relative overflow-hidden"
      style={{
        background: `${palette.bg} url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')`,
      }}
    >
      {/* Cabeçalho */}
      <header className="max-w-5xl mx-auto pt-32 pb-24 px-6 text-center relative z-10 border-b border-black/5">
        <div className="flex items-center justify-center gap-4 mb-8 opacity-40">
          <div className="h-px w-10 bg-black" />
          <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-black italic">Presença • Conexão • Vivência </span>
          <div className="h-px w-10 bg-black" />
        </div>
        
        <h1 className="text-7xl md:text-[100px] text-[#2C3E50] tracking-tighter leading-[0.8] mb-10 drop-shadow-sm">
          Roda de <span style={{ color: palette.accent }} className="italic font-light">Vozes</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-3xl mx-auto border-t border-black/10 pt-10">
          <p className="text-base leading-relaxed opacity-60 text-black italic">
            "Um espaço de escuta e respeito. Cada participante pode se inscrever, seguindo a ordem da lista e compartilhando sua voz no tempo certo."
          </p>
          <div className="flex flex-col justify-end items-start md:items-end">
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-sans font-bold" style={{ color: palette.accent }}>
              Presença • Acolhimento • Troca
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 space-y-28 relative z-10 mt-24">
        {/* Livro Atual */}
        {activeBook && (
          <section className="relative flex flex-col md:flex-row items-center gap-12 bg-white/40 border border-black/5 p-8 md:p-12 rounded-[2rem] shadow-sm">
            <div className="relative w-48 mx-auto md:mx-0 shrink-0">
               <div className="absolute inset-0 bg-[#FAFAF5] border border-black/10 rotate-[-4deg] scale-105" />
               <div className="relative aspect-[2/3] bg-white border border-black/5 shadow-[0_5px_15px_rgba(0,0,0,0.08)] p-2">
                 {activeBook.foto ? (
                   <img src={activeBook.foto} alt={activeBook.livro || 'Capa do Livro'} className="w-full h-full object-cover grayscale-[20%] sepia-[15%]" />
                 ) : (
                   <div className="w-full h-full border border-dashed border-black/10 flex items-center justify-center p-4 text-center">
                     <span className="text-xs uppercase tracking-widest opacity-30">Sem capa</span>
                   </div>
                 )}
               </div>
            </div>
            
            <div className="flex-1 text-center md:text-left space-y-6">
              <div className="space-y-2">
                <span className="inline-block text-[10px] font-bold uppercase tracking-[0.4em] px-3 py-1 bg-white/60 border border-black/5 rounded-full" style={{ color: palette.accent }}>
                  {activeBook.mes} {activeBook.ano}
                </span>
                <h2 className="text-4xl md:text-5xl text-[#2C3E50] tracking-tighter italic font-serif leading-none pt-2">
                  {activeBook.livro}
                </h2>
                {activeBook.autora && (
                  <p className="text-sm uppercase tracking-[0.2em] opacity-50 font-semibold pt-1">
                    por {activeBook.autora}
                  </p>
                )}
              </div>
              <p className="text-[13px] leading-relaxed opacity-70 italic max-w-2xl border-l-2 pl-4 border-black/10">
                Esta é a obra que norteia as partilhas da nossa roda ativa. Traga suas impressões, sentimentos e reflexões.
              </p>
            </div>
          </section>
        )}

        {/* Como funciona */}
        <section className="space-y-8 relative">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40" style={{ color: palette.accent }}>
              Guia Rápido
            </span>
          </div>
          <h2 className="text-4xl text-[#2C3E50] italic font-light tracking-tight mb-2 drop-shadow-sm">
            Como funciona
          </h2>

          <div className="grid md:grid-cols-3 gap-6 pt-6">
            {[
              {
                titulo: 'Coloque seu nome na lista',
                descricao: 'A ordem de inscrição será a ordem de fala',
                icon: ArrowDown,
              },
              {
                titulo: 'Tempo de fala',
                descricao: 'Cada participante tem até 2 minutos. Pode solicitar +1 minuto adicional',
                icon: Timer,
              },
              {
                titulo: 'Regras',
                descricao: 'Respeitar o tempo de cada uma. Escutar sem interromper. Espaço seguro e sem julgamentos',
                icon: Scale,
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-8 rounded-[2rem] border border-black/5 flex flex-col justify-between shadow-lg transition hover:-translate-y-1"
                  style={{
                    backgroundColor: palette.surface,
                  }}
                >
                  <div>
                    <div
                      className="w-16 h-16 mb-6 rounded-full grid place-items-center"
                      style={{ backgroundColor: 'rgba(140, 122, 102, 0.12)' }}
                    >
                      <Icon size={24} className="text-[#8C7A66]" />
                    </div>
                    <div className="text-[1.7rem] font-light italic mb-4 opacity-30" style={{ color: palette.accent }}>
                      0{idx + 1}
                    </div>
                    <h3 className="text-2xl text-[#2C3E50] mb-3 font-semibold tracking-tight">
                      {item.titulo}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: palette.textSoft }}>
                      {item.descricao}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Mensagens de erro */}
        {erro && (
          <div
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: '#FFF5F5',
              borderColor: '#dc2626',
              color: '#dc2626',
            }}
          >
            {erro}
          </div>
        )}

        {/* Formulário de inscrição */}
        <section className="space-y-8 relative">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40" style={{ color: palette.accent }}>
              Entrada na roda
            </span>
          </div>
          <h2 className="text-4xl text-[#2C3E50] italic font-light tracking-tight mb-2 drop-shadow-sm">
            Inscrição
          </h2>

          <div className="flex gap-4 flex-col sm:flex-row max-w-3xl pt-6">
            <input
              type="text"
              placeholder={rodaStatus !== 'ativa' ? 'Roda de Vozes desativada' : 'digite seu nome...'}
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && adicionarParticipante()}
              disabled={carregando || rodaStatus !== 'ativa'}
              className="flex-1 px-8 py-5 rounded-[2rem] border border-black/5 focus:outline-none focus:ring-4 focus:ring-black/5 text-lg"
              style={{
                backgroundColor: palette.surface,
                color: palette.text,
              }}
            />
            <button
              onClick={adicionarParticipante}
              disabled={carregando || rodaStatus !== 'ativa'}
              className="px-10 py-5 rounded-[2rem] font-medium flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: palette.accent, color: palette.bg }}
            >
              <Plus size={22} />
              <span className="tracking-wide">entrar na roda</span>
            </button>
          </div>
          {rodaStatus !== 'ativa' && (
            <div className="text-sm text-rose-600 italic mt-2">
              Roda de Vozes está atualmente desativada. Inscrições fechadas.
            </div>
          )}
        </section>

        <div className="grid md:grid-cols-2 gap-16 lg:gap-24 pt-12">
          {/* Lista de participantes */}
          <section className="space-y-8 relative">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40" style={{ color: palette.accent }}>
                Ordem de fala
              </span>
            </div>
            <h2 className="text-4xl text-[#2C3E50] italic font-light tracking-tight mb-2 drop-shadow-sm">
              Participantes
            </h2>

            {carregando ? (
              <p className="opacity-60 pt-4" style={{ color: palette.textSoft }}>Carregando...</p>
            ) : participantes.length === 0 ? (
              <p className="opacity-60 pt-4" style={{ color: palette.textSoft }}>Ninguém ainda na lista...</p>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 pt-6 scrollbar-hide">
                {participantes.map((participante, idx) => (
                  <div
                    key={participante.id}
                    className={`px-6 py-5 rounded-[1.5rem] border border-black/5 transition-all duration-300 ease-out shadow-sm flex items-center justify-between ${participante.falou ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02]'} ${falando === idx ? 'scale-[1.03] ring-2 ring-amber-300 shadow-lg' : ''}`}
                    style={{
                      backgroundColor: falando === idx ? palette.accent : palette.surface,
                      color: falando === idx ? palette.bg : palette.text,
                    }}
                    onClick={() => {
                      if (!participante.falou) iniciarFala(idx);
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-light italic opacity-60">0{participante.ordem}.</span> 
                      <div>
                        <span className="text-lg tracking-wide">{participante.nome}</span>
                        {participante.falou ? (
                          <span className="inline-flex items-center rounded-full bg-[#F5E2D7] px-3 py-1 text-[10px] uppercase tracking-[0.3em] font-semibold text-[#8C5A42] mt-1">
                            já falou
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {participantes.length > 0 && (
              <button
                onClick={proximaParticipante}
                disabled={carregando || participantes.every((participant) => participant.falou)}
                className="w-full mt-8 px-6 py-5 rounded-[1.5rem] font-medium flex items-center justify-center gap-3 hover:scale-[1.02] transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed border border-black/5"
                style={{ backgroundColor: '#FAF6F2', color: palette.text }}
              >
                <ChevronRight size={22} />
                <span className="tracking-widest uppercase text-xs font-bold">próxima pessoa</span>
              </button>
            )}
          </section>

          {/* Cronômetro */}
          <section className="space-y-8 relative">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40" style={{ color: palette.accent }}>
                Tempo de partilha
              </span>
            </div>
            <h2 className="text-4xl text-[#2C3E50] italic font-light tracking-tight mb-2 drop-shadow-sm">
              Cronômetro
            </h2>

            {((falando !== null && participantes[falando]) || falandoAvulso) && (
              <div className="text-center space-y-4 pb-8 pt-6 border-b border-black/10">
                <p className="text-sm font-sans tracking-[0.3em] uppercase font-bold opacity-40">
                  falando agora
                </p>
                <p className="text-4xl text-[#2C3E50] tracking-tight">
                  {falandoAvulso || participantes[falando!]?.nome}
                </p>
                <p className="text-[10px] uppercase tracking-[0.3em] opacity-40">
                  {falandoAvulso ? 'mão levantada na hora' : 'lista de inscrição'}
                </p>
              </div>
            )}

            <div className="pt-2 space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] opacity-40" style={{ color: palette.accent }}>
                Fila de mãos levantadas
              </p>

              <div className="flex gap-3 flex-col sm:flex-row">
                <input
                  type="text"
                  placeholder="nome de quem levantou a mão"
                  value={nomeMaoLevantada}
                  onChange={(e) => setNomeMaoLevantada(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && adicionarMaoLevantada()}
                  className="flex-1 px-5 py-3 rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/10"
                  style={{ backgroundColor: '#fff', color: palette.text }}
                />
                <button
                  onClick={adicionarMaoLevantada}
                  className="px-5 py-3 rounded-2xl text-xs uppercase tracking-[0.2em] font-bold border border-black/10 bg-white hover:bg-black/5 transition"
                >
                  adicionar
                </button>
                <button
                  onClick={chamarProximaMaoLevantada}
                  disabled={filaMaoLevantada.length === 0}
                  className="px-5 py-3 rounded-2xl text-xs uppercase tracking-[0.2em] font-bold border border-black/10 bg-white hover:bg-black/5 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  chamar próxima
                </button>
              </div>

              {filaMaoLevantada.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {filaMaoLevantada.map((nome, idx) => (
                    <span
                      key={`${nome}-${idx}`}
                      className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[10px] uppercase tracking-[0.2em] border border-black/10"
                      style={{ color: palette.textSoft }}
                    >
                      {idx + 1}. {nome}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs opacity-50">Nenhuma mão levantada na fila.</p>
              )}
            </div>

            <div
              className={`p-10 lg:p-16 rounded-[3rem] border text-center ${tamanhoTexto} font-mono font-bold transition-all shadow-inner relative overflow-hidden ${tempo === 0 ? 'animate-pulse ring-4 ring-red-200 border-red-300' : 'border-black/5'}`}
              style={{
                backgroundColor: tempo === 0 ? '#FEE2E2' : '#F5F0EA',
                color: corTempo,
              }}
            >
              <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 rounded-t-full blur-sm" />
              <div className="relative z-10 drop-shadow-sm">
                {formatarTempo(tempo)}
              </div>
            </div>

            {tempo === 0 && (
              <p className="text-center font-sans text-sm tracking-[0.3em] font-bold uppercase text-red-500 animate-pulse pt-2">
                tempo encerrado
              </p>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4">
              <button
                onClick={() => setRodando(!rodando)}
                className="px-8 py-5 rounded-[2rem] font-medium flex items-center justify-center gap-3 hover:scale-[1.03] transition-all shadow-lg"
                style={{ backgroundColor: rodando ? '#6F6152' : palette.accent, color: palette.bg }}
              >
                {rodando ? (
                  <>
                    <Pause size={20} fill="currentColor" />
                    <span className="tracking-widest uppercase text-xs font-bold">pausar</span>
                  </>
                ) : (
                  <>
                    <Play size={20} fill="currentColor" className="ml-1" />
                    <span className="tracking-widest uppercase text-xs font-bold">iniciar</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setTempo(120);
                  setRodando(false);
                }}
                className="px-8 py-5 rounded-[2rem] border border-black/10 font-medium flex items-center justify-center gap-3 hover:scale-[1.03] transition-all bg-white shadow-sm text-black/60 hover:text-black"
              >
                <RotateCcw size={18} />
                <span className="tracking-widest uppercase text-xs font-bold">reiniciar</span>
              </button>
            </div>

            <button
              onClick={() => {
                setTempo((prev) => prev + 60);
                setMinutosAdicionais((prev) => {
                  const next = prev + 1;
                  minutosAdicionaisRef.current = next;
                  return next;
                });
              }}
              disabled={minutosAdicionais >= 1}
              className="w-full mt-4 px-6 py-5 rounded-[2rem] font-medium hover:scale-[1.02] transition-all disabled:opacity-40 disabled:cursor-not-allowed border border-black/10 bg-white shadow-sm flex items-center justify-center gap-3"
            >
              <span className="opacity-40"><Plus size={18} /></span>
              <span className="tracking-widest uppercase text-[10px] font-bold text-black/60">
                1 minuto adicional {minutosAdicionais > 0 && `(já utilizado)`}
              </span>
            </button>
          </section>
        </div>

        {/* Regras visuais fixas */}
        <section
          className="p-12 lg:p-16 rounded-[3rem] border border-black/5 text-center shadow-sm relative mt-24 mb-12"
          style={{
            backgroundColor: palette.surface,
          }}
        >
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-[#8C7A66] rounded-full flex items-center justify-center text-white shadow-lg border-4 border-[#FDFCFB]">
            <Quote size={20} fill="currentColor" />
          </div>
          <p className="text-xl md:text-2xl leading-relaxed italic opacity-70 tracking-tight" style={{ color: palette.textSoft }}>
            "Esse é um espaço de escuta e acolhimento. Enquanto uma fala, as outras escutam com respeito e atenção. Cada voz aqui importa."
          </p>
        </section>
      </main>
    </div>
  );
}
