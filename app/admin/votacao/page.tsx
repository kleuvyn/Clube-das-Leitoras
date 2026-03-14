"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAdmin } from '@/lib/admin-context';
import {
  Trash2, Loader2, Save, BarChart3, Trophy,
  XCircle, Plus, History, Book, ToggleLeft, ToggleRight,
  Pencil, X, Upload, Link as LinkIcon, ShoppingCart, Archive,
} from 'lucide-react';

interface Livro {
  id: string;
  titulo: string;
  autor: string;
  capaUrl: string | null;
  indicadoPor: string | null;
  votos: number;
  linkCompra?: string | null;
}

interface EditForm {
  titulo: string;
  autor: string;
  capaUrl: string;
  linkCompra: string;
  uploadMode: boolean;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface Historico {
  id: string;
  periodo: string;
  vencedorTitulo: string;
  vencedorAutor: string;
  vencedorVotos: number;
  totalVotos: number;
  porcentagem: number;
}

export default function VotacoesAdmin() {
  const { isAdmin } = useAdmin();
  const [livros, setLivros] = useState<Livro[]>([]);
  const [historico, setHistorico] = useState<Historico[]>([]);
  const [ativa, setAtiva] = useState(false);
  const [prazo, setPrazo] = useState('');
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [encerrando, setEncerrando] = useState(false);
  const [novoLivro, setNovoLivro] = useState<{ titulo: string; autor: string; capaUrl: string; uploadMode: boolean }>({ titulo: '', autor: '', capaUrl: '', uploadMode: false });
  const [adicionando, setAdicionando] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const addFileRef = useRef<HTMLInputElement>(null);

  const [editando, setEditando] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ titulo: '', autor: '', capaUrl: '', linkCompra: '', uploadMode: false });
  const [salvandoEdit, setSalvandoEdit] = useState(false);
  const editFileRef = useRef<HTMLInputElement>(null);

  const loadDados = useCallback(async () => {
    try {
      const res = await fetch('/api/votacao');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAtiva(Boolean(data.ativa));
      setPrazo(data.prazo || '');
      setLivros(Array.isArray(data.livros) ? data.livros : []);
      setHistorico(Array.isArray(data.historico) ? data.historico : []);
    } catch {
      toast.error('Erro ao carregar dados da votação.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDados(); }, [loadDados]);

  const totalVotos = livros.reduce((acc, l) => acc + l.votos, 0);
  const vencedor = livros[0] || null;

  const handleToggleAtiva = async () => {
    setSalvando(true);
    try {
      const res = await fetch('/api/votacao', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativa: !ativa, prazo }),
      });
      if (!res.ok) throw new Error();
      setAtiva(v => !v);
      toast.success(!ativa ? 'Votação aberta!' : 'Votação pausada.');
    } catch {
      toast.error('Erro ao atualizar.');
    } finally {
      setSalvando(false);
    }
  };

  const handleSalvarPrazo = async () => {
    setSalvando(true);
    try {
      const res = await fetch('/api/votacao', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativa, prazo }),
      });
      if (!res.ok) throw new Error();
      toast.success('Prazo atualizado!');
    } catch {
      toast.error('Erro ao salvar prazo.');
    } finally {
      setSalvando(false);
    }
  };

  const handleEncerrar = async () => {
    if (!confirm('Encerrar votação? O resultado será salvo no histórico e os votos serão zerados.')) return;
    setEncerrando(true);
    try {
      const periodo = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      const res = await fetch('/api/votacao', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encerrar: true, periodo }),
      });
      if (!res.ok) throw new Error();
      toast.success('Votação encerrada e salva no histórico!');
      loadDados();
    } catch {
      toast.error('Erro ao encerrar.');
    } finally {
      setEncerrando(false);
    }
  };

  const handleAddFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error('Imagem muito grande. Máximo 2MB.');
    const base64 = await fileToBase64(file);
    setNovoLivro(v => ({ ...v, capaUrl: base64 }));
  };

  const handleAddLivro = async () => {
    if (!novoLivro.titulo.trim() || !novoLivro.autor.trim()) {
      return toast.error('Título e autor são obrigatórios.');
    }
    setAdicionando(true);
    try {
      const res = await fetch('/api/livros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: novoLivro.titulo.trim(),
          autor: novoLivro.autor.trim(),
          capaUrl: (novoLivro.capaUrl ?? '').trim() || null,
          isVotacao: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.error || 'Erro ao indicar livro.');
      toast.success(data.message === 'Voto computado!' ? 'Livro já cadastrado — voto somado!' : 'Livro adicionado à votação!');
      setNovoLivro({ titulo: '', autor: '', capaUrl: '', uploadMode: false });
      setShowAddForm(false);
      loadDados();
    } catch {
      toast.error('Erro de conexão.');
    } finally {
      setAdicionando(false);
    }
  };

  
  const abrirEdicao = (livro: Livro) => {
    setEditando(livro.id);
    setEditForm({
      titulo: livro.titulo,
      autor: livro.autor,
      capaUrl: livro.capaUrl ?? '',
      linkCompra: livro.linkCompra ?? '',
      uploadMode: false,
    });
  };

  const fecharEdicao = () => { setEditando(null); };

  const handleEditFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error('Imagem muito grande. Máximo 2MB.');
    const base64 = await fileToBase64(file);
    setEditForm(v => ({ ...v, capaUrl: base64 }));
  };

  const handleSalvarEdicao = async () => {
    if (!editando) return;
    if (!editForm.titulo.trim() || !editForm.autor.trim()) {
      return toast.error('Título e autor são obrigatórios.');
    }
    setSalvandoEdit(true);
    try {
      const res = await fetch(`/api/livros?id=${editando}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: editForm.titulo.trim(),
          autor: editForm.autor.trim(),
          capaUrl: editForm.capaUrl.trim() || null,
          linkCompra: editForm.linkCompra.trim() || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Livro atualizado!');
      fecharEdicao();
      loadDados();
    } catch {
      toast.error('Erro ao salvar.');
    } finally {
      setSalvandoEdit(false);
    }
  };

  const handleDeleteLivro = async (id: string) => {
    if (!confirm('Remover este livro da votação? Os votos associados também serão removidos.')) return;
    try {
      const res = await fetch(`/api/livros?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Livro removido.');
      loadDados();
    } catch {
      toast.error('Erro ao remover.');
    }
  };

  const handleArquivar = async (id: string, titulo: string) => {
    if (!confirm(`Mover "${titulo}" para a Curadoria? Ele sairá da votação e ficará no arquivo histórico.`)) return;
    try {
      const res = await fetch(`/api/livros?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: 'curadoria' }),
      });
      if (!res.ok) throw new Error();
      toast.success(`"${titulo}" arquivado na Curadoria!`);
      loadDados();
    } catch {
      toast.error('Erro ao arquivar.');
    }
  };

  if (loading) return <div className="p-20 text-center italic text-slate-400">Carregando...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 p-6 font-alice">

      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b pb-8 border-slate-100">
        <div>
          <h1 className="font-serif text-4xl italic text-slate-900">
            Urna <span style={{ color: 'var(--page-color)' }}>Literária</span>
          </h1>
          <p className="text-slate-500 mt-1 italic text-sm">{totalVotos} voto{totalVotos !== 1 ? 's' : ''} registrados · {livros.length} livro{livros.length !== 1 ? 's' : ''} em disputa</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          
          <button
            onClick={handleToggleAtiva}
            disabled={salvando}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
              ativa
                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {ativa ? <ToggleRight size={16}/> : <ToggleLeft size={16}/>}
            {ativa ? 'Votação Aberta' : 'Votação Fechada'}
          </button>

          {ativa && (
            <Button
              onClick={handleEncerrar}
              disabled={encerrando}
              variant="outline"
              className="rounded-full px-5 h-10 text-[10px] font-bold uppercase tracking-widest text-orange-700 border-orange-200 hover:bg-orange-50"
            >
              {encerrando ? <Loader2 size={14} className="animate-spin mr-1"/> : <XCircle size={14} className="mr-1"/>}
              Encerrar Rodada
            </Button>
          )}

          <Button
            onClick={() => setShowAddForm(s => !s)}
            className="rounded-full px-5 h-10 text-[10px] font-bold uppercase tracking-widest text-white"
            style={{ backgroundColor: 'var(--page-color)' }}
          >
            <Plus size={14} className="mr-1"/> Indicar Livro
          </Button>
        </div>
      </header>

      
      <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-3xl">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">Prazo:</span>
        <input
          value={prazo}
          onChange={e => setPrazo(e.target.value)}
          placeholder="Ex: 31 de março de 2026"
          className="flex-1 bg-transparent text-sm outline-none italic text-slate-700"
        />
        <button onClick={handleSalvarPrazo} disabled={salvando}
                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl text-white transition-opacity disabled:opacity-40"
                style={{ backgroundColor: 'var(--page-color)' }}>
          <Save size={12}/> Salvar
        </button>
      </div>

      
      {showAddForm && (
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 space-y-5 shadow-sm">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Adicionar Livro à Votação</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={novoLivro.titulo}
              onChange={e => setNovoLivro(v => ({ ...v, titulo: e.target.value }))}
              placeholder="Título *"
              className="w-full p-4 bg-slate-50 rounded-2xl text-sm outline-none font-alice italic"
            />
            <input
              value={novoLivro.autor}
              onChange={e => setNovoLivro(v => ({ ...v, autor: e.target.value }))}
              placeholder="Autora / Autor *"
              className="w-full p-4 bg-slate-50 rounded-2xl text-sm outline-none font-alice"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex gap-2">
              <button
                onClick={() => setNovoLivro(v => ({ ...v, uploadMode: false, capaUrl: '' }))}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${!novoLivro.uploadMode ? 'bg-slate-800 text-white border-slate-800' : 'text-slate-400 border-slate-200 hover:border-slate-400'}`}
              >
                <LinkIcon size={10} className="inline mr-1"/>URL
              </button>
              <button
                onClick={() => setNovoLivro(v => ({ ...v, uploadMode: true, capaUrl: '' }))}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${novoLivro.uploadMode ? 'bg-slate-800 text-white border-slate-800' : 'text-slate-400 border-slate-200 hover:border-slate-400'}`}
              >
                <Upload size={10} className="inline mr-1"/>Upload
              </button>
            </div>
            {!novoLivro.uploadMode ? (
              <div className="flex items-center gap-3">
                <input
                  value={novoLivro.capaUrl ?? ''}
                  onChange={e => setNovoLivro(v => ({ ...v, capaUrl: e.target.value }))}
                  placeholder="Link da capa (URL da imagem, opcional)"
                  className="flex-1 p-4 bg-slate-50 rounded-2xl text-sm outline-none font-alice"
                />
                {novoLivro.capaUrl && (
                  <img src={novoLivro.capaUrl} alt="preview" className="h-16 w-11 object-cover rounded-xl shadow"/>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <input ref={addFileRef} type="file" accept="image/*" className="hidden" onChange={handleAddFileChange}/>
                <button
                  onClick={() => addFileRef.current?.click()}
                  className="flex items-center gap-2 px-5 py-3 bg-slate-50 rounded-2xl text-sm text-slate-500 border border-dashed border-slate-200 hover:border-slate-400 transition-colors"
                >
                  <Upload size={14}/> Escolher arquivo
                </button>
                {novoLivro.capaUrl && (
                  <img src={novoLivro.capaUrl} alt="preview" className="h-16 w-11 object-cover rounded-xl shadow"/>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button onClick={handleAddLivro} disabled={adicionando}
                    className="rounded-2xl px-8 h-12 text-white text-[10px] font-bold uppercase tracking-widest"
                    style={{ backgroundColor: 'var(--page-color)' }}>
              {adicionando ? <Loader2 size={14} className="animate-spin"/> : <><Book size={14} className="mr-1"/> Adicionar</>}
            </Button>
            <Button onClick={() => setShowAddForm(false)} variant="ghost" className="rounded-2xl px-6 h-12 text-[10px]">Cancelar</Button>
          </div>
        </div>
      )}

      
      {totalVotos > 0 && vencedor && (
        <div className="relative overflow-hidden rounded-[3rem] p-10 border-2"
             style={{ borderColor: 'var(--page-color-40, #CC722240)', background: 'var(--page-color-08, #CC722208)' }}>
          <div className="flex items-center gap-3 mb-4">
            <Trophy size={18} style={{ color: 'var(--page-color)' }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em]" style={{ color: 'var(--page-color)' }}>Liderando com {Math.round((vencedor.votos / totalVotos) * 100)}%</span>
          </div>
          <div className="flex gap-6 items-center">
            {vencedor.capaUrl ? (
              <img src={vencedor.capaUrl} alt={vencedor.titulo} className="w-16 h-24 object-cover rounded-2xl shadow"/>
            ) : (
              <div className="w-16 h-24 bg-white/60 rounded-2xl flex items-center justify-center shrink-0">
                <Book size={20} className="opacity-20"/>
              </div>
            )}
            <div>
              <h2 className="text-3xl italic font-light text-slate-900">{vencedor.titulo}</h2>
              <p className="text-xs uppercase tracking-widest opacity-40 mt-1">por {vencedor.autor} · {vencedor.votos} voto{vencedor.votos !== 1 ? 's' : ''}</p>
              {vencedor.indicadoPor && <p className="text-xs italic opacity-30 mt-1">indicado por {vencedor.indicadoPor}</p>}
              {vencedor.linkCompra && (
                <a href={vencedor.linkCompra} target="_blank" rel="noopener noreferrer"
                   className="inline-flex items-center gap-1 mt-3 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full text-white"
                   style={{ backgroundColor: 'var(--page-color)' }}>
                  <ShoppingCart size={10}/> Onde Comprar
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      
      <section className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-2">
          <BarChart3 size={14}/> Livros em Disputa ({livros.length})
        </h3>

        {livros.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-slate-200 rounded-[2.5rem]">
            <p className="text-slate-400 italic">Nenhum livro na votação. Adicione o primeiro acima.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {livros.map((livro, idx) => {
              const pct = totalVotos > 0 ? Math.round((livro.votos / totalVotos) * 100) : 0;
              const isEditing = editando === livro.id;
              return (
                <div key={livro.id} className="bg-white border border-slate-100 rounded-4xl overflow-hidden group hover:shadow-sm transition-all">
                  
                  {!isEditing && (
                    <div className="p-5 flex items-center gap-5">
                      {idx === 0 && totalVotos > 0 && (
                        <Trophy size={16} style={{ color: 'var(--page-color)' }} className="shrink-0"/>
                      )}
                      {livro.capaUrl ? (
                        <img src={livro.capaUrl} alt={livro.titulo} className="w-12 h-16 object-cover rounded-xl shrink-0 shadow-sm"/>
                      ) : (
                        <div className="w-12 h-16 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                          <Book size={16} className="opacity-20"/>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg italic font-light text-slate-900 truncate">{livro.titulo}</h4>
                        <p className="text-xs uppercase tracking-widest opacity-40 text-slate-500">por {livro.autor}</p>
                        {livro.indicadoPor && <p className="text-[10px] italic opacity-30 text-slate-500">ind. por {livro.indicadoPor}</p>}
                        {livro.linkCompra && (
                          <a href={livro.linkCompra} target="_blank" rel="noopener noreferrer"
                             className="inline-flex items-center gap-1 mt-1 text-[9px] font-bold uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
                             style={{ color: 'var(--page-color)' }}>
                            <ShoppingCart size={9}/> link de compra
                          </a>
                        )}
                        <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700"
                               style={{ width: `${pct}%`, backgroundColor: 'var(--page-color)', opacity: idx === 0 ? 1 : 0.5 }}/>
                        </div>
                      </div>
                      <div className="text-center shrink-0">
                        <span className="text-2xl font-light italic" style={{ color: 'var(--page-color)' }}>{pct}%</span>
                        <p className="text-[10px] opacity-40 text-slate-500">{livro.votos} v.</p>
                      </div>
                      {isAdmin && (
                      <div className="flex gap-0.5 shrink-0">
                        <button onClick={() => abrirEdicao(livro)}
                                className="p-2.5 text-slate-300 hover:text-slate-600 transition-colors" title="Editar">
                          <Pencil size={15}/>
                        </button>
                        <button onClick={() => handleArquivar(livro.id, livro.titulo)}
                                className="p-2.5 text-slate-300 hover:text-amber-500 transition-colors" title="Arquivar na Curadoria">
                          <Archive size={15}/>
                        </button>
                        <button onClick={() => handleDeleteLivro(livro.id)}
                                className="p-2.5 text-slate-300 hover:text-red-400 transition-colors" title="Remover">
                          <Trash2 size={15}/>
                        </button>
                      </div>
                      )}
                    </div>
                  )}
                  
                  {isEditing && (
                    <div className="p-6 space-y-4 bg-slate-50">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Editando</span>
                        <button onClick={fecharEdicao} className="text-slate-300 hover:text-slate-600"><X size={16}/></button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input value={editForm.titulo ?? ''} onChange={e => setEditForm(v => ({ ...v, titulo: e.target.value }))}
                               placeholder="Título *" className="w-full p-3.5 bg-white rounded-2xl text-sm outline-none border border-slate-100 font-alice italic"/>
                        <input value={editForm.autor ?? ''} onChange={e => setEditForm(v => ({ ...v, autor: e.target.value }))}
                               placeholder="Autora / Autor *" className="w-full p-3.5 bg-white rounded-2xl text-sm outline-none border border-slate-100 font-alice"/>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <button onClick={() => setEditForm(v => ({ ...v, uploadMode: false }))}
                                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${!editForm.uploadMode ? 'bg-slate-800 text-white border-slate-800' : 'text-slate-400 border-slate-200 hover:border-slate-400'}`}>
                            <LinkIcon size={9} className="inline mr-1"/>URL
                          </button>
                          <button onClick={() => setEditForm(v => ({ ...v, uploadMode: true }))}
                                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${editForm.uploadMode ? 'bg-slate-800 text-white border-slate-800' : 'text-slate-400 border-slate-200 hover:border-slate-400'}`}>
                            <Upload size={9} className="inline mr-1"/>Upload
                          </button>
                        </div>
                        {!editForm.uploadMode ? (
                          <div className="flex items-center gap-3">
                            <input value={editForm.capaUrl ?? ''} onChange={e => setEditForm(v => ({ ...v, capaUrl: e.target.value }))}
                                   placeholder="URL da capa" className="flex-1 p-3.5 bg-white rounded-2xl text-sm outline-none border border-slate-100 font-alice"/>
                            {editForm.capaUrl && <img src={editForm.capaUrl} alt="preview" className="h-14 w-10 object-cover rounded-xl shadow"/>}
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            <input ref={editFileRef} type="file" accept="image/*" className="hidden" onChange={handleEditFileChange}/>
                            <button onClick={() => editFileRef.current?.click()}
                                    className="flex items-center gap-2 px-5 py-3 bg-white rounded-2xl text-sm text-slate-500 border border-dashed border-slate-200 hover:border-slate-400 transition-colors">
                              <Upload size={14}/> Escolher arquivo
                            </button>
                            {editForm.capaUrl && <img src={editForm.capaUrl} alt="preview" className="h-14 w-10 object-cover rounded-xl shadow"/>}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 px-4 py-3">
                        <ShoppingCart size={13} className="text-slate-300 shrink-0"/>
                        <input value={editForm.linkCompra ?? ''} onChange={e => setEditForm(v => ({ ...v, linkCompra: e.target.value }))}
                               placeholder="Link de compra / editora (opcional)" className="flex-1 text-sm outline-none font-alice"/>
                      </div>
                      <div className="flex gap-3">
                        <Button onClick={handleSalvarEdicao} disabled={salvandoEdit}
                                className="rounded-2xl px-6 h-10 text-white text-[10px] font-bold uppercase tracking-widest"
                                style={{ backgroundColor: 'var(--page-color)' }}>
                          {salvandoEdit ? <Loader2 size={13} className="animate-spin"/> : <><Save size={13} className="mr-1"/> Salvar</>}
                        </Button>
                        <Button onClick={fecharEdicao} variant="ghost" className="rounded-2xl px-5 h-10 text-[10px]">Cancelar</Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      
      {historico.length > 0 && (
        <section className="space-y-6 border-t border-slate-100 pt-10">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-2">
            <History size={14}/> Histórico de Votações ({historico.length})
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {historico.map(h => (
              <div key={h.id} className="bg-slate-50 rounded-4xl p-6 flex gap-5 items-center">
                <div className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0"
                     style={{ backgroundColor: 'var(--page-color-15, #CC722215)' }}>
                  <span className="text-sm font-bold" style={{ color: 'var(--page-color)' }}>{h.porcentagem}%</span>
                  <span className="text-[8px] opacity-40 uppercase">{h.totalVotos}v</span>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest opacity-30 text-slate-500">{h.periodo}</p>
                  <h4 className="text-lg italic font-light text-slate-900">{h.vencedorTitulo}</h4>
                  <p className="text-[10px] uppercase tracking-widest opacity-40">por {h.vencedorAutor}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
