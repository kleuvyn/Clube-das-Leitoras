'use client';

import React, { useState, useEffect } from 'react';
import { Send, MessageCircle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const verdeMusgo = "#4F5D4B";

interface Comentario {
  id: string;
  autoraNome: string;
  texto: string;
  createdAt: string;
}

interface BatePapoProps {
  livroDoMesId: string;
  livroNome: string;
}

export function BatePapo({ livroDoMesId, livroNome }: BatePapoProps) {
  const [aberto, setAberto] = useState(false);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [nome, setNome] = useState('');
  const [texto, setTexto] = useState('');

  const carregarComentarios = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/comentarios?livroDoMesId=${livroDoMesId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setComentarios(Array.isArray(data) ? data : []);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (aberto) carregarComentarios();
  }, [aberto, livroDoMesId]);

  const handleEnviar = async () => {
    if (!nome.trim() || !texto.trim()) {
      toast.error('Preencha seu nome e seu comentário.');
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch('/api/comentarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ livroDoMesId, autoraNome: nome, texto }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Erro ao enviar comentário.');
      } else {
        toast.success('Opinião publicada!');
        setTexto('');
        carregarComentarios();
      }
    } catch {
      toast.error('Erro ao enviar. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="border-t border-black/5 pt-12 mt-12">
      
      <button
        onClick={() => setAberto(!aberto)}
        className="flex items-center gap-4 w-full text-left group"
      >
        <div className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center group-hover:border-black/20 transition-colors shrink-0"
             style={{ color: verdeMusgo }}>
          <MessageCircle size={16} />
        </div>
        <div className="flex-1">
          <p className="text-[9px] font-bold uppercase tracking-[0.5em] opacity-30 text-black group-hover:opacity-50 transition-opacity">
            {comentarios.length > 0 && !aberto ? `${comentarios.length} opinião${comentarios.length > 1 ? 'ões' : ''}` : 'Bate-Papo'}
          </p>
          <p className="text-xl italic font-light text-black/50 group-hover:text-black/70 transition-colors leading-tight">
            Ver a opinião das leitoras
          </p>
        </div>
        <div className="opacity-20 group-hover:opacity-40 transition-opacity">
          {aberto ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {aberto && (
        <div className="mt-10 space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">

          
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin opacity-20" size={28} />
            </div>
          ) : comentarios.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <MessageCircle size={28} className="mx-auto opacity-10" />
              <p className="text-sm italic opacity-30 text-black">
                Seja a primeira a compartilhar sua opinião sobre <em>{livroNome}</em>.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {comentarios.map((c) => (
                <div key={c.id} className="bg-white/60 border border-black/5 rounded-3xl p-7 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: verdeMusgo }}>
                      {c.autoraNome}
                    </span>
                    <span className="text-[9px] opacity-20 text-black">
                      {new Date(c.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-base italic leading-relaxed opacity-60 text-black">{c.texto}</p>
                </div>
              ))}
            </div>
          )}

          
          <div className="bg-[#FDFCFB] border border-black/5 rounded-[2.5rem] p-8 space-y-5">
            <p className="text-[9px] font-bold uppercase tracking-[0.5em] opacity-30 text-black">Deixe sua opinião</p>
            <input
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-transparent border-b border-black/10 py-3 text-sm outline-none text-black placeholder:opacity-30 italic"
            />
            <textarea
              placeholder={`O que você achou de "${livroNome}"?`}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={4}
              className="w-full bg-transparent border-b border-black/10 py-3 text-sm outline-none text-black placeholder:opacity-30 italic resize-none"
            />
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleEnviar}
                disabled={enviando}
                className="text-white text-[9px] font-bold uppercase tracking-widest px-8 py-6 h-auto rounded-2xl shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2"
                style={{ backgroundColor: verdeMusgo }}
              >
                {enviando
                  ? <Loader2 size={14} className="animate-spin" />
                  : <Send size={14} />}
                Publicar Opinião
              </Button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
