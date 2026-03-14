"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { uploadFile } from '@/lib/upload-client';
import {
  Trash2, ShieldCheck, MessageCircle, AlertCircle,
  BookMarked, Loader2, CheckCircle2, ShieldAlert, Save,
  Plus, Star, ChevronDown, ChevronUp, Image as ImageIcon, X, Edit3, BookOpen,
  Filter, AlertTriangle, MessageSquare,
} from 'lucide-react';
import { analyzeContentModeration } from '@/lib/content-moderation';
import { useAdmin } from '@/lib/admin-context';

const azulLogo = "var(--page-color)";

function ModerationBadge({ texto, nome }: { texto: string; nome: string }) {
  const r = analyzeContentModeration(`${nome} ${texto}`);
  if (r.blocked) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[9px] font-bold uppercase tracking-wider">
      <ShieldAlert size={10} /> Bloqueado
    </span>
  );
  if (r.score > 0) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[9px] font-bold uppercase tracking-wider">
      <AlertTriangle size={10} /> Suspeito
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase tracking-wider">
      <ShieldCheck size={10} /> Ok
    </span>
  );
}

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
  livroDoMesId: string | null;
  autoraNome: string;
  autoraEmail: string | null;
  texto: string;
  createdAt: string;
}

const formVazio = { title: '', book: '', author: '', content: '', rating: 5, imageUrl: '', publishedAt: '' };

export default function ResenhasAdmin() {
  const { isAdmin } = useAdmin();
  const [resenhas, setResenhas] = useState<Resenha[]>([]);
  const [loadingResenhas, setLoadingResenhas] = useState(true);
  const [salvandoResenha, setSalvandoResenha] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [resenhaAberta, setResenhaAberta] = useState<string | null>(null);
  const [form, setForm] = useState(formVazio);
  const [uploadingImg, setUploadingImg] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);

  
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loadingComent, setLoadingComent] = useState(true);
  const [filtroMod, setFiltroMod] = useState<'todos' | 'suspeitos'>('todos');

  
  const [extras, setExtras] = useState<string[]>([]);
  const [novaPalavra, setNovaPalavra] = useState('');
  const [savingFilter, setSavingFilter] = useState(false);
  const [termsBase, setTermsBase] = useState<string[]>([]);

  
  const loadResenhas = async () => {
    setLoadingResenhas(true);
    try {
      const res = await fetch('/api/resenhas');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResenhas(Array.isArray(data) ? data : []);
    } catch { toast.error('Erro ao carregar resenhas.'); }
    finally { setLoadingResenhas(false); }
  };

  const loadComentarios = useCallback(async () => {
    setLoadingComent(true);
    try {
      const [comentRes, filtroRes] = await Promise.all([
        fetch('/api/comentarios'),
        fetch('/api/admin/moderacao'),
      ]);
      if (comentRes.ok) setComentarios(await comentRes.json());
      if (filtroRes.ok) {
        const fData = await filtroRes.json();
        setExtras(fData.extras ?? []);
        setTermsBase(fData.termsBase ?? []);
      }
    } catch (e) { console.error(e); }
    finally { setLoadingComent(false); }
  }, []);

  useEffect(() => { loadResenhas(); loadComentarios(); }, [loadComentarios]);

  
  const handleUploadImg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const url = await uploadFile(file);
      setForm(prev => ({ ...prev, imageUrl: url }));
    } catch (err: any) {
      toast.error(err.message || 'Erro ao subir imagem.');
    } finally {
      setUploadingImg(false);
    }
  };

  
  const handleSalvarResenha = async () => {
    if (!form.title || !form.content) return toast.error('Título e conteúdo são obrigatórios.');
    setSalvandoResenha(true);
    try {
      const url = editandoId ? `/api/resenhas?id=${editandoId}` : '/api/resenhas';
      const method = editandoId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      toast.success(editandoId ? 'Resenha atualizada!' : 'Resenha publicada!');
      setForm(formVazio);
      setEditandoId(null);
      loadResenhas();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar resenha.');
    } finally { setSalvandoResenha(false); }
  };

  const handleEditarResenha = (r: Resenha) => {
    setEditandoId(r.id);
    setForm({ title: r.title, book: r.book ?? '', author: r.author ?? '', content: r.content ?? '', rating: r.rating ?? 5, imageUrl: r.imageUrl ?? '', publishedAt: r.publishedAt ?? '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletarResenha = async (id: string) => {
    if (!confirm('Remover esta resenha permanentemente?')) return;
    try {
      const res = await fetch(`/api/resenhas?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Resenha removida!');
      setResenhas(prev => prev.filter(r => r.id !== id));
    } catch { toast.error('Erro ao remover.'); }
  };

  
  const handleAddPalavra = () => {
    const p = novaPalavra.trim().toLowerCase();
    if (!p || extras.includes(p)) return;
    setExtras(prev => [...prev, p]);
    setNovaPalavra('');
  };

  const handleRemovePalavra = (p: string) => {
    setExtras(prev => prev.filter(e => e !== p));
  };

  const handleSaveFiltro = async () => {
    setSavingFilter(true);
    try {
      const res = await fetch('/api/admin/moderacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extras }),
      });
      if (!res.ok) throw new Error();
      toast.success('Filtro de palavras salvo!');
    } catch { toast.error('Erro ao salvar o filtro.'); }
    finally { setSavingFilter(false); }
  };

  const handleDeletarComentario = async (id: string) => {
    if (!confirm('Remover este comentário?')) return;
    try {
      const res = await fetch(`/api/comentarios?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Comentário removido!');
      setComentarios(prev => prev.filter(c => c.id !== id));
    } catch { toast.error('Erro ao remover.'); }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-16 animate-in fade-in duration-500 pb-20 font-alice text-slate-900">

      
      <section className="space-y-8">
        <header className="flex items-center justify-between border-b pb-6" style={{ borderColor: `${azulLogo}20` }}>
          <div>
            <h1 className="font-serif text-4xl italic">
              {editandoId ? 'Editando' : 'Nova'} <span style={{ color: azulLogo }} className="not-italic">Resenha</span>
            </h1>
            <p className="text-slate-500 mt-1 italic">Escreva a resenha oficial do livro do mês.</p>
          </div>
          {editandoId && (
            <button onClick={() => { setEditandoId(null); setForm(formVazio); }} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-rose-400 transition-colors">
              <X size={14} /> Cancelar edição
            </button>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Título da Resenha *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ex: Uma Viagem Necessária" className="w-full p-4 bg-slate-50 rounded-2xl text-sm outline-none border border-slate-100" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nome do Livro</label>
                <input value={form.book} onChange={e => setForm({ ...form, book: e.target.value })} placeholder="Ex: A Cor Púrpura" className="w-full p-4 bg-slate-50 rounded-2xl text-sm outline-none border border-slate-100" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Autora / Autor</label>
                <input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} placeholder="Ex: Alice Walker" className="w-full p-4 bg-slate-50 rounded-2xl text-sm outline-none border border-slate-100" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Período / Mês</label>
                <input value={form.publishedAt} onChange={e => setForm({ ...form, publishedAt: e.target.value })} placeholder="Ex: Março de 2026" className="w-full p-4 bg-slate-50 rounded-2xl text-sm outline-none border border-slate-100" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Resenha Completa *</label>
              <textarea
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                placeholder="Escreva aqui a resenha do livro do mês..."
                rows={10}
                className="w-full p-5 bg-slate-50 rounded-3xl text-sm outline-none resize-none border border-slate-100 leading-relaxed"
              />
            </div>
          </div>

          
          <div className="space-y-5">
            
            <div
              onClick={() => imgRef.current?.click()}
              className="cursor-pointer bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 hover:border-(--page-color) transition-all group min-h-45 flex items-center justify-center overflow-hidden relative"
            >
              {form.imageUrl ? (
                <>
                  <img src={form.imageUrl} alt="Capa" className="w-full h-full object-cover absolute inset-0 opacity-40" />
                  <button onClick={e => { e.stopPropagation(); setForm(p => ({ ...p, imageUrl: '' })); }} className="absolute top-3 right-3 bg-white rounded-full p-1 shadow z-10">
                    <X size={13} className="text-slate-400" />
                  </button>
                  <span className="relative z-10 text-[10px] font-bold uppercase tracking-widest text-slate-600">Trocar Imagem</span>
                </>
              ) : (
                <div className="text-center space-y-2 p-6">
                  {uploadingImg ? <Loader2 className="animate-spin mx-auto" style={{ color: azulLogo }} /> : <ImageIcon className="mx-auto text-slate-200 group-hover:text-slate-400" size={26} />}
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Imagem da Resenha</p>
                </div>
              )}
              <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleUploadImg} />
            </div>

            
            <div className="bg-white rounded-3xl border border-slate-100 p-5 space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nota ({form.rating}/5)</label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setForm({ ...form, rating: n })} className="transition-transform hover:scale-125">
                    <Star size={24} fill={n <= form.rating ? azulLogo : 'none'} stroke={azulLogo} strokeWidth={1.5} style={{ color: azulLogo }} />
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSalvarResenha}
              disabled={salvandoResenha}
              className="w-full h-14 rounded-2xl text-white font-bold uppercase text-[10px] tracking-widest shadow-lg hover:scale-[1.02] transition-all"
              style={{ backgroundColor: azulLogo }}
            >
              {salvandoResenha ? <Loader2 size={16} className="animate-spin" /> : <><Save size={15} className="mr-2" />{editandoId ? 'Salvar Alterações' : 'Publicar Resenha'}</>}
            </Button>
          </div>
        </div>

        
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-3 px-1">
            <BookOpen size={16} style={{ color: azulLogo }} />
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Resenhas Publicadas</h2>
          </div>

          {loadingResenhas ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-slate-200" size={32} /></div>
          ) : resenhas.length === 0 ? (
            <div className="py-16 text-center rounded-[3rem] border border-dashed border-slate-200 bg-slate-50/50 space-y-3">
              <BookMarked size={32} className="mx-auto text-slate-200" />
              <p className="text-slate-400 italic">Nenhuma resenha publicada ainda.</p>
            </div>
          ) : (
            resenhas.map(r => (
              <div key={r.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                
                <div className="flex gap-4 p-6 items-start">
                  {r.imageUrl && (
                    <img src={r.imageUrl} alt={r.book ?? ''} className="w-14 h-14 rounded-2xl object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 italic text-lg leading-tight">{r.title}</p>
                    {r.book && <p className="text-[11px] text-slate-400 mt-0.5">{r.book}{r.author ? ` · ${r.author}` : ''}</p>}
                    {r.rating && (
                      <div className="flex gap-0.5 mt-1">
                        {[1,2,3,4,5].map(n => <Star key={n} size={11} fill={n <= r.rating! ? azulLogo : 'none'} stroke={azulLogo} style={{ color: azulLogo }} />)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setResenhaAberta(resenhaAberta === r.id ? null : r.id)}
                      className="p-2 text-slate-300 hover:text-slate-600 transition-colors"
                      title="Abrir resenha"
                    >
                      {resenhaAberta === r.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    {isAdmin && (<>
                    <button onClick={() => handleEditarResenha(r)} className="p-2 text-slate-300 hover:text-blue-400 transition-colors" title="Editar">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => handleDeletarResenha(r.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors" title="Remover">
                      <Trash2 size={16} />
                    </button>
                    </>)}
                  </div>
                </div>

                
                {resenhaAberta === r.id && (
                  <div className="px-6 pb-8 pt-2 border-t border-slate-50 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-sm text-slate-600 leading-relaxed italic whitespace-pre-wrap">{r.content}</p>
                    <p className="text-[9px] text-slate-300 uppercase tracking-widest mt-6">
                      Publicado em {new Date(r.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      
      <div className="border-t border-slate-100" />

      
      <section className="space-y-6">
        <header className="flex items-center justify-between border-t pt-8" style={{ borderColor: 'var(--page-color-20)' }}>
          <div>
            <h2 className="font-serif text-3xl italic">
              Bate-Papo das <span style={{ color: azulLogo }} className="not-italic">Leitoras</span>
            </h2>
            <p className="text-slate-500 mt-1 italic text-sm">Modere os comentários e configure o filtro de palavras.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">

            
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5">
              {(() => {
                const suspeitos = comentarios.filter(c => analyzeContentModeration(`${c.autoraNome} ${c.texto}`).score > 0);
                const filtrados = filtroMod === 'suspeitos' ? suspeitos : comentarios;
                return (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                        <MessageSquare size={14} style={{ color: azulLogo }} /> Comentários
                        <span className="ml-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-500">{comentarios.length}</span>
                      </h3>
                      <div className="flex gap-2">
                        <button onClick={() => setFiltroMod('todos')} className={`px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all ${filtroMod === 'todos' ? 'text-white' : 'bg-slate-50 text-slate-400'}`} style={filtroMod === 'todos' ? { backgroundColor: azulLogo } : {}}>Todos</button>
                        <button onClick={() => setFiltroMod('suspeitos')} className={`px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${filtroMod === 'suspeitos' ? 'bg-amber-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
                          <AlertTriangle size={10} /> Suspeitos {suspeitos.length > 0 && <span className="bg-white/30 rounded-full px-1">{suspeitos.length}</span>}
                        </button>
                      </div>
                    </div>

                    {loadingComent ? (
                      <div className="flex justify-center py-8"><Loader2 className="animate-spin text-slate-200" size={24} /></div>
                    ) : filtrados.length === 0 ? (
                      <div className="py-10 text-center">
                        <MessageCircle size={28} className="mx-auto mb-3 text-slate-100" />
                        <p className="text-slate-300 italic text-sm">{filtroMod === 'suspeitos' ? 'Nenhum comentário suspeito.' : 'Nenhum comentário ainda.'}</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                        {filtrados.map(c => (
                          <div key={c.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-sm font-bold shrink-0" style={{ color: azulLogo }}>
                              {c.autoraNome.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-[10px] font-black text-slate-600 uppercase">{c.autoraNome}</span>
                                <ModerationBadge texto={c.texto} nome={c.autoraNome} />
                                <span className="text-[9px] text-slate-300 ml-auto">{new Date(c.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                              </div>
                              <p className="text-[11px] italic text-slate-600 leading-relaxed">"{c.texto}"</p>
                            </div>
                            <button onClick={() => handleDeletarComentario(c.id)} className="opacity-0 group-hover:opacity-100 text-slate-200 hover:text-rose-400 transition-all p-1 shrink-0">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                  <Filter size={14} style={{ color: azulLogo }} /> Filtro de Palavras Ofensivas
                </h3>
                <Button onClick={handleSaveFiltro} disabled={savingFilter} className="h-9 px-5 rounded-xl text-white text-[10px] font-bold uppercase tracking-wider border-none" style={{ backgroundColor: azulLogo }}>
                  {savingFilter ? <Loader2 size={12} className="animate-spin" /> : <><Save size={11} className="mr-1.5" /> Salvar Filtro</>}
                </Button>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Lista padrão do sistema ({termsBase.length} termos)</p>
                <div className="flex flex-wrap gap-2">
                  {termsBase.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-400 text-[9px] font-mono">{t}</span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Palavras extras personalizadas</p>
                <div className="flex gap-2">
                  <input
                    value={novaPalavra}
                    onChange={e => setNovaPalavra(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddPalavra()}
                    placeholder="Digite uma palavra e pressione Enter..."
                    className="flex-1 p-3 bg-slate-50 rounded-xl text-sm outline-none border border-slate-100"
                  />
                  <button onClick={handleAddPalavra} className="p-3 rounded-xl text-white" style={{ backgroundColor: azulLogo }}>
                    <Plus size={16} />
                  </button>
                </div>
                {extras.length === 0 ? (
                  <p className="text-[10px] text-slate-300 italic text-center py-2">Nenhuma palavra extra configurada.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {extras.map(p => (
                      <span key={p} className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 text-rose-600 text-[10px] font-bold border border-rose-100">
                        {p}
                        <button onClick={() => handleRemovePalavra(p)} className="hover:text-rose-800 transition-colors"><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          
          <aside className="space-y-6">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm sticky top-8 space-y-6">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
                <CheckCircle2 className="text-emerald-600 shrink-0" size={18} />
                <p className="text-[10px] text-emerald-800 italic leading-relaxed font-medium">
                  <strong>Automação:</strong> Comentários bloqueados pelo filtro nunca chegam ao banco de dados.
                </p>
              </div>
              <div className="p-4 rounded-2xl border space-y-3" style={{ background: 'var(--page-color-05)', borderColor: 'var(--page-color-20)' }}>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Resumo da Moderação</p>
                {(() => {
                  const suspeitos = comentarios.filter(c => analyzeContentModeration(`${c.autoraNome} ${c.texto}`).score > 0);
                  return (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400 text-[11px]">Total de comentários</span>
                        <span className="font-bold text-slate-700">{comentarios.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400 text-[11px]">Suspeitos</span>
                        <span className={`font-bold ${suspeitos.length > 0 ? 'text-amber-500' : 'text-slate-300'}`}>{suspeitos.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400 text-[11px]">Palavras no filtro</span>
                        <span className="font-bold text-slate-700">{extras.length} extras</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </aside>
        </div>

        <footer className="text-center pt-2">
          <div className="inline-flex items-center gap-2 px-5 py-3 bg-[#F8FAFC] rounded-full border border-slate-100">
            <AlertCircle size={13} className="text-slate-300" />
            <p className="text-[10px] text-slate-400 italic">Comentários bloqueados pelo filtro automático nunca chegam ao banco.</p>
          </div>
        </footer>
      </section>
    </div>
  );
}
