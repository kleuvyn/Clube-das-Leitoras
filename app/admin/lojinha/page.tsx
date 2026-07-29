"use client";

import React, { useEffect, useState } from 'react';
import { useAdmin } from '@/lib/admin-context';
import { uploadFile } from '@/lib/upload-client';
import { 
  ShoppingBag, Plus, Trash2, Edit3, Save, X, Search, 
  Package, DollarSign, Tag, Image as ImageIcon, Loader2, Sparkles, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const azulLojinha = "#5B7C99";

const FORM_VAZIO = { name: '', description: '', price: '', category: '', imageUrl: '', badge: '', stock: '0', active: true };

export default function LojinhaAdmin() {
  const { isAdmin } = useAdmin();
  const [lista, setLista] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(['livros', 'marcadores', 'ecobags', 'canecas']);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('todos');
  const [emBreve, setEmBreve] = useState(true);
  const [isUpdatingConfig, setIsUpdatingConfig] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCategory !== 'todos') params.append('category', filterCategory);
      
      const [res, configRes] = await Promise.all([
        fetch(`/api/produtos?${params.toString()}`),
        fetch('/api/lojinha/config')
      ]);

      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : [];
        setLista(items);
        
        const knownCats = Array.from(new Set([
          'livros', 'marcadores', 'ecobags', 'canecas',
          ...items.map((p: any) => p.category)
        ])).filter(Boolean).sort();
        setCategories(knownCats);
      }

      if (configRes.ok) {
        const config = await configRes.json();
        setEmBreve(config.emBreve);
      }
    } catch (e) {
      console.error('Erro ao carregar produtos:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatusLoja = async () => {
    setIsUpdatingConfig(true);
    try {
      const res = await fetch('/api/lojinha/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emBreve: !emBreve }),
      });

      if (res.ok) {
        const data = await res.json();
        setEmBreve(data.emBreve);
        toast.success(data.emBreve ? 'Loja colocada em modo Em Breve!' : 'Loja publicada com sucesso!');
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.error('Erro ao atualizar status da loja');
    } finally {
      setIsUpdatingConfig(false);
    }
  };

  useEffect(() => {
    load();
  }, [filterCategory]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadFile(file);
      setForm(prev => ({ ...prev, imageUrl: url }));
      toast.success('Imagem enviada!');
    } catch (err) {
      toast.error('Erro no upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    try {
      const method = editingId ? 'PATCH' : 'POST';
      const body = editingId ? { ...form, id: editingId } : form;

      const res = await fetch('/api/produtos', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error();
      
      toast.success(editingId ? 'Produto atualizado!' : 'Produto criado!');
      setForm(FORM_VAZIO);
      setEditingId(null);
      load();
    } catch (err) {
      toast.error('Erro ao salvar produto');
    }
  };

  const handleEdit = (p: any) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description || '',
      price: (p.price / 100).toString(),
      category: p.category,
      imageUrl: p.imageUrl || '',
      badge: p.badge || '',
      stock: (p.stock || 0).toString(),
      active: p.active ?? true
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este produto?')) return;
    try {
      const res = await fetch(`/api/produtos?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Produto excluído');
        load();
      }
    } catch (e) {
      toast.error('Erro ao excluir');
    }
  };

  const filteredLista = lista.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 md:p-12 font-alice bg-[#FDFCFB]">
      
      {/* Cabeçalho */}
      <header className="mb-12 border-b border-[#E5E1DA] pb-8">
        <div className="flex items-center gap-3 mb-4" style={{ color: azulLojinha }}>
          <ShoppingBag size={14} />
          <span className="text-[9px] font-mono font-bold uppercase tracking-[0.5em]">Gestão da Lojinha</span>
        </div>
        <h1 className="text-5xl italic tracking-tighter leading-none text-[#1A1A1A] font-light">
          Vitrine & <span style={{ color: azulLojinha }} className="not-italic font-medium">Estoque.</span>
        </h1>
      </header>

      {/* Status da Loja */}
      <section className="mb-12">
        <div className={`p-6 rounded-[2rem] border transition-all flex flex-col md:flex-row items-center justify-between gap-6 ${
          emBreve 
            ? 'bg-amber-50/50 border-amber-100/50' 
            : 'bg-emerald-50/50 border-emerald-100/50'
        }`}>
          <div className="flex items-center gap-5 text-center md:text-left">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${
              emBreve ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
            }`}>
              {emBreve ? <Package size={28} /> : <Sparkles size={28} />}
            </div>
            <div>
              <h3 className="font-serif text-xl italic text-slate-900">
                Status da Loja: {emBreve ? 'Modo "Em Breve"' : 'Loja Ativa / Pública'}
              </h3>
              <p className="text-xs text-slate-500 font-alice max-w-sm">
                {emBreve 
                  ? 'Os visitantes veem a página de espera. Use este modo enquanto organiza o estoque.' 
                  : 'A vitrine está visível para todas as leitoras com os produtos ativos.'}
              </p>
            </div>
          </div>
          
          <button
            onClick={toggleStatusLoja}
            disabled={isUpdatingConfig}
            className={`px-8 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] transition-all flex items-center gap-3 shadow-md active:scale-95 ${
              emBreve 
                ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                : 'bg-amber-600 text-white hover:bg-amber-700'
            } disabled:opacity-50`}
          >
            {isUpdatingConfig ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : emBreve ? (
              <>Publicar Lojinha <Sparkles size={14} /></>
            ) : (
              <>Colocar em Breve <Package size={14} /></>
            )}
          </button>
        </div>
      </section>

      {/* Formulário */}
      <section className="mb-20 bg-white p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-sm max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          {editingId ? <Edit3 size={18} style={{ color: azulLojinha }} /> : <Plus size={18} style={{ color: azulLojinha }} />}
          <h2 className="text-xl italic font-serif text-slate-900">{editingId ? 'Editar Produto' : 'Cadastrar Novo Item'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Nome do Produto *</label>
              <input 
                type="text" 
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                placeholder="Ex: Ecobag Botânica"
                className="w-full bg-slate-50 border-b border-slate-100 py-3 px-4 rounded-xl focus:border-cyan-200 outline-none transition-all text-sm italic"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Descrição</label>
              <textarea 
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                placeholder="Detalhes para a leitora..."
                rows={3}
                className="w-full bg-slate-50 border-b border-slate-100 py-3 px-4 rounded-xl focus:border-cyan-200 outline-none transition-all text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Preço (R$) *</label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    type="number" 
                    step="0.01"
                    value={form.price}
                    onChange={e => setForm({...form, price: e.target.value})}
                    placeholder="0,00"
                    className="w-full bg-slate-50 border-b border-slate-100 py-3 pl-10 pr-4 rounded-xl focus:border-cyan-200 outline-none transition-all text-sm font-bold"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Estoque</label>
                <div className="relative">
                  <Package size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    type="number" 
                    value={form.stock}
                    onChange={e => setForm({...form, stock: e.target.value})}
                    placeholder="0"
                    className="w-full bg-slate-50 border-b border-slate-100 py-3 pl-10 pr-4 rounded-xl focus:border-cyan-200 outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Categoria *</label>
              <div className="relative">
                <input 
                  list="categorias-list"
                  type="text"
                  value={form.category}
                  onChange={e => setForm({...form, category: e.target.value.toLowerCase()})}
                  placeholder="Selecione ou digite nova..."
                  className="w-full bg-slate-50 border-b border-slate-100 py-3 px-4 rounded-xl focus:border-cyan-200 outline-none transition-all text-sm uppercase tracking-widest font-bold"
                />
                <datalist id="categorias-list">
                  {categories.map(c => <option key={c} value={c} />)}
                </datalist>
                <p className="text-[8px] text-slate-400 mt-1 italic pl-1">Dica: Digite para criar uma categoria nova na hora.</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Tag / Selo (opcional)</label>
              <div className="relative">
                <Tag size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input 
                  type="text" 
                  value={form.badge}
                  onChange={e => setForm({...form, badge: e.target.value})}
                  placeholder="Ex: Novidade, Destaque"
                  className="w-full bg-slate-50 border-b border-slate-100 py-3 pl-10 pr-4 rounded-xl focus:border-cyan-200 outline-none transition-all text-sm italic"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-1">Imagem do Produto</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                  {form.imageUrl ? (
                    <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={24} className="text-slate-200" />
                  )}
                </div>
                <div className="flex-1">
                  <input type="file" accept="image/*" onChange={handleUpload} id="foto-upload" className="hidden" />
                  <label 
                    htmlFor="foto-upload"
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-slate-200 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Escolher Imagem'}
                  </label>
                  <p className="text-[9px] text-slate-400 mt-2 italic">PNG ou JPG até 2MB</p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 pt-6 flex justify-end items-center gap-4">
            {editingId && (
              <button 
                type="button" 
                onClick={() => { setEditingId(null); setForm(FORM_VAZIO); }}
                className="px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 transition-all"
              >
                Cancelar
              </button>
            )}
            <button 
              type="submit"
              className="flex items-center gap-3 px-12 py-4 rounded-xl text-white text-[11px] font-bold uppercase tracking-[0.3em] transition-all hover:scale-105 shadow-xl hover:shadow-[#5B7C99]/20"
              style={{ backgroundColor: azulLojinha }}
            >
              <Save size={16} />
              {editingId ? 'Salvar Alterações' : 'Publicar Item'}
            </button>
          </div>
        </form>
      </section>

      {/* Listagem */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h3 className="font-serif text-2xl italic text-slate-900 flex items-center gap-3">
              Items no Catálogo
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 not-italic font-mono">{lista.length}</span>
            </h3>
            <p className="text-xs text-slate-400 font-alice">Gerencie o que aparece na vitrine do site.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <input 
                type="text" 
                placeholder="Pesquisar por nome..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-100 py-2 pl-10 pr-4 rounded-full text-xs italic focus:border-cyan-200 outline-none transition-all"
              />
            </div>
            <select 
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="bg-white border border-slate-100 py-2 px-4 rounded-full text-[10px] font-bold uppercase tracking-widest outline-none transition-all"
            >
              <option value="todos">Todos</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredLista.length === 0 ? (
            <div className="col-span-full py-32 text-center bg-white border border-dashed border-slate-100 rounded-[3rem]">
              <AlertCircle size={32} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-300 font-serif italic text-lg">Nenhum tesouro encontrado por aqui.</p>
            </div>
          ) : (
            filteredLista.map((prod) => (
              <div key={prod.id} className="group bg-white rounded-[2.5rem] border border-slate-50 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
                <div className="aspect-square relative overflow-hidden bg-slate-50">
                  {prod.imageUrl ? (
                    <img src={prod.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={prod.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                      <ImageIcon size={48} />
                    </div>
                  )}
                  {prod.badge && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                      <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: azulLojinha }}>{prod.badge}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button 
                      onClick={() => handleEdit(prod)}
                      className="w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center hover:scale-110 transition-all shadow-lg"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(prod.id)}
                      className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center hover:scale-110 transition-all shadow-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-30">{prod.category}</span>
                    <span className="text-sm font-alice italic text-slate-400">Estoque: {prod.stock || 0}</span>
                  </div>
                  <h3 className="font-serif text-xl text-slate-900 leading-tight">{prod.name}</h3>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xl font-alice font-bold" style={{ color: azulLojinha }}>
                      {(prod.price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                    {!prod.active && (
                      <span className="text-[8px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full uppercase font-bold tracking-tighter">Inativo</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Float button for scrolling up when editing */}
      {editingId && (
        <div className="fixed bottom-8 right-8 animate-bounce">
          <div className="bg-amber-50 text-amber-600 px-4 py-2 rounded-full border border-amber-200 shadow-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
            <Sparkles size={12} /> Editando agora
          </div>
        </div>
      )}
    </div>
  );
}
