"use client";

import React, { useEffect, useState } from 'react';
import { Quote, Star, BookOpen, ChevronDown, MessageCircle, Send, Loader2 } from "lucide-react";
import { toast } from 'sonner';

const papelEditorial = "#FDFCFB";
const amareloVintage = "#E9C46A";
const azulPetroleo = "#2C3E50";

interface Resenha {
  id: string;
  title: string;
  book: string | null;
  author: string | null;
  content: string | null;
  rating: number | null;
  imageUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
}

interface Comentario {
  id: string;
  autoraNome: string;
  texto: string;
  createdAt: string;
}

const MESES_PT: Record<string, number> = {
  janeiro: 1, fevereiro: 2, março: 3, abril: 4, maio: 5, junho: 6,
  julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
};

function extrairAnoMes(r: Resenha): { ano: number; mes: number } {
  if (r.publishedAt) {
    const partes = r.publishedAt.split('/');
    if (partes.length === 2) {
      const anoNum = parseInt(partes[1].trim(), 10);
      const mesParte = partes[0].trim().toLowerCase();
      const mesNum = MESES_PT[mesParte] ?? parseInt(mesParte, 10);
      if (!isNaN(anoNum)) return { ano: anoNum, mes: isNaN(mesNum) ? 1 : mesNum };
    }
    const apenasAno = parseInt(r.publishedAt, 10);
    if (!isNaN(apenasAno)) return { ano: apenasAno, mes: 1 };
  }
  const d = new Date(r.createdAt);
  return { ano: d.getFullYear(), mes: d.getMonth() + 1 };
}

function labelMes(r: Resenha): string {
  if (r.publishedAt) {
    const partes = r.publishedAt.split('/');
    if (partes.length >= 1) return partes[0].trim();
    return r.publishedAt;
  }
  return new Date(r.createdAt).toLocaleDateString('pt-BR', { month: 'long' });
}

function MiniChat({ resenhaId, tituloResenha }: { resenhaId: string; tituloResenha: string }) {
  const [aberto, setAberto] = useState(false);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [nome, setNome] = useState('');
  const [texto, setTexto] = useState('');

  const carregar = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/comentarios?resenhaId=${resenhaId}`);
      const data = await res.json();
      setComentarios(Array.isArray(data) ? data : []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { if (aberto) carregar(); }, [aberto, resenhaId]);

  const enviar = async () => {
    if (!nome.trim() || !texto.trim()) return toast.error('Preencha seu nome e seu comentário.');
    setEnviando(true);
    try {
      const res = await fetch('/api/comentarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resenhaId, autoraNome: nome.trim(), texto: texto.trim() }),
      });
      const data = await res.json();
      if (!res.ok) toast.error(data.error || 'Erro ao enviar.');
      else { toast.success('Comentário publicado!'); setTexto(''); carregar(); }
    } catch { toast.error('Erro de conexão.'); }
    finally { setEnviando(false); }
  };

  return (
    <div className="border-t border-black/5 pt-10 mt-10">
      <button
        onClick={() => setAberto(!aberto)}
        className="flex items-center gap-4 w-full text-left group"
      >
        <div
          className="w-9 h-9 rounded-full border border-black/10 flex items-center justify-center shrink-0 group-hover:border-black/20 transition-colors"
          style={{ color: azulPetroleo }}
        >
          <MessageCircle size={14}/>
        </div>
        <div className="flex-1">
          <p className="text-[9px] font-bold uppercase tracking-[0.5em] opacity-30 text-[#2C3E50] group-hover:opacity-50 transition-opacity">
            {comentarios.length > 0 && !aberto ? `${comentarios.length} comentário${comentarios.length > 1 ? 's' : ''}` : 'Comentários'}
          </p>
          <p className="text-lg italic font-light text-[#2C3E50]/50 group-hover:text-[#2C3E50]/70 transition-colors leading-tight">
            {aberto ? 'Fechar comentários' : 'Ver comentários das leitoras'}
          </p>
        </div>
        <ChevronDown size={14} className={`opacity-20 group-hover:opacity-40 transition-all duration-300 ${aberto ? 'rotate-180' : ''}`}/>
      </button>

      {aberto && (
        <div className="mt-8 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 size={22} className="animate-spin opacity-20"/></div>
          ) : comentarios.length === 0 ? (
            <p className="text-center italic text-sm opacity-30 text-[#2C3E50] py-8">
              Seja a primeira a comentar sobre <em>{tituloResenha}</em>.
            </p>
          ) : (
            <div className="space-y-4">
              {comentarios.map(c => (
                <div key={c.id} className="bg-white/60 border border-black/5 rounded-3xl p-6 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: amareloVintage }}>{c.autoraNome}</span>
                    <span className="text-[9px] opacity-30 text-[#2C3E50]">{new Date(c.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <p className="text-sm italic leading-relaxed text-[#2C3E50]/70">"{c.texto}"</p>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3 bg-white/40 rounded-3xl p-6 border border-black/5">
            <input
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Seu nome"
              className="w-full p-3 bg-white rounded-xl text-sm outline-none border border-black/5 font-alice text-[#2C3E50]"
            />
            <textarea
              value={texto}
              onChange={e => setTexto(e.target.value)}
              placeholder="Compartilhe sua opinião sobre esta resenha..."
              rows={3}
              className="w-full p-3 bg-white rounded-xl text-sm outline-none border border-black/5 resize-none font-alice text-[#2C3E50]"
            />
            <button
              onClick={enviar}
              disabled={enviando}
              className="flex items-center gap-2 px-5 py-2.5 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl disabled:opacity-40 transition-opacity"
              style={{ backgroundColor: azulPetroleo }}
            >
              {enviando ? <Loader2 size={12} className="animate-spin"/> : <Send size={12}/>}
              Publicar Comentário
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResenhasPage() {
  const [resenhas, setResenhas] = useState<Resenha[]>([]);
  const [loading, setLoading] = useState(true);
  const [abertas, setAbertas] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/resenhas')
      .then(r => r.json())
      .then(data => setResenhas(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleAberta = (id: string) =>
    setAbertas(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  
  const agrupado = resenhas.reduce<Record<number, Resenha[]>>((acc, r) => {
    const { ano } = extrairAnoMes(r);
    if (!acc[ano]) acc[ano] = [];
    acc[ano].push(r);
    return acc;
  }, {});

  const anos = Object.keys(agrupado)
    .map(Number)
    .sort((a, b) => b - a); 

  
  for (const ano of anos) {
    agrupado[ano].sort((a, b) => extrairAnoMes(b).mes - extrairAnoMes(a).mes);
    // Remover duplicatas por título
    agrupado[ano] = agrupado[ano].filter((resenha, idx, arr) =>
      arr.findIndex(r => r.book?.toLowerCase() === resenha.book?.toLowerCase()) === idx
    );
  }

  return (
    <div
      className="min-h-screen pb-32 relative overflow-hidden font-alice selection:bg-[#FDE68A]"
      style={{ background: `${papelEditorial} url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')` }}
    >
      
      <header className="max-w-5xl mx-auto pt-32 pb-24 px-6 relative z-10 text-center border-b border-black/5">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px w-12 bg-[#2C3E50]/20" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.7em] text-[#2C3E50] opacity-60">
            Crônicas de um Ano Literário
          </span>
          <div className="h-px w-12 bg-[#2C3E50]/20" />
        </div>

        <h1 className="text-7xl md:text-[100px] text-[#2C3E50] tracking-tighter leading-[0.8] mb-10">
          Diário de <span style={{ color: amareloVintage }} className="italic font-light">Leituras</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-3xl mx-auto border-t border-black/10 pt-10">
          <p className="text-base leading-relaxed opacity-60 text-black italic">
            &ldquo;Este é o nosso espaço de registro. Onde as palavras lidas encontram nossas vozes e se transformam em memórias de papel.&rdquo;
          </p>
          <div className="flex flex-col justify-end items-start md:items-end">
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-sans font-bold" style={{ color: amareloVintage }}>
              <Quote size={14} /> Crônicas de um Ano Literário
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 relative z-10 mt-24 space-y-32">

        {loading ? (
          <div className="text-center italic opacity-30 text-[#2C3E50] py-20">
            Abrindo os arquivos do diário...
          </div>
        ) : resenhas.length === 0 ? (
          <div className="text-center py-24 space-y-4 opacity-40">
            <BookOpen size={40} className="mx-auto" style={{ color: azulPetroleo }} />
            <p className="italic text-[#2C3E50]">Ainda não há resenhas publicadas.</p>
          </div>
        ) : (
          anos.map(ano => (
            <section key={ano}>
              
              <div className="flex items-end gap-6 mb-20 select-none">
                <span
                  className="text-[100px] md:text-[140px] font-light tracking-tighter leading-none"
                  style={{ color: `${azulPetroleo}10` }}
                >
                  {ano}
                </span>
                <div className="flex-1 mb-6">
                  <div className="h-px w-full bg-black/10" />
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.5em] opacity-30 text-[#2C3E50]">
                    {agrupado[ano].length} leitura{agrupado[ano].length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              
              <div className="space-y-0">
                {agrupado[ano].map(r => (
                  <ResenhaCard
                    key={r.id}
                    resenha={r}
                    periodo={labelMes(r)}
                    aberta={abertas.has(r.id)}
                    onToggle={() => toggleAberta(r.id)}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </main>
    </div>
  );
}

function ResenhaCard({ resenha: r, periodo, aberta, onToggle }: {
  resenha: Resenha; periodo: string; aberta: boolean; onToggle: () => void;
}) {
  const preview = r.content ? r.content.slice(0, 300) + (r.content.length > 300 ? '...' : '') : '';

  return (
    <article className="group grid grid-cols-1 md:grid-cols-12 gap-12 items-start border-b border-black/5 pb-20">

      
      <div className="md:col-span-8 space-y-6">

        
        <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: amareloVintage }}>
          <span>{periodo}</span>
          {r.rating && (
            <>
              <span className="opacity-20 text-black">|</span>
              <span className="flex gap-0.5 items-center">
                {[1,2,3,4,5].map(n => (
                  <Star key={n} size={11} fill={n <= r.rating! ? amareloVintage : 'none'} stroke={amareloVintage} strokeWidth={1.5} />
                ))}
              </span>
            </>
          )}
        </div>

        
        <div className="space-y-4">
          <h2 className="text-4xl md:text-5xl text-[#2C3E50] tracking-tight group-hover:italic transition-all duration-500">
            {r.title}
          </h2>
          {(r.book || r.author) && (
            <p className="text-lg italic opacity-50 text-black leading-relaxed">
              {r.book && <span>{r.book}</span>}
              {r.book && r.author && <span> · </span>}
              {r.author && <span>por {r.author}</span>}
            </p>
          )}
        </div>

        
        {r.content && (
          <div className="relative pl-5 border-l-2" style={{ borderColor: `${amareloVintage}60` }}>
            <p className="text-base italic leading-relaxed text-[#2C3E50]/70 font-light">
              &ldquo;{aberta ? r.content : preview}&rdquo;
            </p>
          </div>
        )}

        {r.content && r.content.length > 300 && (
          <button
            onClick={onToggle}
            className="flex items-center gap-2 text-[9px] font-mono font-bold uppercase tracking-[0.3em] opacity-40 hover:opacity-80 transition-opacity text-[#2C3E50]"
          >
            <ChevronDown size={14} className={`transition-transform duration-500 ${aberta ? 'rotate-180' : ''}`} />
            {aberta ? 'Fechar' : 'Ler Resenha Completa'}
          </button>
        )}

        <MiniChat resenhaId={r.id} tituloResenha={r.title} />
      </div>

      
      <div className="md:col-span-4 flex justify-end">
        {r.imageUrl ? (
          <div className="p-3 bg-white shadow-xl -rotate-2 group-hover:rotate-0 transition-all duration-700 border border-black/3 w-full max-w-70">
            <div className="aspect-4/5 overflow-hidden relative transition-all duration-1000">
              <img
                src={r.imageUrl}
                alt={r.book ?? r.title}
                className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000"
              />
            </div>
            <div className="mt-3 py-2 border-t border-black/5">
              <span className="text-[8px] font-bold uppercase tracking-[0.3em] opacity-30 block text-center italic">
                {/* Legenda mais escura para melhor leitura */}
                <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-black block text-center italic">
                  {/* Legenda com cinza escuro para melhor leitura */}
                  <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#222] block text-center italic">
                    {r.author ?? ''}
                  </span>
                </span>
              </span>
            </div>
          </div>
        ) : null}
      </div>

    </article>
  );
}

function ResenhaCardCompacto({ resenha: r, periodo }: { resenha: Resenha; periodo: string }) {
  return (
    <div className="group grid grid-cols-1 md:grid-cols-12 gap-8 items-start border-b border-black/5 pb-12">

      
      <div className="md:col-span-8 space-y-4">
        <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: amareloVintage }}>
          <span>{periodo}</span>
          {r.rating && (
            <>
              <span className="opacity-20 text-black">|</span>
              <span className="flex gap-0.5 items-center">
                {[1,2,3,4,5].map(n => (
                  <Star key={n} size={10} fill={n <= r.rating! ? amareloVintage : 'none'} stroke={amareloVintage} strokeWidth={1.5} />
                ))}
              </span>
            </>
          )}
        </div>
        <h4 className="text-3xl text-[#2C3E50] tracking-tight group-hover:italic transition-all duration-500">{r.title}</h4>
        {(r.book || r.author) && (
          <p className="text-base italic opacity-40 text-black">{r.book}{r.author ? ` · por ${r.author}` : ''}</p>
        )}
        {r.content && (
          <div className="relative pl-4 border-l-2" style={{ borderColor: `${amareloVintage}60` }}>
            <p className="text-sm italic leading-relaxed text-[#2C3E50]/60">
              &ldquo;{r.content.slice(0, 220)}{r.content.length > 220 ? '...' : ''}&rdquo;
            </p>
          </div>
        )}
        <MiniChat resenhaId={r.id} tituloResenha={r.title} />
      </div>

      
      <div className="md:col-span-4 flex justify-end">
        {r.imageUrl ? (
          <div className="p-2 bg-white shadow-lg -rotate-1 group-hover:rotate-0 transition-all duration-700 border border-black/3 w-full max-w-50">
            <div className="aspect-4/5 overflow-hidden transition-all duration-700">
              <img src={r.imageUrl} alt={r.book ?? r.title} className="w-full h-full object-cover" />
            </div>
            <div className="mt-2 py-1 border-t border-black/5">
              <span className="text-[7px] font-bold uppercase tracking-[0.3em] opacity-20 block text-center italic">{r.author ?? ''}</span>
            </div>
          </div>
        ) : null}
      </div>

    </div>
  );
}
