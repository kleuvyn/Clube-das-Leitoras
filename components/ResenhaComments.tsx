"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Send, Loader2, Edit3, X, Heart, Book } from 'lucide-react';
import { toast } from 'sonner';
import { normalizeDateValue } from '@/lib/utils';

interface Comentario {
  id: string;
  autoraNome: string;
  autoraEmail?: string | null;
  texto: string;
  likes?: number;
  replyToId?: string | null;
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
  const [isNavigating, setIsNavigating] = useState(false);
  const [nome, setNome] = useState('');
  const [texto, setTexto] = useState('');
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
  const [replyTexto, setReplyTexto] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [savingLike, setSavingLike] = useState<string | null>(null);
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(new Set());

  const primaryColor = isStandalone ? '#000000' : '#2C3E50';
  const primaryFaded = isStandalone ? 'rgba(0,0,0,0.7)' : 'rgba(44,62,80,0.7)';
  const instagramHeartColor = '#E1306C';

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
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
      return match ? decodeURIComponent(match[1]) : null;
    };

    setUserEmail(getCookie('clube-user-email'));
    setUserName(getCookie('clube-user-name'));

    try {
      const stored = window.localStorage.getItem('likedComentarios');
      if (stored) {
        const ids = JSON.parse(stored) as string[];
        setLikedCommentIds(new Set(Array.isArray(ids) ? ids : []));
      }
    } catch {
      setLikedCommentIds(new Set());
    }
  }, []);

  const persistLikedComments = (ids: Set<string>) => {
    try {
      window.localStorage.setItem('likedComentarios', JSON.stringify(Array.from(ids)));
    } catch {
      // ignore
    }
  };

  const curtirComentario = async (comentarioId: string) => {
    setSavingLike(comentarioId);
    try {
      const res = await fetch('/api/comentarios', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: comentarioId, action: 'like' }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Erro ao curtir o comentário.');
      } else {
        setComentarios((prev) => prev.map((c) => c.id === comentarioId ? { ...c, likes: data.likes ?? (c.likes || 0) + 1 } : c));
        setLikedCommentIds((prev) => {
          const next = new Set(prev);
          next.add(comentarioId);
          persistLikedComments(next);
          return next;
        });
      }
    } catch (err) {
      toast.error('Erro de conexão.');
    } finally {
      setSavingLike(null);
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
        body: JSON.stringify({ resenhaId, autoraNome: nome.trim(), autoraEmail: userEmail, texto: texto.trim() }),
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

  const canEditComment = (comentario: Comentario) => {
    const emailMatch = comentario.autoraEmail && userEmail && comentario.autoraEmail.trim().toLowerCase() === userEmail.trim().toLowerCase();
    const nameMatch = !comentario.autoraEmail && userName && comentario.autoraNome.trim().toLowerCase() === userName.trim().toLowerCase();
    return Boolean(emailMatch || nameMatch);
  };

  const startEditing = (comentario: Comentario) => {
    setEditingCommentId(comentario.id);
    setEditingText(comentario.texto);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditingText('');
  };

  const startReplying = (comentarioId: string) => {
    setReplyToCommentId(comentarioId);
    setReplyTexto('');
  };

  const cancelReplying = () => {
    setReplyToCommentId(null);
    setReplyTexto('');
  };

  const sendReply = async (comentarioId: string) => {
    if (!nome.trim() || !replyTexto.trim()) return toast.error('Preencha seu nome e sua resposta.');
    setEnviando(true);
    try {
      const res = await fetch('/api/comentarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resenhaId,
          autoraNome: nome.trim(),
          autoraEmail: userEmail,
          texto: replyTexto.trim(),
          replyToId: comentarioId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Erro ao responder comentário.');
      } else {
        toast.success('Resposta publicada!');
        setReplyTexto('');
        setReplyToCommentId(null);
        carregar();
      }
    } catch (err) {
      toast.error('Erro de conexão.');
    } finally {
      setEnviando(false);
    }
  };

  const saveEdit = async (comentarioId: string) => {
    if (!editingText.trim()) return toast.error('O comentário não pode ficar vazio.');
    setSavingEdit(true);
    try {
      const res = await fetch('/api/comentarios', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: comentarioId, texto: editingText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Erro ao atualizar comentário.');
      } else {
        toast.success('Comentário atualizado!');
        setComentarios((prev) => prev.map((c) => c.id === comentarioId ? { ...c, texto: editingText.trim() } : c));
        cancelEditing();
      }
    } catch (err) {
      toast.error('Erro de conexão.');
    } finally {
      setSavingEdit(false);
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
            <Link 
              href={`/resenhas/${resenhaId}#comentarios`} 
              className="text-lg italic font-light leading-tight underline flex items-center gap-2" 
              style={{ color: primaryFaded }}
              onClick={() => setIsNavigating(true)}
            >
              Abrir {tituloResenha ?? 'Comentários'}
              {isNavigating && <Loader2 size={14} className="animate-spin opacity-50" />}
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
              {comentarios.filter(c => !c.replyToId).map(c => {
                const isExpanded = expandedIds.has(c.id);
                const replies = comentarios.filter((reply) => reply.replyToId === c.id);
                return (
                  <div key={c.id} className="bg-white/60 border border-black/5 rounded-3xl p-6 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Book size={14} style={{ color: primaryColor }} />
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: primaryColor }}>{c.autoraNome}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {canEditComment(c) && (
                          <button
                            type="button"
                            onClick={() => startEditing(c)}
                            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#2C3E50] opacity-70 hover:opacity-100"
                            style={{ color: primaryColor }}
                          >
                            <Edit3 size={12} /> Editar
                          </button>
                        )}
                        <span className="text-[9px] opacity-30" style={{ color: primaryColor }}>
                          {normalizeDateValue(c.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    {editingCommentId === c.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          rows={4}
                          className="w-full p-4 bg-white rounded-2xl border border-black/10 text-sm outline-none resize-none"
                        />
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => saveEdit(c.id)}
                            disabled={savingEdit}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2C3E50] text-white text-[10px] font-bold uppercase tracking-[0.2em] disabled:opacity-40"
                          >
                            {savingEdit ? 'Salvando...' : 'Salvar'}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 text-[10px] font-bold uppercase tracking-[0.2em]"
                          >
                            <X size={12} /> Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
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
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between gap-3">
                            <button
                              type="button"
                              onClick={() => curtirComentario(c.id)}
                              disabled={savingLike === c.id}
                              className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest hover:opacity-80 disabled:opacity-40 ${likedCommentIds.has(c.id) ? 'text-[#E1306C]' : 'text-[#2C3E50]'}`}
                            >
                              <Heart
                                size={14}
                                fill={likedCommentIds.has(c.id) ? instagramHeartColor : 'none'}
                                style={{ color: likedCommentIds.has(c.id) ? instagramHeartColor : primaryColor }}
                              />
                              {savingLike === c.id ? '...' : `${c.likes ?? 0}`}
                            </button>
                            <button
                              type="button"
                              onClick={() => startReplying(c.id)}
                              className="text-[10px] font-bold uppercase tracking-widest underline opacity-70 hover:opacity-100"
                              style={{ color: primaryColor }}
                            >
                              Responder
                            </button>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            {c.texto.length > 240 ? (
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
                            ) : <span />}
                          </div>
                        </div>
                        {replyToCommentId === c.id && (
                          <div className="mt-4 space-y-3 bg-[#F7F7F5] rounded-3xl p-4 border border-black/5">
                            <textarea
                              value={replyTexto}
                              onChange={(e) => setReplyTexto(e.target.value)}
                              rows={3}
                              className="w-full p-4 bg-white rounded-2xl border border-black/10 text-sm outline-none resize-none"
                              placeholder="Responder a este comentário..."
                            />
                            <div className="flex flex-wrap gap-3">
                              <button
                                type="button"
                                onClick={() => sendReply(c.id)}
                                disabled={enviando}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2C3E50] text-white text-[10px] font-bold uppercase tracking-[0.2em] disabled:opacity-40"
                              >
                                {enviando ? 'Enviando...' : 'Responder'}
                              </button>
                              <button
                                type="button"
                                onClick={cancelReplying}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 text-[10px] font-bold uppercase tracking-[0.2em]"
                              >
                                <X size={12} /> Cancelar
                              </button>
                            </div>
                          </div>
                        )}
                        {replies.length > 0 && (
                          <div className="space-y-3 mt-4 pl-5 border-l border-black/10">
                            {replies.map((reply) => (
                              <div key={reply.id} className="bg-[#FCFBF7] rounded-3xl p-4 border border-black/5">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: primaryColor }}>{reply.autoraNome}</span>
                                  <span className="text-[8px] opacity-40" style={{ color: primaryColor }}>
                                    {normalizeDateValue(reply.createdAt).toLocaleDateString('pt-BR')}
                                  </span>
                                </div>
                                <p className="text-sm italic leading-relaxed" style={{ color: primaryFaded }}>&quot;{reply.texto}&quot;</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
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
