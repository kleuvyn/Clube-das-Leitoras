"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Trash2, BookOpen, Upload, Calendar, Tag, Quote, 
  PenTool, Loader2, Sparkles, Save, BookMarked, Pencil, X
} from 'lucide-react';

const verdeSalvia = "#B04D4A";
const anoAtual = new Date().getFullYear();

interface LivroItem {
  id: string;
  mes: string | null;
  ano: number | null;
  livro: string | null;
  autora: string | null;
  foto: string | null;
  sinopse: string | null;
  tag: string | null;
}

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

export default function LivroDoMesAdmin() {
  const { isAdmin } = useAdmin();
  const router = useRouter();
  const [rodas, setRodas] = useState<LivroItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletando, setDeletando] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    mes: 'Janeiro',
    ano: String(anoAtual),
    livro: '',
    autora: '',
    sinopse: '',
    tag: 'Futura Leitura',
    foto: '',
  });

  const loadDados = async () => {
    try {
      const res = await fetch('/api/livro-do-mes');
      const data = await res.json();
      setRodas(Array.isArray(data) ? data : []);
    } catch (e) { console.error("Erro ao carregar:", e); }
  };

  useEffect(() => { loadDados(); }, []);

  const resetForm = () => {
    setFormData({ mes: 'Janeiro', ano: String(anoAtual), livro: '', autora: '', sinopse: '', tag: 'Futura Leitura', foto: '' });
    setEditandoId(null);
  };

  const handleEdit = (item: LivroItem) => {
    setFormData({
      mes: item.mes || 'Janeiro',
      ano: String(item.ano || anoAtual),
      livro: item.livro || '',
      autora: item.autora || '',
      sinopse: item.sinopse || '',
      tag: item.tag || 'Futura Leitura',
      foto: item.foto || '',
    });
    setEditandoId(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async () => {
    if (!formData.livro || !formData.autora) {
      return toast.error('Livro e Autora são obrigatórios!');
    }
    setLoading(true);
    try {
      const payload = { ...formData, ano: Number(formData.ano) };
      let res: Response;

      if (editandoId) {
        res = await fetch(`/api/livro-do-mes?id=${editandoId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/livro-do-mes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || 'Erro desconhecido');
      }
      toast.success(editandoId ? 'Leitura atualizada!' : 'Leitura publicada!');
      const wasEditing = !!editandoId;
      resetForm();
      loadDados();
      if (!wasEditing) router.push('/admin/resenhas');
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao salvar.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover esta leitura do calendário?')) return;
    setDeletando(id);
    try {
      const res = await fetch(`/api/livro-do-mes?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || 'Erro ao remover');
      }
      toast.success('Removido!');
      if (editandoId === id) resetForm();
      loadDados();
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao remover.');
    } finally {
      setDeletando(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20 font-alice">
      
      <header className="flex justify-between items-center border-b pb-6" style={{ borderColor: `${verdeSalvia}30` }}>
        <div>
          <h1 className="font-serif text-4xl italic text-slate-900">
            Calendário <span style={{ color: verdeSalvia }}>Literário</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">
            {editandoId ? 'Editando leitura existente' : 'Adicionar nova leitura ao calendário'}
          </p>
        </div>
        {editandoId && (
          <button onClick={resetForm} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-colors">
            <X size={14}/> Cancelar edição
          </button>
        )}
      </header>

      
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-2 mb-2">
              <Sparkles size={14} style={{ color: verdeSalvia }} />
              {editandoId ? 'Editando Leitura' : 'Nova Leitura'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Mês</label>
                <select
                  value={formData.mes}
                  onChange={e => setFormData({...formData, mes: e.target.value})}
                  className="w-full p-4 bg-slate-50 rounded-2xl text-sm outline-none appearance-none cursor-pointer"
                >
                  {MESES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Ano</label>
                <input
                  type="number"
                  value={formData.ano}
                  onChange={e => setFormData({...formData, ano: e.target.value})}
                  placeholder={String(anoAtual)}
                  className="w-full p-4 bg-slate-50 rounded-2xl text-sm outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Tag / Categoria</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-4 text-slate-300" size={16} />
                  <input
                    value={formData.tag}
                    onChange={e => setFormData({...formData, tag: e.target.value})}
                    placeholder="Ex: Futura Leitura"
                    className="w-full pl-12 p-4 bg-slate-50 rounded-2xl text-sm outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Título do Livro</label>
                <input
                  value={formData.livro}
                  onChange={e => setFormData({...formData, livro: e.target.value})}
                  className="w-full p-4 bg-slate-50 rounded-2xl text-sm outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Autora</label>
                <input
                  value={formData.autora}
                  onChange={e => setFormData({...formData, autora: e.target.value})}
                  className="w-full p-4 bg-slate-50 rounded-2xl text-sm outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 flex items-center gap-2">
                <Quote size={12} style={{ color: verdeSalvia }} /> Sinopse Editorial
              </label>
              <textarea
                value={formData.sinopse}
                onChange={e => setFormData({...formData, sinopse: e.target.value})}
                rows={3}
                className="w-full p-5 bg-slate-50 rounded-4xl text-sm outline-none resize-none italic"
              />
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6 text-center">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Capa da Obra</h3>
            
            <div onClick={() => fileInputRef.current?.click()} className="relative group mx-auto w-32 aspect-3/4 cursor-pointer">
              <div className="absolute inset-0 border-2 border-dashed border-slate-100 rounded-2xl group-hover:border-[#93A37F] transition-all flex items-center justify-center overflow-hidden bg-slate-50 shadow-inner">
                {formData.foto ? (
                  <img src={formData.foto} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <div className="text-center space-y-2 opacity-30">
                    <BookOpen className="mx-auto" size={28} />
                    <p className="text-[9px] font-bold uppercase tracking-tighter">Subir Capa</p>
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setFormData({...formData, foto: reader.result as string});
                  reader.readAsDataURL(file);
                }
              }} />
            </div>

            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full h-16 rounded-4xl text-white font-bold uppercase text-[10px] tracking-[0.3em] shadow-xl hover:scale-105 transition-all border-none"
              style={{ backgroundColor: verdeSalvia }}
            >
              {loading ? <Loader2 className="animate-spin" /> : <><Save size={16} className="mr-2" /> {editandoId ? 'Salvar' : 'Publicar'}</>}
            </Button>
          </div>

          <div className="p-6 bg-[#FDFBF9] rounded-[2.5rem] border border-slate-100 flex items-center gap-4">
            <BookMarked className="text-slate-300 shrink-0" size={20} />
            <p className="text-[10px] text-slate-400 italic leading-tight">
              Após publicar, você será redirecionada para o painel de resenhas.
            </p>
          </div>
        </aside>
      </section>

      <hr className="border-slate-100" />

      
      <section className="space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4 flex items-center gap-2">
          <Calendar size={14} /> Calendário ({rodas.length})
        </h3>
        
        <div className="grid grid-cols-1 gap-4">
          {rodas.length === 0 ? (
            <div className="py-20 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-[3rem]">
              <p className="text-slate-400 font-serif italic text-lg">O calendário ainda está vazio.</p>
            </div>
          ) : (
            rodas.map((item) => (
              <div key={item.id} className={`bg-white p-6 rounded-[2.5rem] border flex items-center gap-8 group hover:shadow-md transition-all ${editandoId === item.id ? 'border-[#93A37F]/40 shadow-sm' : 'border-slate-100'}`}>
                <div className="w-20 text-center border-r border-slate-50 pr-6 shrink-0">
                  <span className="text-[10px] font-black uppercase text-slate-300 block tracking-widest">{(item.mes ?? '').substring(0, 3)}</span>
                  <span className="text-2xl font-serif italic" style={{ color: verdeSalvia }}>{item.ano ?? anoAtual}</span>
                </div>
                
                <div className="w-12 h-16 bg-slate-50 rounded-lg overflow-hidden shrink-0 shadow-inner border border-slate-50">
                  {item.foto
                    ? <img src={item.foto} className="w-full h-full object-cover" alt="" />
                    : <div className="flex items-center justify-center h-full"><PenTool size={14} className="opacity-10" /></div>
                  }
                </div>

                <div className="flex-1 min-w-0">
                  {item.tag && (
                    <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mb-1 inline-block" style={{ backgroundColor: `${verdeSalvia}15`, color: verdeSalvia }}>{item.tag}</span>
                  )}
                  <h3 className="font-serif text-xl italic text-slate-900 truncate leading-none">{item.livro}</h3>
                  <p className="text-[11px] text-slate-400 truncate font-medium mt-1">Por {item.autora}</p>
                </div>

                {isAdmin && (
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-3 text-slate-300 hover:text-[#93A37F] transition-colors"
                    title="Editar"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletando === item.id}
                    className="p-3 text-slate-300 hover:text-rose-400 transition-colors disabled:opacity-40"
                    title="Remover"
                  >
                    {deletando === item.id ? <Loader2 size={16} className="animate-spin"/> : <Trash2 size={16} />}
                  </button>
                </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
