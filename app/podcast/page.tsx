"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, FastForward, Rewind, Mic2, Radio, Disc, Volume2, Heart, Power, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

const papelEditorial = "#FDFCFB"; 
const marromPapel = "#8C7A66";   
const rosaRetro = "#C08081";     
const azulPetroleo = "#2C3E50";  

interface Episodio {
  id: string;
  titulo: string;
  convidada: string | null;
  data: string | null;
  resumo: string | null;
  audioUrl: string | null;
  spotifyUrl: string | null;
  youtubeUrl: string | null;
  imageUrl: string | null;
}

function fmtTime(s: number) {
  if (!isFinite(s) || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function PodcastFinalRestaurado() {
  const [episodios, setEpisodios] = useState<Episodio[]>([]);
  const [ativoIdx, setAtivoIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const ativo = episodios[ativoIdx] || null;

  useEffect(() => {
    async function carregarPodcast() {
      try {
        const res = await fetch('/api/podcast');
        const data = await res.json();
        setEpisodios(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erro na sintonia:", err);
      } finally {
        setLoading(false);
      }
    }
    carregarPodcast();
  }, []);

  
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  
  useEffect(() => {
    if (!audioRef.current || !ativo) return;
    const audio = audioRef.current;
    const shouldPlay = isPlaying;

    audio.pause();
    setCurrentTime(0);
    setDuration(0);

    if (!ativo.audioUrl) {
      audio.removeAttribute('src');
      setIsPlaying(false);
      return;
    }

    audio.src = ativo.audioUrl;
    audio.load();

    if (!shouldPlay) return;

    const onCanPlay = () => {
      audio.play().catch(err => {
        if (err?.name !== 'AbortError') setIsPlaying(false);
      });
    };
    audio.addEventListener('canplay', onCanPlay, { once: true });
    return () => audio.removeEventListener('canplay', onCanPlay);
  
  }, [ativoIdx, ativo?.id]);

  
  const proximo = () => setAtivoIdx(prev => prev < episodios.length - 1 ? prev + 1 : 0);
  const anterior = () => setAtivoIdx(prev => prev > 0 ? prev - 1 : episodios.length - 1);

  const togglePlay = async () => {
    if (!audioRef.current || !ativo?.audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (e: any) {
        console.error('Playback failed:', e);
        setIsPlaying(false);
        if (e?.name === 'NotSupportedError') {
          import('sonner').then(({ toast }) =>
            toast.error('Formato de áudio não suportado neste navegador. Use o link do Spotify ou YouTube.')
          );
        } else if (e?.name !== 'AbortError') {
          import('sonner').then(({ toast }) =>
            toast.error('Não foi possível reproduzir o áudio.')
          );
        }
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = Number(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = t;
    setCurrentTime(t);
  };

  return (
    <div className="min-h-screen font-alice pb-32 relative overflow-hidden" 
         style={{ background: `${papelEditorial} url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')` }}>
      
      
      <header className="max-w-5xl mx-auto pt-32 pb-24 px-6 text-center relative z-10 border-b border-black/5">
        <div className="flex items-center justify-center gap-4 mb-8 opacity-40">
          <div className="h-px w-10 bg-black" />
          <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-black italic">Estação Literária</span>
          <div className="h-px w-10 bg-black" />
        </div>
        
        <h1 className="text-7xl md:text-[100px] text-[#2C3E50] tracking-tighter leading-[0.8] mb-10 drop-shadow-sm">
          Clube <span style={{ color: rosaRetro }} className="italic font-light">FM</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-3xl mx-auto border-t border-black/10 pt-10">
          <p className="text-base leading-relaxed opacity-60 text-black italic">
            "Sintonize sua frequência na literatura. Onde as vozes das autoras ecoam em nossos fones e corações."
          </p>
          <div className="flex flex-col justify-end items-start md:items-end">
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-sans font-bold" style={{ color: rosaRetro }}>
              <Radio size={14} /> No Ar • Ciclo 2026
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 space-y-28 relative z-10 mt-24">
        
        
        <section className="relative group">
          <div className="p-5 rounded-[5rem] shadow-[0_60px_120px_-20px_rgba(140,122,102,0.5)] transition-all duration-700" 
               style={{ background: `radial-gradient(circle at center, ${marromPapel} 0%, #6F6152 100%)` }}>
            
            <div className="rounded-[4.2rem] p-10 md:p-16 flex flex-col lg:flex-row gap-16 items-center border-[6px] border-black/10" 
                 style={{ background: '#FAF6F2', boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.05)' }}>
              
               <div className="relative">
                 <div className="w-60 h-60 rounded-full flex items-center justify-center relative overflow-hidden bg-[#1A1A1A] border-12 border-white shadow-2xl">
                   <Disc className={`w-40 h-40 opacity-5 text-white ${isPlaying ? 'animate-[spin_15s_linear_infinite]' : ''}`} />
                   <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-inner border border-black/5">
                       <Radio className={`w-7 h-7 ${isPlaying ? 'animate-bounce' : ''}`} style={{ color: rosaRetro }} />
                     </div>
                   </div>
                 </div>
                 <div className={`absolute top-0 -right-2 w-3 h-28 origin-top transition-transform duration-500 rounded-full bg-[#D1C7BD] shadow-md border border-black/10 ${isPlaying ? 'rotate-35' : 'rotate-15'}`} />
              </div>

              <div className="flex-1 space-y-12 w-full">
                <div className="p-8 rounded-[3rem] shadow-inner relative overflow-hidden border border-black/10" style={{ background: '#E5D8C9' }}>
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 rounded-t-full blur-sm" />
                  <div className="flex justify-between items-start mb-6 relative z-10">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest opacity-40 text-[#8C7A66]">
                        {ativo ? (ativo.data || 'Clube FM') : 'Buscando...'}
                      </span>
                      <Power className={`w-4 h-4 ${isPlaying ? 'text-emerald-500 animate-pulse drop-shadow-[0_0_5px_#10B981]' : 'text-red-400 opacity-20'}`} />
                  </div>
                  <h2 className="text-3xl text-[#2C3E50] italic font-light tracking-tight mb-2 relative z-10 drop-shadow-sm min-h-[1.5em]">
                    {ativo?.titulo || "Rádio Desligada"}
                  </h2>
                  <p className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] opacity-40 text-[#8C7A66] relative z-10">
                    Convidada: {ativo?.convidada || "---"}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-between gap-8 pt-4">
                  <div className="flex items-center gap-6">
                      <button onClick={anterior} className="p-4 rounded-full border border-black/10 text-[#8C7A66] hover:text-[#C08081] transition-all bg-white active:scale-90 shadow-sm">
                        <Rewind fill="currentColor" size={20} />
                      </button>
                      <Button
                        onClick={togglePlay}
                        disabled={!ativo?.audioUrl}
                        className="rounded-full w-24 h-24 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all border-4 border-white/50 disabled:opacity-40"
                        style={{ background: rosaRetro }}>
                        {isPlaying ? <Pause fill="currentColor" size={32} /> : <Play fill="currentColor" size={32} className="ml-1" />}
                      </Button>
                      <button onClick={proximo} className="p-4 rounded-full border border-black/10 text-[#8C7A66] hover:text-[#C08081] transition-all bg-white active:scale-90 shadow-sm">
                        <FastForward fill="currentColor" size={20} />
                      </button>
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    
                    <input
                      type="range" min={0} max={duration || 1} step={0.5} value={currentTime}
                      onChange={handleSeek}
                      disabled={!ativo?.audioUrl}
                      className="w-full h-1 rounded-full appearance-none cursor-pointer disabled:opacity-20"
                      style={{ background: `linear-gradient(to right, ${rosaRetro} ${duration ? (currentTime / duration) * 100 : 0}%, #E8DED5 ${duration ? (currentTime / duration) * 100 : 0}%)` }}
                    />
                    <div className="flex justify-between text-[9px] font-mono opacity-30 text-[#8C7A66]">
                      <span>{fmtTime(currentTime)}</span>
                      <span>{ativo?.audioUrl ? fmtTime(duration) : (ativo?.spotifyUrl || ativo?.youtubeUrl ? 'Link externo' : 'Sem áudio')}</span>
                    </div>
                    
                    {!ativo?.audioUrl && (ativo?.spotifyUrl || ativo?.youtubeUrl) && (
                      <div className="flex gap-3 justify-center">
                        {ativo.spotifyUrl && <a href={ativo.spotifyUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold uppercase tracking-widest text-emerald-500 hover:underline">Ouvir no Spotify →</a>}
                        {ativo.youtubeUrl && <a href={ativo.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold uppercase tracking-widest text-red-400 hover:underline">Assistir no YouTube →</a>}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 px-6 py-4 rounded-full bg-white border border-black/10 shadow-inner group">
                    <Volume2 size={16} style={{ color: marromPapel }} className="opacity-40" />
                    <input 
                      type="range" min="0" max="100" value={volume} 
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="w-24 h-1 bg-[#E8DED5] rounded-full appearance-none cursor-pointer accent-[#C08081]"
                      style={{ background: `linear-gradient(to right, ${rosaRetro} ${volume}%, #E8DED5 ${volume}%)` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        
        <section className="space-y-12">
           <div className="flex flex-col items-center gap-4 opacity-30">
              <div className="h-px w-16 bg-[#2C3E50]" />
              <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.6em] text-[#2C3E50]">Arquivo de Gravações</h3>
           </div>

           {loading ? (
             <div className="text-center italic opacity-40 text-[#2C3E50] py-20">Sintonizando frequências...</div>
           ) : (
             <div className="grid md:grid-cols-2 gap-10">
                {episodios.map((ep, index) => (
                   <article 
                    key={ep.id} 
                    onClick={() => {
                      if (index === ativoIdx) { togglePlay(); }
                      else { setAtivoIdx(index); setIsPlaying(true); }
                    }} 
                    className={`bg-white/70 backdrop-blur-sm p-8 rounded-[3.5rem] flex items-center gap-8 border transition-all duration-500 group cursor-pointer hover:-translate-y-1 hover:shadow-2xl
                      ${ativoIdx === index ? 'border-[#C08081]/40 shadow-xl scale-[1.02]' : 'border-black/5 shadow-sm'}`}
                   >
                     <div className="w-16 h-16 rounded-3xl flex items-center justify-center transition-all shadow-inner" 
                          style={{ 
                            background: ativoIdx === index ? rosaRetro : '#F4ECE2', 
                            color: ativoIdx === index ? 'white' : marromPapel 
                          }}>
                        <Mic2 size={24} className={`${ativoIdx === index ? '' : 'group-hover:text-[#C08081]'} transition-all`} />
                     </div>
                     <div className="flex-1">
                       <p className="text-[8px] font-mono font-bold uppercase tracking-widest opacity-30 mb-1 text-black">{ep.data}</p>
                       <h4 className="text-2xl italic text-[#2C3E50] group-hover:text-[#C08081] transition-colors">{ep.titulo}</h4>
                     </div>
                     <Heart size={18} className={`transition-all ${ativoIdx === index ? 'text-rose-400 opacity-100 fill-current' : 'opacity-10'}`} />
                  </article>
                ))}
             </div>
           )}
        </section>
      </main>

      <style jsx>{`
        input[type='range']::-webkit-slider-thumb {
          appearance: none;
          width: 12px; height: 12px;
          background: white; border: 2px solid ${rosaRetro};
          border-radius: 50%; cursor: pointer;
        }
      `}</style>

      
      <audio
        ref={audioRef}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onDurationChange={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={() => { setIsPlaying(false); proximo(); }}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onError={() => setIsPlaying(false)}
      />
    </div>
  );
}