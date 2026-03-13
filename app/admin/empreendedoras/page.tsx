"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Trash2, Instagram, Heart, Store, 
  User, Tag, Sparkles, Save, ImageIcon, Loader2, Pencil, X
} from 'lucide-react';

const lavandaPrincipal = "var(--page-color)";

const CATEGORIAS = [
  'Bordado', 'Arte', 'Papelaria', 'Bem-estar', 'Moda',
  'Acessórios', 'Gastronomia', 'Crochê', 'Costura', 'Bijuteria',
  'Plantas', 'Decoração', 'Fotografia', 'Consultoria', 'Tecnologia',
  'Educação', 'Saúde', 'Beleza', 'Joias', 'Outro'
];

const FORM_VAZIO = { negocio: '', nome: '', frase: '', categoria: 'Bordado', instagram: '', fotoUrl: '' };

export default function EmpreendedorasAdmin() {
  const [lista, setLista] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState(FORM_VAZIO);

  const loadDados = async () => {
    try {
      const res = await fetch('/api/empreendedoras');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLista(Array.isArray(data) ? data : []);
    } catch (e) { console.error("Erro ao carregar:", e); }
  };

  useEffect(() => { loadDados(); }, []);

  const uploadFoto = async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    return data.url ?? null;
  };

  const handleSave = async () => {
    if (!formData.negocio || !formData.nome) {
      return toast.error('Nome do Negócio e da Empreendedora são obrigatórios!');
    }
    setLoading(true);
    try {
      const method = editingId ? 'PATCH' : 'POST';
      const url = editingId ? `/api/empreendedoras?id=${editingId}` : '/api/empreendedoras';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error();
      toast.success(editingId ? 'Empreendedora atualizada!' : 'Empreendedora cadastrada com sucesso!');
      setFormData(FORM_VAZIO);
      setEditingId(null);
      loadDados();
    } catch (err) {
      toast.error('Erro ao salvar no banco.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (emp: any) => {
    setEditingId(emp.id);
    setFormData({
      negocio: emp.negocio || '',
      nome: emp.nome || '',
      frase: emp.frase || '',
      categoria: emp.categoria || 'Bordado',
      instagram: emp.instagram || '',
      fotoUrl: emp.fotoUrl || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelarEdit = () => {
    setEditingId(null);
    setFormData(FORM_VAZIO);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover esta empreendedora da vitrine?')) return;
    try {
      const res = await fetch(`/api/empreendedoras?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Removida da vitrine.');
      loadDados();
    } catch {
      toast.error('Erro ao remover.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20 font-alice">
      
      <header className="flex justify-between items-center border-b pb-6" style={{ borderColor: 'var(--page-color-30)' }}>
        <div>
          <h1 className="font-serif text-4xl italic text-slate-900">
            Vitrine <span style={{ color: lavandaPrincipal }}>Criativa</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">Gerencie o espaço dedicado às nossas leitoras empreendedoras.</p>
        </div>
      </header>

      
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-2 mb-2">
                <Sparkles size={14} style={{ color: lavandaPrincipal }} />
                {editingId ? 'Editando Empreendedora' : 'Nova Curadoria'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Nome do Negócio</label>
                <input value={formData.negocio} onChange={e => setFormData({...formData, negocio: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl text-sm outline-none focus:ring-2" style={{ '--tw-ring-color': 'var(--page-color-40)' } as any} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Empreendedora</label>
                <input value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl text-sm outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Instagram (@)</label>
                <div className="relative">
                  <Instagram className="absolute left-4 top-4 text-slate-300" size={16} />
                  <input value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} placeholder="@perfil" className="w-full pl-12 p-4 bg-slate-50 rounded-2xl text-sm outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Categoria</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-4 text-slate-300" size={16} />
                  <select value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} className="w-full pl-12 p-4 bg-slate-50 rounded-2xl text-sm outline-none appearance-none">
                    {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Frase da Marca</label>
              <textarea value={formData.frase} onChange={e => setFormData({...formData, frase: e.target.value})} rows={2} className="w-full p-5 bg-slate-50 rounded-4xl text-sm outline-none resize-none italic" />
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6 text-center">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Foto / Logo</h3>
            <div onClick={() => fileInputRef.current?.click()} className="relative group mx-auto w-32 h-32 cursor-pointer">
                <div className="absolute inset-0 border-2 border-dashed border-slate-100 rounded-full group-hover:border-(--page-color) transition-all flex items-center justify-center overflow-hidden bg-slate-50 shadow-inner">
                {formData.fotoUrl ? (
                  <img src={formData.fotoUrl} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <ImageIcon className="text-slate-200 group-hover:scale-110 transition-transform" size={28} />
                )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const url = await uploadFoto(file);
                if (url) setFormData(prev => ({ ...prev, fotoUrl: url }));
                else toast.error('Erro ao fazer upload da foto.');
              }} />
            </div>

            <Button onClick={handleSave} disabled={loading} className="w-full h-16 rounded-4xl text-white font-bold uppercase text-[10px] tracking-[0.3em] shadow-xl hover:scale-105 transition-all border-none" style={{ backgroundColor: lavandaPrincipal }}>
              {loading ? <Loader2 className="animate-spin" /> : editingId ? <><Save size={16} className="mr-2" /> Salvar Alterações</> : <><Heart size={16} className="mr-2" /> Cadastrar Marca</>}
            </Button>

            {editingId && (
              <button onClick={handleCancelarEdit} className="w-full text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all flex items-center justify-center gap-2">
                <X size={12} /> Cancelar edição
              </button>
            )}
          </div>
        </aside>
      </section>

      <hr className="border-slate-100" />

      
      <section className="space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4 flex items-center gap-2">
            <Store size={14} /> Marcas Catalogadas ({lista.length})
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lista.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-[3rem]">
              <p className="text-slate-400 font-serif italic text-lg">A vitrine está aguardando o primeiro brilho.</p>
            </div>
          ) : (
            lista.map((emp) => (
              <div key={emp.id} className={`bg-white p-6 rounded-[2.5rem] border flex items-center gap-5 group hover:shadow-md transition-all ${editingId === emp.id ? 'border-(--page-color)' : 'border-slate-100'}`}>
                <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 border border-slate-100">
                  {emp.fotoUrl ? <img src={emp.fotoUrl} className="w-full h-full object-cover" alt={emp.negocio} /> : <User size={18} className="text-slate-200" />}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: lavandaPrincipal }}>{emp.categoria}</span>
                  <h3 className="font-serif text-lg italic text-slate-900 truncate leading-tight">{emp.negocio}</h3>
                  <p className="text-[10px] text-slate-400 truncate italic">por {emp.nome}</p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button onClick={() => handleEdit(emp)} className="p-2 text-slate-200 hover:text-(--page-color) transition-all" title="Editar">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleDelete(emp.id)} className="p-2 text-slate-200 hover:text-rose-400 transition-all" title="Remover">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}