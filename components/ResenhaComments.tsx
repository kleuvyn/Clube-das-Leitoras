"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { normalizeDateValue } from '@/lib/utils';

interface Comentario {
  id: string;
  autoraNome: string;
  texto: string;
  createdAt: string | number | Date;
}

type Props = {
  resenhaId: string;
  tituloResenha?: string;
  aberto?: boolean;
  isStandalone?: boolean;
};

export default function ResenhaComments({ resenhaId, tituloResenha, aberto: abertoProp, isStandalone }: Props) {
  const [aberto, setAberto] = useState<boolean>(abertoProp ?? false);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [nome, setNome] = useState('');
  const [texto, setTexto] = useState('');

  const primaryColor = isStandalone ? '#000000' : '#2C3E50';
  const primaryFaded = isStandalone ? 'rgba(0,0,0,0.7)' : 'rgba(44,62,80,0.7)';

  const carregar = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/comentarios?resenhaId=${resenhaId}`);
      const data = await res.json();
      setComentarios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setComentarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (aberto) carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto, resenhaId]);

  useEffect(() => {
    if (typeof abertoProp === 'boolean' && abertoProp !== aberto) setAberto(abertoProp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abertoProp]);

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
      else {
        toast.success('Comentário publicado!');
        setTexto('');
        carregar();
      }
    } catch (err) {
      toast.error('Erro de conexão.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className={`border-t border-black/5 pt-10 mt-10 ${isStandalone ? 'text-black' : ''}`} id={`comentarios-${resenhaId}`} style={{ color: primaryColor }}>
      <div className="flex items-center gap-4 w-full text-left group" style={{ color: primaryColor }}>
        <div className="w-9 h-9 rounded-full border border-black/10 flex items-center justify-center shrink-0" style={{ color: '#2C3E50' }}>
          <MessageCircle size={14} />
        </div>
        <div className="flex-1">
          <p className="text-[9px] font-bold uppercase tracking-[0.5em] opacity-30">
            {comentarios.length > 0 ? `${comentarios.length} comentário${comentarios.length > 1 ? 's' : ''}` : 'Comentários'}
          </p>
          {aberto ? (
            <p className="text-lg italic font-light leading-tight" style={{ color: primaryFaded }}>Comentários</p>
          ) : (
            <Link href={`/resenhas/${resenhaId}#comentarios`} className="text-lg italic font-light leading-tight underline" style={{ color: primaryFaded }}>
              Abrir comentários
            </Link>
          )}
        </div>
      </div>

      {aberto && (
        <div className="mt-8 space-y-8">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 size={22} className="animate-spin opacity-20"/></div>
          ) : comentarios.length === 0 ? (
            <p className="text-center italic text-sm opacity-30 py-8" style={{ color: primaryColor }}>Seja a primeira a comentar sobre <em>{tituloResenha}</em>.</p>
          ) : (
            <div className="space-y-4">
              {comentarios.map(c => {
                const isExpanded = expandedIds.has(c.id);
                return (
                  <div key={c.id} className="bg-white/60 border border-black/5 rounded-3xl p-6 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: primaryColor }}>{c.autoraNome}</span>
                      <span className="text-[9px] opacity-30" style={{ color: primaryColor }}>
                        {normalizeDateValue(c.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p
                      className="text-sm italic leading-relaxed"
                      style={isExpanded ? {
                        color: primaryFaded,
                        textAlign: 'justify',
                      } : {
                        color: primaryFaded,
                        textAlign: 'justify',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 4,
                      }}
                    >
                      &quot;{c.texto}&quot;
                    </p>
                    {c.texto.length > 240 && (
                      <button
                        type="button"
                        onClick={() => {
                          setExpandedIds(prev => {
                            const next = new Set(prev);
                            if (next.has(c.id)) next.delete(c.id);
                            else next.add(c.id);
                            return next;
                          });
                        }}
                        className="text-[10px] font-bold uppercase tracking-widest underline opacity-70 hover:opacity-100"
                        style={{ color: primaryColor }}
                      >
                        {isExpanded ? 'Ler menos' : 'Ler mais'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="space-y-3 bg-white/40 rounded-3xl p-6 border border-black/5">
            <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" className="w-full p-3 bg-white rounded-xl text-sm outline-none border border-black/5 font-alice" style={{ color: primaryColor }} />
            <textarea value={texto} onChange={e => setTexto(e.target.value)} placeholder="Compartilhe sua opinião sobre esta resenha..." rows={3} className="w-full p-3 bg-white rounded-xl text-sm outline-none border border-black/5 resize-none font-alice" style={{ color: primaryColor }} />
            <div className="flex justify-end">
              <button onClick={enviar} disabled={enviando} className="flex items-center gap-2 px-5 py-2.5 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl disabled:opacity-40" style={{ backgroundColor: '#2C3E50' }}>
                {enviando ? <Loader2 size={12} className="animate-spin"/> : <Send size={12}/>} Publicar Comentário
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
