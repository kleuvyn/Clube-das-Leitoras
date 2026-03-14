"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { uploadFile } from '@/lib/upload-client';
import { 
  Laptop, 
  Calendar as CalendarIcon,
  Clock,
  Link2, 
  BookOpen, 
  Save, 
  Loader2, 
  Globe, 
  MailCheck, 
  UploadCloud,
  X,
  MessageSquare,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  Plus,
  Filter,
  Pencil,
  AlertTriangle,
  History,
  RotateCcw,
  Archive,
  CheckCircle2,
  Youtube,
  FolderOpen,
} from 'lucide-react';
import { analyzeContentModeration } from '@/lib/content-moderation';

const azulSereno = "var(--page-color)";

interface Reflexao {
  id: string;
  autoraNome: string;
  autoraEmail?: string | null;
  texto: string;
  createdAt: string;
}

interface RodaItem {
  id: string;
  title: string;
  book: string | null;
  author: string | null;
  date: string | null;
  imageUrl: string | null;
  videoUrl?: string | null;
  linkDrive?: string | null;
  status: string;
  createdAt: string;
}

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

export default function RodaOnlineAdmin() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [rodaAtivaId, setRodaAtivaId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  
  const [reflexoes, setReflexoes] = useState<Reflexao[]>([]);
  const [loadingRef, setLoadingRef] = useState(true);
  const [filtroAtivo, setFiltroAtivo] = useState<'todos' | 'suspeitos'>('todos');

  
  const [historico, setHistorico] = useState<RodaItem[]>([]);

  
  const [extras, setExtras] = useState<string[]>([]);
  const [removedBase, setRemovedBase] = useState<string[]>([]);
  const [novaPalavra, setNovaPalavra] = useState('');
  const [savingFilter, setSavingFilter] = useState(false);
  const [termsBase, setTermsBase] = useState<string[]>([]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      setFormData(prev => ({ ...prev, imageUrl: url }));
      toast.success('Imagem enviada!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar imagem.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  
  const [formData, setFormData] = useState({
    title: '',
    book: '',
    author: '',
    description: '',
    link: '',
    videoUrl: '',
    linkDrive: '',
    date: '',
    time: '',
    imageUrl: '', 
    status: 'ativo'
  });

  const loadReflexoes = useCallback(async () => {
    setLoadingRef(true);
    try {
      const res = await fetch('/api/rodaonline/reflexoes');
      const data = await res.json();
      setReflexoes(Array.isArray(data) ? data : []);
    } catch {} finally {
      setLoadingRef(false);
    }
  }, []);

  const loadFiltro = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/moderacao');
      if (!res.ok) return;
      const data = await res.json();
      setExtras(data.extras ?? []);
      setTermsBase(data.termsBase ?? []);
      setRemovedBase(data.removedBase ?? []);
    } catch {}
  }, []);

  useEffect(() => {
    const loadRoda = async () => {
      try {
        const res = await fetch('/api/rodaonline');
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          const ativa = data.find((r: any) => r.status === 'ativo');
          if (ativa) {
            setRodaAtivaId(ativa.id);
            const dt = ativa.date ? new Date(ativa.date) : null;
            setFormData({
              title: ativa.title || '',
              book: ativa.book || '',
              author: ativa.author || '',
              description: ativa.description || '',
              link: ativa.link || '',
              videoUrl: ativa.videoUrl || '',
              linkDrive: ativa.linkDrive || '',
              date: dt ? dt.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-') : '',
              time: dt ? dt.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', hour12: false }) : '',
              imageUrl: ativa.imageUrl || '',
              status: ativa.status || 'ativo'
            });
          }
          setHistorico(data.filter((r: any) => r.status !== 'ativo'));
        }
      } catch (err) {
        toast.error("Erro ao carregar dados da Roda.");
      } finally {
        setFetching(false);
      }
    };
    loadRoda();
    loadReflexoes();
    loadFiltro();
  }, [loadReflexoes, loadFiltro]);

  const handleSave = async () => {
    if (!formData.title) {
      return toast.error("O título é obrigatório.");
    }
    setLoading(true);
    try {
      const url = rodaAtivaId ? `/api/rodaonline?id=${rodaAtivaId}` : '/api/rodaonline';
      const method = rodaAtivaId ? 'PATCH' : 'POST';
      const dateValue = formData.date
        ? (formData.time ? `${formData.date}T${formData.time}:00-03:00` : `${formData.date}T00:00:00-03:00`)
        : null;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, date: dateValue, livroCapa: formData.imageUrl }),
      });
      if (!res.ok) throw new Error();
      toast.success(rodaAtivaId ? "Edição atualizada!" : "Nova Roda publicada!");
      if (method === 'POST') {
        const novo = await res.json();
        setRodaAtivaId(novo.id);
      }
    } catch {
      toast.error("Erro ao salvar no banco de dados.");
    } finally {
      setLoading(false);
    }
  };

  const handleEncerrarRoda = async () => {
    if (!rodaAtivaId) return;
    if (!confirm('Encerrar a roda ativa atual? Ela ficará no histórico.')) return;
    try {
      const res = await fetch(`/api/rodaonline?id=${rodaAtivaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'encerrado' }),
      });
      if (!res.ok) throw new Error();
      toast.success('Roda encerrada e movida para o histórico.');
      setHistorico(prev => [{ id: rodaAtivaId, title: formData.title, book: formData.book, author: formData.author, date: formData.date, imageUrl: formData.imageUrl, videoUrl: formData.videoUrl, linkDrive: formData.linkDrive, status: 'encerrado', createdAt: new Date().toISOString() }, ...prev]);
      setRodaAtivaId(null);
      setFormData({ title: '', book: '', author: '', description: '', link: '', videoUrl: '', linkDrive: '', date: '', time: '', imageUrl: '', status: 'ativo' });
    } catch {
      toast.error('Erro ao encerrar roda.');
    }
  };

  const handleReativarRoda = async (roda: RodaItem) => {
    if (!confirm(`Reativar "${roda.title}"? A roda atual será encerrada.`)) return;
    try {
      if (rodaAtivaId) {
        await fetch(`/api/rodaonline?id=${rodaAtivaId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'encerrado' }),
        });
      }
      const res = await fetch(`/api/rodaonline?id=${roda.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ativo' }),
      });
      if (!res.ok) throw new Error();
      toast.success(`"${roda.title}" reativada!`);
      setRodaAtivaId(roda.id);
      setFormData({
        title: roda.title,
        book: roda.book || '',
        author: roda.author || '',
        description: '',
        link: '',
        videoUrl: '',
        linkDrive: '',
        date: roda.date ? new Date(roda.date).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-') : '',
        time: roda.date ? new Date(roda.date).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', hour12: false }) : '',
        imageUrl: roda.imageUrl || '',
        status: 'ativo',
      });
      setHistorico(prev => prev.filter(r => r.id !== roda.id));
    } catch {
      toast.error('Erro ao reativar roda.');
    }
  };

  const handleExcluirRoda = async (id: string, title: string) => {
    if (!confirm(`Excluir permanentemente "${title}"?`)) return;
    try {
      const res = await fetch(`/api/rodaonline?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Roda excluída.');
      setHistorico(prev => prev.filter(r => r.id !== id));
    } catch {
      toast.error('Erro ao excluir.');
    }
  };

  const handleDeleteReflexao = async (id: string) => {
    try {
      const res = await fetch(`/api/rodaonline/reflexoes?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Mensagem removida.');
      setReflexoes(prev => prev.filter(r => r.id !== id));
    } catch {
      toast.error('Erro ao remover.');
    }
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

  const handleEditPalavra = (p: string) => {
    setNovaPalavra(p);
    setExtras(prev => prev.filter(e => e !== p));
  };

  const handleRemoveBaseTerm = (t: string) => setRemovedBase(prev => [...prev, t]);
  const handleRestoreBaseTerm = (t: string) => setRemovedBase(prev => prev.filter(b => b !== t));

  const handleSaveFiltro = async () => {
    setSavingFilter(true);
    try {
      const res = await fetch('/api/admin/moderacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extras, removedBase }),
      });
      if (!res.ok) throw new Error();
      toast.success('Filtro de palavras salvo!');
    } catch {
      toast.error('Erro ao salvar o filtro.');
    } finally {
      setSavingFilter(false);
    }
  };

  const reflexoesFiltradas = filtroAtivo === 'suspeitos'
    ? reflexoes.filter(r => analyzeContentModeration(`${r.autoraNome} ${r.texto}`).score > 0)
    : reflexoes;

  const suspeitos = reflexoes.filter(r => analyzeContentModeration(`${r.autoraNome} ${r.texto}`).score > 0);

  if (fetching) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="animate-spin text-slate-300" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 font-alice">
      <header className="flex justify-between items-center border-b pb-6" style={{ borderColor: 'var(--page-color-20)' }}>
        <div>
          <h1 className="font-serif text-3xl italic text-slate-900">
            Painel: <span style={{ color: azulSereno }}>Roda On-line</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">Configure o encontro digital e modere o bate-papo das leitoras.</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
              <Globe size={14} /> {rodaAtivaId ? 'Editando Ativa' : 'Nova Publicação'}
            </div>
            {rodaAtivaId && (
              <button onClick={handleEncerrarRoda} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all">
                <Archive size={14} /> Encerrar
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
              <BookOpen size={14} style={{ color: azulSereno }} /> Curadoria do Encontro
            </h3>
            <div className="space-y-4">
              {/* Campos essenciais */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 tracking-widest">Título da Edição <span className="text-rose-400">*</span></label>
                <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl text-sm outline-none" placeholder="ex: Roda Online — Abril 2026" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Data do Encontro</label>
                  <div className="relative"><CalendarIcon className="absolute left-4 top-4 text-slate-300" size={16} /><input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full pl-12 p-4 bg-slate-50 rounded-2xl text-sm outline-none" /></div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Hora do Encontro</label>
                  <div className="relative"><Clock className="absolute left-4 top-4 text-slate-300" size={16} /><input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full pl-12 p-4 bg-slate-50 rounded-2xl text-sm outline-none" /></div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Link Google Meet</label>
                <div className="relative"><Link2 className="absolute left-4 top-4 text-slate-300" size={16} /><input value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className="w-full pl-12 p-4 bg-slate-50 rounded-2xl text-sm outline-none" placeholder="meet.google.com/..." /></div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Link da Live / Gravação</label>
                <div className="relative"><Youtube className="absolute left-4 top-4 text-slate-300" size={16} /><input value={formData.videoUrl} onChange={e => setFormData({...formData, videoUrl: e.target.value})} className="w-full pl-12 p-4 bg-slate-50 rounded-2xl text-sm outline-none" placeholder="youtube.com/watch?v=..." /></div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Link do Material / Drive</label>
                <div className="relative"><FolderOpen className="absolute left-4 top-4 text-slate-300" size={16} /><input value={formData.linkDrive} onChange={e => setFormData({...formData, linkDrive: e.target.value})} className="w-full pl-12 p-4 bg-slate-50 rounded-2xl text-sm outline-none" placeholder="drive.google.com/..." /></div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Capa ou Foto da Roda</label>
                <div onClick={() => !uploading && fileInputRef.current?.click()} className="relative group w-full aspect-3/2 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-all" style={{ borderColor: 'var(--page-color-30)' }}>
                  {uploading ? (
                    <Loader2 className="animate-spin" size={28} style={{ color: azulSereno }} />
                  ) : formData.imageUrl ? (
                    <>
                      <img src={formData.imageUrl} alt="Capa" className="w-full h-full object-cover" />
                      <button type="button" onClick={e => { e.stopPropagation(); setFormData(prev => ({ ...prev, imageUrl: '' })); }} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><span className="text-white text-[10px] font-bold uppercase tracking-widest">Trocar</span></div>
                    </>
                  ) : (
                    <><UploadCloud size={28} className="text-slate-300 mb-2" /><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clique para enviar</span></>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>

              {/* Divisor */}
              <div className="flex items-center gap-3 pt-2">
                <div className="h-px flex-1 bg-slate-100" />
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Informações extras (opcionais)</span>
                <div className="h-px flex-1 bg-slate-100" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Livro</label>
                  <input value={formData.book} onChange={e => setFormData({...formData, book: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl text-sm outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Autora</label>
                  <input value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl text-sm outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Frase de Destaque</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={2} className="w-full p-4 bg-slate-50 rounded-2xl text-sm outline-none resize-none" />
              </div>
            </div>
          </div>

          
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                <MessageSquare size={14} style={{ color: azulSereno }} /> Bate-Papo das Leitoras
                <span className="ml-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-500">{reflexoes.length}</span>
              </h3>
              <div className="flex gap-2">
                <button onClick={() => setFiltroAtivo('todos')} className={`px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all ${filtroAtivo === 'todos' ? 'text-white' : 'bg-slate-50 text-slate-400'}`} style={filtroAtivo === 'todos' ? { backgroundColor: azulSereno } : {}}>Todos</button>
                <button onClick={() => setFiltroAtivo('suspeitos')} className={`px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${filtroAtivo === 'suspeitos' ? 'bg-amber-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
                  <AlertTriangle size={10} /> Suspeitos {suspeitos.length > 0 && <span className="bg-white/30 rounded-full px-1">{suspeitos.length}</span>}
                </button>
              </div>
            </div>

            {loadingRef ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-slate-200" size={24} /></div>
            ) : reflexoesFiltradas.length === 0 ? (
              <div className="py-10 text-center">
                <MessageSquare size={28} className="mx-auto mb-3 text-slate-100" />
                <p className="text-slate-300 italic text-sm">{filtroAtivo === 'suspeitos' ? 'Nenhuma mensagem suspeita.' : 'Nenhuma mensagem ainda.'}</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {reflexoesFiltradas.map(ref => (
                  <div key={ref.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-sm font-bold shrink-0" style={{ color: azulSereno }}>
                      {ref.autoraNome.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] font-black text-slate-600 uppercase">{ref.autoraNome}</span>
                        <ModerationBadge texto={ref.texto} nome={ref.autoraNome} />
                        <span className="text-[9px] text-slate-300 ml-auto">{new Date(ref.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-[11px] italic text-slate-600 leading-relaxed">"{ref.texto}"</p>
                    </div>
                    <button onClick={() => handleDeleteReflexao(ref.id)} className="text-rose-400 hover:text-rose-600 transition-colors p-1.5 shrink-0 rounded-xl hover:bg-rose-50" title="Remover">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                <Filter size={14} style={{ color: azulSereno }} /> Filtro de Palavras Ofensivas
              </h3>
              <Button onClick={handleSaveFiltro} disabled={savingFilter} className="h-9 px-5 rounded-xl text-white text-[10px] font-bold uppercase tracking-wider border-none" style={{ backgroundColor: azulSereno }}>
                {savingFilter ? <Loader2 size={12} className="animate-spin" /> : <><Save size={11} className="mr-1.5" /> Salvar Filtro</>}
              </Button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Lista padrão do sistema ({termsBase.filter(t => !removedBase.includes(t)).length}/{termsBase.length} ativos)</p>
              <div className="flex flex-wrap gap-2">
                {termsBase.filter(t => !removedBase.includes(t)).map(t => (
                  <span key={t} className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 text-[9px] font-mono">
                    {t}
                    <button onClick={() => handleRemoveBaseTerm(t)} className="hover:text-rose-500 transition-colors ml-1" title="Remover do filtro"><X size={9} /></button>
                  </span>
                ))}
              </div>
              {removedBase.length > 0 && (
                <div className="w-full mt-3 pt-3 border-t border-slate-200">
                  <p className="text-[9px] text-slate-300 mb-2">Removidas do filtro (clique para restaurar):</p>
                  <div className="flex flex-wrap gap-2">
                    {removedBase.map(t => (
                      <span key={t} onClick={() => handleRestoreBaseTerm(t)} className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-50 text-rose-300 text-[9px] font-mono line-through cursor-pointer hover:bg-rose-100 transition-colors">
                        {t} <RotateCcw size={8} />
                      </span>
                    ))}
                  </div>
                </div>
              )}
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
                <button onClick={handleAddPalavra} className="p-3 rounded-xl text-white" style={{ backgroundColor: azulSereno }}>
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
                      <button onClick={() => handleEditPalavra(p)} className="hover:text-rose-800 transition-colors" title="Editar"><Pencil size={10} /></button>
                      <button onClick={() => handleRemovePalavra(p)} className="hover:text-rose-800 transition-colors" title="Remover"><X size={10} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        
        <aside className="space-y-6">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm sticky top-8 space-y-6">
            <Button onClick={handleSave} disabled={loading} className="w-full h-20 rounded-4xl text-white font-bold uppercase text-[10px] tracking-[0.3em] shadow-2xl hover:scale-105 transition-all border-none" style={{ backgroundColor: azulSereno }}>
              {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} className="mr-2" /> Publicar Edição</>}
            </Button>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
              <MailCheck className="text-emerald-600 shrink-0" size={18} />
              <p className="text-[10px] text-emerald-800 italic leading-relaxed font-medium">
                <strong>Automação:</strong> Ao salvar, o convite de calendário para as leitoras será atualizado.
              </p>
            </div>
            <div className="p-4 rounded-2xl border space-y-3" style={{ background: 'var(--page-color-05)', borderColor: 'var(--page-color-20)' }}>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Resumo da Moderação</p>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 text-[11px]">Total de mensagens</span>
                <span className="font-bold text-slate-700">{reflexoes.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 text-[11px]">Suspeitas</span>
                <span className={`font-bold ${suspeitos.length > 0 ? 'text-amber-500' : 'text-slate-300'}`}>{suspeitos.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 text-[11px]">Palavras no filtro</span>
                <span className="font-bold text-slate-700">{extras.length} extras</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
      
      {historico.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-3 border-t pt-8" style={{ borderColor: 'var(--page-color-20)' }}>
            <History size={16} style={{ color: azulSereno }} />
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Histórico de Rodas</h2>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[9px] font-bold">{historico.length}</span>
          </div>
          <div className="flex flex-col gap-2">
            {historico.map(roda => (
              <div key={roda.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 p-3 group">
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-50 shrink-0 flex items-center justify-center">
                  {roda.imageUrl ? (
                    <img src={roda.imageUrl} alt={roda.title} className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen size={20} className="text-slate-200" />
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-slate-700 line-clamp-1">{roda.title}</p>
                  {roda.book && (
                    <p className="text-[9px] text-slate-400 italic line-clamp-1">
                      {roda.book}{roda.author ? ` · ${roda.author}` : ''}
                    </p>
                  )}
                  {roda.date && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <CalendarIcon size={8} className="text-slate-300" />
                      <span className="text-[8px] text-slate-300">
                        {new Date(roda.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                  {/* Links */}
                  {(roda.videoUrl || roda.linkDrive) && (
                    <div className="flex items-center gap-2 mt-1.5">
                      {roda.videoUrl && (
                        <a href={roda.videoUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-400 text-[8px] font-bold hover:bg-rose-100 transition-colors">
                          <Youtube size={8} /> Gravação
                        </a>
                      )}
                      {roda.linkDrive && (
                        <a href={roda.linkDrive} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-400 text-[8px] font-bold hover:bg-sky-100 transition-colors">
                          <FolderOpen size={8} /> Material
                        </a>
                      )}
                    </div>
                  )}
                </div>
                {/* Badge + Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="hidden sm:inline px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 text-[8px] font-bold uppercase tracking-wider">
                    Encerrada
                  </span>
                  <button
                    onClick={() => handleReativarRoda(roda)}
                    title="Reativar"
                    className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-50 text-slate-500 text-[8px] font-bold uppercase hover:bg-slate-100 transition-colors"
                  >
                    <RotateCcw size={9} />
                    <span className="hidden sm:inline">Reativar</span>
                  </button>
                  <button
                    onClick={() => handleExcluirRoda(roda.id, roda.title)}
                    title="Excluir"
                    className="flex items-center justify-center w-7 h-7 rounded-xl bg-rose-50 text-rose-400 hover:bg-rose-100 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 size={9} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
