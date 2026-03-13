"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Trash2, Instagram, Upload, BookOpen, Globe, User,
  Tag, Sparkles, Save, ImageIcon, Loader2, ShoppingCart,
  Edit2, X, Check
} from 'lucide-react';

const rosaPrincipal = "var(--page-color)";

interface Escritora {
  id: string;
  nome: string;
  livroTitulo: string;
  genero?: string | null;
  sinopse?: string | null;
  instagram?: string | null;
  linkCompra?: string | null;
  capaUrl?: string | null;
  site?: string | null;
  bio?: string | null;
}

const GENEROS = [
  'Romance', 'Ficção Científica', 'Fantasia', 'Terror', 'Suspense',
  'Autoajuda', 'Biografia', 'Poesia', 'Crônicas', 'Infantojuvenil',
  'Literatura Brasileira', 'Histórico', 'Espiritualidade', 'Outro'
];

const formVazio = {
  nome: '',
  livroTitulo: '',
  genero: 'Romance',
  sinopse: '',
  instagram: '',
  linkCompra: '',
  capaUrl: '',
  site: '',
  bio: '',
};

const inputCls = "w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-alice focus:outline-none focus:border-[var(--page-color)] transition-colors";

function Field({ label, icon: Icon, children }: { label: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
        <Icon size={12} style={{ color: rosaPrincipal }} /> {label}
      </label>
      {children}
    </div>
  );
}

export default function EscritorasAdmin() {
  const [lista, setLista] = useState<Escritora[]>([]);
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<typeof formVazio>(formVazio);

  const [formData, setFormData] = useState<typeof formVazio>(formVazio);
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');
  const [editUploadMode, setEditUploadMode] = useState<'url' | 'file'>('url');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const loadDados = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/escritoras');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLista(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Erro ao carregar:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDados(); }, []);

  const uploadImagem = async (file: File): Promise<string | null> => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url || null;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, target: 'add' | 'edit') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    if (target === 'add') {
      setFormData(f => ({ ...f, capaUrl: preview }));
    } else {
      setEditForm(f => ({ ...f, capaUrl: preview }));
    }
    setSalvando(true);
    try {
      const url = await uploadImagem(file);
      if (url) {
        if (target === 'add') setFormData(f => ({ ...f, capaUrl: url }));
        else setEditForm(f => ({ ...f, capaUrl: url }));
        toast.success('Capa enviada!');
      } else {
        toast.error('Erro ao enviar capa.');
      }
    } finally {
      setSalvando(false);
    }
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.livroTitulo) {
      return toast.error('Nome da escritora e título do livro são obrigatórios!');
    }
    setSalvando(true);
    try {
      const res = await fetch('/api/escritoras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error();
      toast.success('Escritora cadastrada com sucesso!');
      setFormData(formVazio);
      loadDados();
    } catch {
      toast.error('Erro ao salvar no banco.');
    } finally {
      setSalvando(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover esta escritora da vitrine?')) return;
    try {
      const res = await fetch(`/api/escritoras?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Removida!');
      loadDados();
    } catch {
      toast.error('Erro ao remover.');
    }
  };

  const iniciarEdicao = (e: Escritora) => {
    setEditando(e.id);
    setEditForm({
      nome: e.nome || '',
      livroTitulo: e.livroTitulo || '',
      genero: e.genero || 'Romance',
      sinopse: e.sinopse || '',
      instagram: e.instagram || '',
      linkCompra: e.linkCompra || '',
      capaUrl: e.capaUrl || '',
      site: e.site || '',
      bio: e.bio || '',
    });
    setEditUploadMode('url');
  };

  const handleSalvarEdicao = async (id: string) => {
    if (!editForm.nome || !editForm.livroTitulo) {
      return toast.error('Nome e título são obrigatórios!');
    }
    setSalvando(true);
    try {
      const res = await fetch(`/api/escritoras?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error();
      toast.success('Alterações salvas!');
      setEditando(null);
      loadDados();
    } catch {
      toast.error('Erro ao salvar alterações.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20 font-alice">

      <header className="flex justify-between items-center border-b pb-6" style={{ borderColor: 'var(--page-color-30)' }}>
        <div>
          <h1 className="font-serif text-4xl italic text-slate-900">
            Escritoras <span style={{ color: rosaPrincipal }}>do Clube</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">
            Gerencie o espaço dedicado às leitoras autoras.
          </p>
        </div>
      </header>

      
      <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-2">
          <Sparkles size={14} style={{ color: rosaPrincipal }} /> Nova Escritora
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Nome da Escritora" icon={User}>
            <input
              className={inputCls}
              placeholder="Nome completo"
              value={formData.nome}
              onChange={e => setFormData(f => ({ ...f, nome: e.target.value }))}
            />
          </Field>

          <Field label="Título do Livro" icon={BookOpen}>
            <input
              className={inputCls}
              placeholder="Título da obra"
              value={formData.livroTitulo}
              onChange={e => setFormData(f => ({ ...f, livroTitulo: e.target.value }))}
            />
          </Field>

          <Field label="Gênero Literário" icon={Tag}>
            <select
              className={inputCls}
              value={formData.genero}
              onChange={e => setFormData(f => ({ ...f, genero: e.target.value }))}
            >
              {GENEROS.map(g => <option key={g}>{g}</option>)}
            </select>
          </Field>

          <Field label="Instagram" icon={Instagram}>
            <input
              className={inputCls}
              placeholder="@handle"
              value={formData.instagram}
              onChange={e => setFormData(f => ({ ...f, instagram: e.target.value }))}
            />
          </Field>

          <Field label="Link de Compra" icon={ShoppingCart}>
            <input
              className={inputCls}
              placeholder="https://..."
              value={formData.linkCompra}
              onChange={e => setFormData(f => ({ ...f, linkCompra: e.target.value }))}
            />
          </Field>

          <Field label="Site / Blog" icon={Globe}>
            <input
              className={inputCls}
              placeholder="https://..."
              value={formData.site}
              onChange={e => setFormData(f => ({ ...f, site: e.target.value }))}
            />
          </Field>
        </div>

        <Field label="Sinopse do Livro" icon={BookOpen}>
          <textarea
            className={`${inputCls} min-h-[80px] resize-none`}
            placeholder="Uma breve sinopse..."
            value={formData.sinopse}
            onChange={e => setFormData(f => ({ ...f, sinopse: e.target.value }))}
          />
        </Field>

        <Field label="Bio da Escritora" icon={User}>
          <textarea
            className={`${inputCls} min-h-[60px] resize-none`}
            placeholder="Breve apresentação da autora..."
            value={formData.bio}
            onChange={e => setFormData(f => ({ ...f, bio: e.target.value }))}
          />
        </Field>

        
        <Field label="Capa do Livro" icon={ImageIcon}>
          <div className="flex gap-3 mb-3">
            <button
              onClick={() => setUploadMode('url')}
              className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl border transition-all ${uploadMode === 'url' ? 'text-white border-transparent' : 'text-slate-400 border-slate-200'}`}
              style={uploadMode === 'url' ? { backgroundColor: rosaPrincipal, borderColor: rosaPrincipal } : {}}
            >
              URL
            </button>
            <button
              onClick={() => setUploadMode('file')}
              className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl border transition-all ${uploadMode === 'file' ? 'text-white border-transparent' : 'text-slate-400 border-slate-200'}`}
              style={uploadMode === 'file' ? { backgroundColor: rosaPrincipal, borderColor: rosaPrincipal } : {}}
            >
              Upload
            </button>
          </div>
          {uploadMode === 'url' ? (
            <input
              className={inputCls}
              placeholder="https://…/capa.jpg"
              value={formData.capaUrl}
              onChange={e => setFormData(f => ({ ...f, capaUrl: e.target.value }))}
            />
          ) : (
            <div
              className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center cursor-pointer hover:border-[var(--page-color)] transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {formData.capaUrl && !formData.capaUrl.startsWith('blob:') === false ? (
                <img src={formData.capaUrl} alt="preview" className="h-32 object-contain mx-auto mb-2 rounded" />
              ) : (
                <Upload size={24} className="mx-auto mb-2 opacity-30" style={{ color: rosaPrincipal }} />
              )}
              <p className="text-xs text-slate-400">Clique para selecionar a capa</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => handleFileChange(e, 'add')}
              />
            </div>
          )}
          {formData.capaUrl && (
            <div className="mt-3">
              <img src={formData.capaUrl} alt="preview" className="h-36 object-contain rounded shadow-sm border border-slate-100" />
            </div>
          )}
        </Field>

        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            disabled={salvando}
            className="text-white px-10 py-6 h-auto rounded-2xl font-bold uppercase text-[10px] tracking-[0.3em] shadow-lg hover:scale-[1.02] transition-all"
            style={{ backgroundColor: rosaPrincipal }}
          >
            {salvando ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
            Cadastrar Escritora
          </Button>
        </div>
      </section>

      
      <section className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-2">
          <BookOpen size={14} style={{ color: rosaPrincipal }} />
          Escritoras Cadastradas ({lista.length})
        </h3>

        {loading ? (
          <div className="text-center py-10 opacity-40 italic text-sm animate-pulse">Carregando...</div>
        ) : lista.length === 0 ? (
          <div className="text-center py-14 opacity-30 italic text-sm">Nenhuma escritora cadastrada ainda.</div>
        ) : (
          <div className="space-y-3">
            {lista.map(item => (
              <div key={item.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                {editando === item.id ? (
                  
                  <div className="p-8 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Nome</label>
                        <input className={inputCls} value={editForm.nome} onChange={e => setEditForm(f => ({ ...f, nome: e.target.value }))} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Título do Livro</label>
                        <input className={inputCls} value={editForm.livroTitulo} onChange={e => setEditForm(f => ({ ...f, livroTitulo: e.target.value }))} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Gênero</label>
                        <select className={inputCls} value={editForm.genero} onChange={e => setEditForm(f => ({ ...f, genero: e.target.value }))}>
                          {GENEROS.map(g => <option key={g}>{g}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Instagram</label>
                        <input className={inputCls} value={editForm.instagram} onChange={e => setEditForm(f => ({ ...f, instagram: e.target.value }))} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Link de Compra</label>
                        <input className={inputCls} value={editForm.linkCompra} onChange={e => setEditForm(f => ({ ...f, linkCompra: e.target.value }))} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Site</label>
                        <input className={inputCls} value={editForm.site} onChange={e => setEditForm(f => ({ ...f, site: e.target.value }))} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Sinopse</label>
                      <textarea className={`${inputCls} min-h-[70px] resize-none`} value={editForm.sinopse} onChange={e => setEditForm(f => ({ ...f, sinopse: e.target.value }))} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Bio</label>
                      <textarea className={`${inputCls} min-h-[60px] resize-none`} value={editForm.bio} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))} />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Capa do Livro</label>
                      <div className="flex gap-3 mb-2">
                        {['url', 'file'].map(m => (
                          <button key={m} onClick={() => setEditUploadMode(m as any)}
                            className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl border transition-all ${editUploadMode === m ? 'text-white border-transparent' : 'text-slate-400 border-slate-200'}`}
                            style={editUploadMode === m ? { backgroundColor: rosaPrincipal, borderColor: rosaPrincipal } : {}}>
                            {m === 'url' ? 'URL' : 'Upload'}
                          </button>
                        ))}
                      </div>
                      {editUploadMode === 'url' ? (
                        <input className={inputCls} placeholder="https://…/capa.jpg" value={editForm.capaUrl} onChange={e => setEditForm(f => ({ ...f, capaUrl: e.target.value }))} />
                      ) : (
                        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center cursor-pointer hover:border-[var(--page-color)] transition-colors" onClick={() => editFileInputRef.current?.click()}>
                          <Upload size={20} className="mx-auto mb-1 opacity-30" style={{ color: rosaPrincipal }} />
                          <p className="text-xs text-slate-400">Clique para trocar a capa</p>
                          <input ref={editFileInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileChange(e, 'edit')} />
                        </div>
                      )}
                      {editForm.capaUrl && (
                        <img src={editForm.capaUrl} alt="preview" className="h-28 object-contain rounded shadow-sm border border-slate-100 mt-2" />
                      )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <Button variant="outline" onClick={() => setEditando(null)}>
                        <X size={14} className="mr-1" /> Cancelar
                      </Button>
                      <Button disabled={salvando} onClick={() => handleSalvarEdicao(item.id)}
                        className="text-white" style={{ backgroundColor: rosaPrincipal }}>
                        {salvando ? <Loader2 size={14} className="animate-spin mr-1" /> : <Check size={14} className="mr-1" />}
                        Salvar
                      </Button>
                    </div>
                  </div>
                ) : (
                  
                  <div className="flex items-start gap-6 p-6">
                    {item.capaUrl ? (
                      <img src={item.capaUrl} alt={item.livroTitulo} className="w-14 h-20 object-cover rounded shadow-sm flex-shrink-0" />
                    ) : (
                      <div className="w-14 h-20 rounded flex items-center justify-center flex-shrink-0" style={{ background: `${rosaPrincipal}15` }}>
                        <BookOpen size={20} className="opacity-30" style={{ color: rosaPrincipal }} />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 text-black">{item.genero}</p>
                      <h4 className="text-xl text-slate-800 tracking-tight leading-tight">{item.livroTitulo}</h4>
                      <p className="text-xs opacity-50 italic">por {item.nome}</p>
                      {item.sinopse && (
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{item.sinopse}</p>
                      )}
                      <div className="flex flex-wrap gap-3 mt-3">
                        {item.instagram && (
                          <span className="text-[9px] opacity-40 flex items-center gap-1">
                            <Instagram size={10} /> {item.instagram}
                          </span>
                        )}
                        {item.linkCompra && (
                          <span className="text-[9px] opacity-40 flex items-center gap-1">
                            <ShoppingCart size={10} /> Link de compra
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => iniciarEdicao(item)}
                        className="p-2 rounded-xl border border-slate-200 hover:border-[var(--page-color)] text-slate-400 hover:text-[var(--page-color)] transition-all"
                        title="Editar"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 rounded-xl border border-slate-200 hover:border-red-300 text-slate-400 hover:text-red-400 transition-all"
                        title="Remover"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
