"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Trash2, BookOpen, Coffee, Heart, Sparkles, 
  Loader2, Feather, Lightbulb, Save, PenTool,
  Quote, MessageSquare, Pencil, X,
  Sun, Moon, Music, Flower2, Leaf, Star,
  BookMarked, PenLine, Glasses, Bookmark
} from 'lucide-react';

const azulSereno = "var(--page-color)";

const IconMap: any = {
  BookOpen,
  Coffee,
  Heart,
  Sparkles,
  Feather,
  Lightbulb,
  Sun,
  Moon,
  Music,
  Flower2,
  Leaf,
  Star,
  BookMarked,
  PenLine,
  Glasses,
  Bookmark,
};

const FORM_VAZIO = { categoria: 'Ritual', titulo: '', descricao: '', iconName: 'BookOpen', textoCompleto: '' };

export default function DicasAdmin() {
  const [dicas, setDicas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tipo, setTipo] = useState<'pilula' | 'coluna'>('pilula');

  const [formData, setFormData] = useState(FORM_VAZIO);

  const loadDados = async () => {
    try {
      const res = await fetch('/api/dicas');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDicas(Array.isArray(data) ? data : []);
    } catch (e) { console.error("Erro ao carregar dicas:", e); }
  };

  useEffect(() => { loadDados(); }, []);

  const handleSave = async () => {
    if (!formData.titulo || !formData.descricao) {
      return toast.error('Preencha o título e a descrição da dica!');
    }
    setLoading(true);
    try {
      const method = editingId ? 'PATCH' : 'POST';
      const url = editingId ? `/api/dicas?id=${editingId}` : '/api/dicas';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error();
      toast.success(editingId ? 'Dica atualizada!' : 'Dica da Gabi publicada com carinho!');
      setFormData(FORM_VAZIO);
      setEditingId(null);
      loadDados();
    } catch (err) {
      toast.error('Erro ao salvar dica.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setTipo(item.textoCompleto ? 'coluna' : 'pilula');
    setFormData({
      categoria: item.categoria || 'Ritual',
      titulo: item.titulo || '',
      descricao: item.descricao || '',
      iconName: item.iconName || 'BookOpen',
      textoCompleto: item.textoCompleto || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (item: any) => {
    if (!confirm(`Remover a dica "${item.titulo}"?`)) return;
    try {
      const res = await fetch(`/api/dicas?id=${item.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Dica removida.');
      loadDados();
    } catch {
      toast.error('Erro ao remover dica.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20 font-alice text-slate-900">
      
      <header className="flex justify-between items-center border-b pb-6" style={{ borderColor: `${azulSereno}30` }}>
        <div>
          <h1 className="font-serif text-4xl italic">
            Coluna da <span style={{ color: azulSereno }}>Gabi</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">"Dicas para uma jornada literária com afeto."</p>
        </div>
      </header>

      
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-2">
                <Feather size={14} style={{ color: azulSereno }} /> {editingId ? 'Editar Dica' : 'Escrever Nova Dica'}
              </h3>
              {editingId && (
                <button onClick={() => { setEditingId(null); setFormData(FORM_VAZIO); setTipo('pilula'); }} className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-rose-400 transition-colors">
                  <X size={14} /> Cancelar edição
                </button>
              )}
            </div>

            
            <div className="flex gap-3 p-1 bg-slate-50 rounded-2xl">
              <button
                onClick={() => { setTipo('pilula'); setFormData(f => ({ ...f, textoCompleto: '' })); }}
                className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  tipo === 'pilula'
                    ? 'bg-white shadow text-slate-800'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Pílula <span className="font-normal normal-case tracking-normal">frase curta</span>
              </button>
              <button
                onClick={() => setTipo('coluna')}
                className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  tipo === 'coluna'
                    ? 'bg-white shadow text-slate-800'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Coluna <span className="font-normal normal-case tracking-normal">artigo completo</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Categoria</label>
                <input 
                  value={formData.categoria} 
                  onChange={e => setFormData({...formData, categoria: e.target.value})} 
                  placeholder="Ex: Ritual, Horizonte..."
                  className="w-full p-4 bg-slate-50 rounded-2xl text-sm outline-none focus:ring-2 transition-all" 
                  style={{ '--tw-ring-color': `${azulSereno}40` } as any}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Ícone da Pílula</label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center" style={{ color: azulSereno }}>
                    {React.createElement(IconMap[formData.iconName] || Lightbulb, { size: 20 })}
                  </div>
                  <select 
                    value={formData.iconName} 
                    onChange={e => setFormData({...formData, iconName: e.target.value})} 
                    className="flex-1 p-4 bg-slate-50 rounded-2xl text-sm outline-none cursor-pointer"
                  >
                    <option value="BookOpen">Livro Aberto</option>
                    <option value="BookMarked">Livro Marcado</option>
                    <option value="Bookmark">Marcador</option>
                    <option value="Coffee">Café / Chá</option>
                    <option value="Heart">Coração / Afeto</option>
                    <option value="Sparkles">Brilho / Horizonte</option>
                    <option value="Feather">Pena / Escrita</option>
                    <option value="PenLine">Caneta</option>
                    <option value="Lightbulb">Lâmpada / Ideia</option>
                    <option value="Sun">Sol / Manhã</option>
                    <option value="Moon">Lua / Noite</option>
                    <option value="Music">Música / Trilha</option>
                    <option value="Flower2">Flor / Natureza</option>
                    <option value="Leaf">Folha / Calma</option>
                    <option value="Star">Estrela / Destaque</option>
                    <option value="Glasses">Óculos / Leitura</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Título Inspirador</label>
              <input 
                value={formData.titulo} 
                onChange={e => setFormData({...formData, titulo: e.target.value})} 
                placeholder="Ex: Crie um refúgio de leitura"
                className="w-full p-4 bg-slate-50 rounded-2xl text-sm outline-none font-serif italic" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Resumo do Card <span className="normal-case font-normal text-slate-300">(aparece na listagem)</span></label>
              <textarea 
                value={formData.descricao} 
                onChange={e => setFormData({...formData, descricao: e.target.value})} 
                rows={2} 
                placeholder="Uma frase curta que convida a leitora a abrir o artigo..."
                className="w-full p-5 bg-slate-50 rounded-4xl text-sm outline-none resize-none italic leading-relaxed" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Texto Completo da Coluna <span className="normal-case font-normal text-slate-300">(abre ao clicar “Ler Coluna”)</span></label>
              <textarea 
                value={formData.textoCompleto} 
                onChange={e => setFormData({...formData, textoCompleto: e.target.value})} 
                rows={10} 
                placeholder="Escreva aqui o artigo ou texto completo da coluna. Use parágrafos separados por linha em branco..."
                className="w-full p-5 bg-slate-50 rounded-4xl text-sm outline-none resize-none leading-relaxed" 
              />
              {formData.textoCompleto && (
                <p className="text-[10px] text-slate-400 ml-2">{formData.textoCompleto.length} caracteres • ~{Math.ceil(formData.textoCompleto.split(' ').length / 200)} min de leitura</p>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-center">Preview — {tipo === 'pilula' ? 'Pílula' : 'Coluna'}</h3>
            
            
            <div className="space-y-4 p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full border bg-white" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                  {React.createElement(IconMap[formData.iconName] || Lightbulb, { size: 16, style: { color: azulSereno } })}
                </div>
                <span className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: azulSereno }}>
                  {formData.categoria || 'Categoria'}
                </span>
              </div>
              <h3 className="text-xl leading-tight tracking-tighter border-l-2 pl-4 py-1 text-slate-800 italic font-light" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                {formData.titulo || 'Título da dica aparece aqui'}
              </h3>
              {formData.descricao && (
                <p className="text-xs leading-relaxed italic opacity-60 text-slate-700 pl-4 line-clamp-2">
                  {formData.descricao}
                </p>
              )}
            </div>

            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="w-full h-16 rounded-4xl text-white font-bold uppercase text-[10px] tracking-[0.3em] shadow-xl hover:scale-105 transition-all border-none"
              style={{ backgroundColor: azulSereno }}
            >
              {loading ? <Loader2 className="animate-spin" /> : editingId ? <><Pencil size={16} className="mr-2" /> Salvar Edição</> : tipo === 'pilula' ? <><Sparkles size={16} className="mr-2" /> Publicar Pílula</> : <><Save size={16} className="mr-2" /> Publicar Coluna</>}
            </Button>
          </div>

          <div className="p-6 bg-[#F9FBFC] rounded-[2.5rem] border border-slate-100 flex items-center gap-4">
              <MessageSquare className="text-slate-300 shrink-0" size={20} />
              <p className="text-[10px] text-slate-400 italic leading-tight">
                Suas dicas aparecerão na seção "Dicas da Gabi" com o ícone selecionado.
              </p>
          </div>
        </aside>
      </section>

      <hr className="border-slate-100" />

      
      <section className="space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4 flex items-center gap-2">
            <Lightbulb size={14} /> Dicas Ativas ({dicas.length})
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dicas.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-[3rem]">
              <p className="text-slate-400 font-serif italic text-lg opacity-40">Aguardando sua primeira inspiração.</p>
            </div>
          ) : (
            dicas.map((item) => (
              <div key={item.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex flex-col gap-4 group hover:shadow-lg transition-all relative overflow-hidden">
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-50 rounded-lg" style={{ color: azulSereno }}>
                      {React.createElement(IconMap[item.iconName] || Lightbulb, { size: 18 })}
                    </div>
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                      item.textoCompleto ? 'bg-blue-50 text-blue-400' : 'bg-purple-50 text-purple-400'
                    }`}>
                      {item.textoCompleto ? 'Coluna' : 'Pílula'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(item)} className="p-2 text-slate-200 hover:text-sky-400 transition-all" title="Editar">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(item)} className="p-2 text-slate-200 hover:text-rose-400 transition-all" title="Remover">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 relative z-10">
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">{item.categoria}</span>
                  <h3 className="font-serif text-xl italic leading-tight text-slate-800">{item.titulo}</h3>
                  <p className="text-[11px] text-slate-500 italic line-clamp-3 leading-relaxed">{item.descricao}</p>
                </div>

                
                <div className="absolute -bottom-2 -right-2 opacity-[0.03] text-slate-900 group-hover:scale-110 transition-transform">
                   {React.createElement(IconMap[item.iconName] || Lightbulb, { size: 80 })}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}