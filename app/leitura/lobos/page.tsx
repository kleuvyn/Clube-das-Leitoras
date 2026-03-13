"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Quote, Calendar, ExternalLink, Download, Video, ChevronDown,
  ChevronUp, Send, MessageCircle, Loader2, Youtube, FileText, Archive,
  ArrowRight, Music, Heart
} from 'lucide-react';
import { toast } from 'sonner';

const vermelhoTerracota = "#8b2f2f";
const marromTerra = "#4A3F35";
const begePapel = "#FDFBF9";

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



interface Reflexao {
  id: string;
  autoraNome: string;
  texto: string;
  createdAt: string;
}

function SecaoReflexoes({ leituraId, temaNome }: { leituraId: string; temaNome: string }) {
  const [reflexoes, setReflexoes] = useState<Reflexao[]>([]);
  const [loading, setLoading] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [nome, setNome] = useState('');
  const [texto, setTexto] = useState('');

  const carregar = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leitura/reflexoes?leituraId=${leituraId}`);
      const data = await res.json();
      setReflexoes(Array.isArray(data) ? data : []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { carregar(); }, [leituraId]);

  const enviar = async () => {
    if (!nome.trim() || !texto.trim()) return toast.error('Preencha seu nome e sua reflexão.');
    setEnviando(true);
    try {
      const res = await fetch('/api/leitura/reflexoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leituraId, autoraNome: nome.trim(), texto: texto.trim() }),
      });
      const data = await res.json();
      if (!res.ok) toast.error(data.error || 'Erro ao enviar.');
      else { toast.success('Reflexão compartilhada!'); setTexto(''); carregar(); }
    } catch { toast.error('Erro de conexão.'); }
    finally { setEnviando(false); }
  };

  return (
    <div className="mt-6 space-y-6 border-t pt-6" style={{ borderColor: `${vermelhoTerracota}20` }}>
      <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40" style={{ color: marromTerra }}>
        Reflexões — {temaNome}
      </p>

      {loading ? (
        <div className="flex justify-center py-6"><Loader2 size={20} className="animate-spin opacity-20"/></div>
      ) : reflexoes.length === 0 ? (
        <p className="italic text-sm opacity-40 text-center py-4" style={{ color: marromTerra }}>
          Seja a primeira a compartilhar uma reflexão sobre este encontro.
        </p>
      ) : (
        <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
          {reflexoes.map(r => (
            <div key={r.id} className="bg-white/60 rounded-2xl p-5 space-y-2 border border-black/5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: vermelhoTerracota }}>{r.autoraNome}</span>
                <span className="text-[9px] opacity-30">{new Date(r.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
              <p className="text-sm italic leading-relaxed opacity-70" style={{ color: marromTerra }}>"{r.texto}"</p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3 bg-white/40 rounded-3xl p-6 border border-black/5">
        <input
          value={nome}
          onChange={e => setNome(e.target.value)}
          placeholder="Seu nome"
          className="w-full p-3 bg-white rounded-xl text-sm outline-none border border-black/5 font-alice"
        />
        <textarea
          value={texto}
          onChange={e => setTexto(e.target.value)}
          placeholder="Compartilhe sua reflexão sobre este encontro..."
          rows={3}
          className="w-full p-3 bg-white rounded-xl text-sm outline-none border border-black/5 resize-none font-alice"
        />
        <button
          onClick={enviar}
          disabled={enviando}
          className="flex items-center gap-2 px-5 py-2.5 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl disabled:opacity-40 transition-opacity"
          style={{ backgroundColor: vermelhoTerracota }}
        >
          {enviando ? <Loader2 size={12} className="animate-spin"/> : <Send size={12}/>}
          Compartilhar Reflexão
        </button>
      </div>
    </div>
  );
}

function EncontroCard({ enc, aberto, onToggle }: { enc: Encontro; aberto: boolean; onToggle: () => void }) {
  return (
    <div className="bg-white rounded-[3rem] border border-black/5 shadow-sm overflow-hidden transition-all duration-500">
      <div className="flex flex-col md:flex-row gap-0">
        {enc.imagem && (
          <div className="md:w-56 shrink-0 flex items-center justify-center p-6 md:p-8">
            <div className="bg-white p-3 pb-8 shadow-md -rotate-2 hover:rotate-0 transition-transform duration-500 cursor-default">
              <img src={enc.imagem} alt={enc.tema} className="w-full object-cover block" style={{ width: '160px', height: '140px', objectFit: 'cover' }}/>
            </div>
          </div>
        )}
        <div className="flex-1 p-8 md:p-10 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full opacity-60" style={{ backgroundColor: `${vermelhoTerracota}15`, color: vermelhoTerracota }}>
              <Calendar size={10}/> {enc.data}
            </span>
          </div>
          <h3 className="text-2xl italic font-light" style={{ color: marromTerra }}>{enc.tema}</h3>
          <div className="flex flex-wrap gap-3 pt-1">
            {enc.linkMeet && (
              <a href={enc.linkMeet} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white rounded-xl"
                style={{ backgroundColor: vermelhoTerracota }}>
                <Video size={11}/> Entrar no Meet
              </a>
            )}
            {enc.linkDrive && (
              <a href={enc.linkDrive} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl border"
                style={{ color: vermelhoTerracota, borderColor: `${vermelhoTerracota}40` }}>
                <Download size={11}/> Material / Drive
              </a>
            )}
          </div>
          <button onClick={onToggle} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider opacity-30 hover:opacity-60 transition-opacity pt-2" style={{ color: marromTerra }}>
            <MessageCircle size={11}/>
            {aberto ? 'Fechar Reflexões' : 'Reflexões deste Encontro'}
            {aberto ? <ChevronUp size={11}/> : <ChevronDown size={11}/>}
          </button>
        </div>
      </div>
      {aberto && (
        <div className="px-8 md:px-10 pb-8 md:pb-10 animate-in fade-in duration-300">
          <SecaoReflexoes leituraId={enc.id} temaNome={enc.tema}/>
        </div>
      )}
    </div>
  );
}

function EncontroEncerrado({ enc, aberto, onToggle }: { enc: Encontro; aberto: boolean; onToggle: () => void }) {
  return (
    <div className="border border-black/5 rounded-[2.5rem] overflow-hidden bg-white/60 transition-all">
      <button onClick={onToggle} className="w-full flex items-center justify-between gap-4 p-7 text-left hover:bg-white/80 transition-colors">
        <div className="flex items-center gap-5">
          {enc.imagem && <img src={enc.imagem} alt={enc.tema} className="w-14 h-14 object-cover rounded-2xl opacity-70"/>}
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest opacity-40" style={{ color: marromTerra }}>{enc.data}</span>
            <p className="text-lg italic font-light opacity-60" style={{ color: marromTerra }}>{enc.tema}</p>
          </div>
        </div>
        <ChevronDown size={16} className={`opacity-30 shrink-0 transition-transform duration-300 ${aberto ? 'rotate-180' : ''}`}/>
      </button>
      {aberto && (
        <div className="px-7 pb-7 space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-wrap gap-3">
            {enc.linkLive && (
              <a href={enc.linkLive} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white rounded-xl"
                style={{ backgroundColor: '#c0392b' }}>
                <Youtube size={11}/> Assistir Gravação
              </a>
            )}
            {enc.linkDrive && (
              <a href={enc.linkDrive} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl border"
                style={{ color: vermelhoTerracota, borderColor: `${vermelhoTerracota}40` }}>
                <FileText size={11}/> Material
              </a>
            )}
          </div>
          <SecaoReflexoes leituraId={enc.id} temaNome={enc.tema}/>
        </div>
      )}
    </div>
  );
}

export default function PaginaLeituraLobos() {
  const [encontros, setEncontros] = useState<Encontro[]>([]);
  const [encerrados, setEncerrados] = useState<Encontro[]>([]);
  const [loading, setLoading] = useState(true);
  const [abertos, setAbertos] = useState<Set<string>>(new Set());
  const [imagemCapa, setImagemCapa] = useState<string | null>(null);
  const [livroDoMesId, setLivroDoMesId] = useState<string | null>(null);
  const [livroDoMesLoading, setLivroDoMesLoading] = useState(true);

  useEffect(() => {
    
    fetch('/api/livro-do-mes')
      .then(r => r.json())
      .then((data: Array<{ id: string; livro: string | null }>) => {
        if (Array.isArray(data) && data.length > 0) {
          const lobos = data.find(l =>
            l.livro?.toLowerCase().includes('lobos') ||
            l.livro?.toLowerCase().includes('mulheres')
          );
          
          setLivroDoMesId((lobos ?? data[0]).id);
        }
      })
      .catch(() => {})
      .finally(() => setLivroDoMesLoading(false));
  }, []);

  useEffect(() => {
    fetch('/api/leitura')
      .then(r => r.json())
      .then(data => {
        const ativos: Encontro[] = Array.isArray(data.encontros) ? data.encontros : [];
        const enc: Encontro[] = Array.isArray(data.encerrados) ? data.encerrados : [];
        setEncontros(ativos);
        setEncerrados(enc);
        const primeiraImagem = [...ativos, ...enc].find(e => e.imagem)?.imagem ?? null;
        setImagemCapa(primeiraImagem);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleAberto = (id: string) =>
    setAbertos(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="min-h-screen text-[#2C241B] font-alice pb-20 relative overflow-hidden"
         style={{ background: `#FDFCFB url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')` }}>

      
      <header className="max-w-5xl mx-auto pt-32 pb-24 px-6 relative z-10 text-center">
        <div className="flex items-center justify-center gap-6 mb-10">
          <div className="h-px w-12 opacity-30" style={{ backgroundColor: vermelhoTerracota }} />
          <div className="flex flex-col items-center gap-2">
            <div className="px-5 py-1.5 rounded-full bg-[#8b2f2f] text-white text-[10px] font-bold uppercase tracking-[0.2em] animate-pulse">
              Próxima Leitura
            </div>
            <span className="text-[#8C7A66] text-[10px] font-bold uppercase tracking-[0.5em] opacity-60">
              Início em Breve • 2026
            </span>
          </div>
          <div className="h-px w-12 opacity-30" style={{ backgroundColor: vermelhoTerracota }} />
        </div>

        <h1 className="text-7xl md:text-[100px] text-[#2C3E50] tracking-tighter italic font-light mb-12 leading-[0.85]">
          Mulheres que Correm <br/>
          <span style={{ color: vermelhoTerracota }} className="not-italic font-normal">com os Lobos</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-3xl mx-auto border-t pt-10" style={{ borderColor: `${vermelhoTerracota}30` }}>
          <p className="text-[#8C7A66] italic text-base leading-relaxed border-l-4 pl-6" style={{ borderColor: vermelhoTerracota }}>
            "A jornada que estamos prestes a iniciar não é apenas uma leitura; é um rito de passagem para a alma feminina."
          </p>
          <div className="flex flex-col justify-end items-start md:items-end gap-4">
            <p className="text-xl italic opacity-80" style={{ color: marromTerra }}>Clarissa Pinkola Estés</p>
            <div className="flex gap-3">
              <span className="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border" style={{ color: vermelhoTerracota, borderColor: `${vermelhoTerracota}40` }}>Psicologia</span>
              <span className="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border" style={{ color: vermelhoTerracota, borderColor: `${vermelhoTerracota}40` }}>Arquétipos</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 space-y-24">

        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          
          <aside className="lg:col-span-4 space-y-12 order-2 lg:order-1">
            <div className="bg-white p-8 rounded-sm border-2 border-[#2C241B]/5 shadow-sm space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-50 border-b pb-2">Prepare-se para o Resgate</h4>
              <p className="text-sm italic opacity-80" style={{ color: marromTerra }}>
                Ainda não abrimos a primeira página, mas o chamado já começou. Prepare seu exemplar!
              </p>
              <ul className="space-y-4 italic text-lg text-[#5A5046]">
                <li className="flex items-start gap-2"><ArrowRight size={14} className="mt-1.5" style={{ color: vermelhoTerracota }} /> Garanta sua edição (Record)</li>
                <li className="flex items-start gap-2"><ArrowRight size={14} className="mt-1.5" style={{ color: vermelhoTerracota }} /> Reserve um caderno de notas</li>
                <li className="flex items-start gap-2"><ArrowRight size={14} className="mt-1.5" style={{ color: vermelhoTerracota }} /> Prepare o espírito selvagem</li>
              </ul>
            </div>

            <div className="p-8 border-2 border-dashed rounded-sm space-y-6" style={{ borderColor: `${vermelhoTerracota}40` }}>
              <div className="flex items-center gap-2">
                <Music size={18} style={{ color: vermelhoTerracota }} />
                <h4 className="text-[10px] font-bold uppercase tracking-widest">Espera Criativa</h4>
              </div>
              <p className="text-sm opacity-70 italic">Enquanto o dia do encontro não chega, entre no clima com nossa playlist oficial.</p>
            </div>
          </aside>

          
          <article className="lg:col-span-5 text-xl leading-relaxed text-justify space-y-10 text-[#4A4036] order-1 lg:order-2">
            <p className="first-letter:text-7xl first-letter:font-bold first-letter:mr-4 first-letter:float-left first-letter:leading-none" style={{ color: vermelhoTerracota }}>
              A jornada que estamos prestes a iniciar não é apenas uma leitura; é um rito de passagem para a alma feminina.
            </p>

            <p>Em breve, mergulharemos nos contos que Clarissa Pinkola Estés resgatou para nos lembrar de quem realmente somos antes que o mundo nos dissesse como deveríamos ser.</p>

            <div className="py-12 px-8 bg-white border shadow-inner italic text-2xl text-center leading-relaxed relative" style={{ borderColor: `${vermelhoTerracota}20` }}>
              <Quote size={40} className="absolute -top-5 left-1/2 -translate-x-1/2 opacity-10 fill-current" style={{ color: vermelhoTerracota }} />
              "Ser selvagem não significa ser dissoluta, mas viver uma vida plena, com todos os seus ciclos naturais."
            </div>

            <p>Fique atenta ao nosso cronograma. Nossa primeira roda de conversa sobre os mitos primordiais será anunciada aqui e no nosso grupo oficial.</p>

            <div className="pt-10 flex items-center gap-4 justify-center md:justify-start">
              <Heart size={20} style={{ color: vermelhoTerracota }} className="fill-current opacity-80" />
              <p className="text-sm font-bold uppercase tracking-[0.2em] opacity-40 italic">O chamado da floresta está chegando.</p>
            </div>
          </article>

          {/* Foto do lado direito */}
          {imagemCapa && (
            <div className="lg:col-span-3 order-3 flex flex-col items-center gap-4">
              <div className="relative w-full aspect-3/4 rounded-4xl overflow-hidden shadow-2xl border border-black/5">
                <Image
                  src={imagemCapa}
                  alt="Capa do livro"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-30" style={{ color: marromTerra }}>
                Mulheres que Correm com os Lobos
              </span>
            </div>
          )}
        </div>
            
            {encontros.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1" style={{ backgroundColor: `${vermelhoTerracota}20` }}/>
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.6em] opacity-40 flex items-center gap-2" style={{ color: marromTerra }}>
                    <Calendar size={12}/> Próximos Encontros
                  </h2>
                  <div className="h-px flex-1" style={{ backgroundColor: `${vermelhoTerracota}20` }}/>
                </div>
                <div className="space-y-6">
                  {encontros.map(enc => (
                    <EncontroCard key={enc.id} enc={enc} aberto={abertos.has(enc.id)} onToggle={() => toggleAberto(enc.id)}/>
                  ))}
                </div>
              </section>
            )}

            {encerrados.length > 0 && (
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-black/5"/>
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.6em] opacity-40 flex items-center gap-2" style={{ color: marromTerra }}>
                    <Archive size={12}/> Encontros Anteriores
                  </h2>
                  <div className="h-px flex-1 bg-black/5"/>
                </div>
                <div className="space-y-4">
                  {encerrados.map(enc => (
                    <EncontroEncerrado
                      key={enc.id}
                      enc={enc}
                      aberto={abertos.has(enc.id)}
                      onToggle={() => toggleAberto(enc.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            
            <div className="py-20 px-8 bg-white/50 border shadow-inner italic text-2xl text-center leading-relaxed relative rounded-[3rem]" style={{ borderColor: `${vermelhoTerracota}15` }}>
              <Quote size={40} className="absolute -top-5 left-1/2 -translate-x-1/2 opacity-10 fill-current" style={{ color: vermelhoTerracota }}/>
              "Ser selvagem não significa ser dissoluta, mas viver uma vida plena, com todos os seus ciclos naturais."
            </div>
      </main>
    </div>
  );
}
