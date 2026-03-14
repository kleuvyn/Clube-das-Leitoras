"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAdmin } from '@/lib/admin-context';
import { 
  Loader2, Plus, Upload, Trash2, Book, X, 
  ToggleLeft, ToggleRight, BarChart3, Pencil, History
} from 'lucide-react';

const rosaGabi = "#B04D4A";

// Função para conversão em Base64 - Crucial para o armazenamento das capas no banco
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function VotacoesAdmin() {
  const { isAdmin } = useAdmin();
  const [livros, setLivros] = useState<any[]>([]);
  const [historico, setHistorico] = useState<any[]>([]);
  const [ativa, setAtiva] = useState(false);
  const [prazo, setPrazo] = useState('');
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formLivro, setFormLivro] = useState({ 
    titulo: '', 
    autor: '', 
    capaUrl: '', 
    linkCompra: '' 
  });

  const loadDados = useCallback(async () => {
    try {
      const res = await fetch('/api/votacao');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAtiva(data.ativa);
      setPrazo(data.prazo || '');
      setLivros(data.livros || []);
      setHistorico(data.historico || []);
    } catch {
      toast.error('Erro ao carregar dados da urna.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDados(); }, [loadDados]);

  const totalVotos = livros.reduce((acc, l) => acc + (l.votos || 0), 0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setFormLivro(prev => ({ ...prev, capaUrl: base64 }));
      } catch {
        toast.error("Erro ao processar imagem.");
      }
    }
  };

  const handleToggleAtiva = async () => {
    setProcessando(true);
    try {
      const res = await fetch('/api/votacao', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativa: !ativa, prazo }),
      });
      if (!res.ok) throw new Error();
      setAtiva(!ativa);
      toast.success(!ativa ? 'Urna aberta para a comunidade!' : 'Votação pausada.');
    } catch { 
      toast.error('Falha ao alterar status da urna.'); 
    } finally { 
      setProcessando(false); 
    }
  };

  const handleSalvarPrazo = async () => {
    setProcessando(true);
    try {
      const res = await fetch('/api/votacao', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativa, prazo }),
      });
      if (!res.ok) throw new Error();
      toast.success('Prazo de votação atualizado.');
    } catch { 
      toast.error('Erro ao salvar prazo.'); 
    } finally { 
      setProcessando(false); 
    }
  };

  const handleOpenEdit = (livro: any) => {
    setEditandoId(livro.id);
    setFormLivro({
      titulo: livro.titulo,
      autor: livro.autor,
      capaUrl: livro.capaUrl || '',
      linkCompra: livro.linkCompra || ''
    });
    setShowModal(true);
  };

  const handleOpenAdd = () => {
    setEditandoId(null);
    setFormLivro({ titulo: '', autor: '', capaUrl: '', linkCompra: '' });
    setShowModal(true);
  };

  const handleSalvar = async () => {
    if (!formLivro.titulo || !formLivro.autor) return toast.error('Título e Autor são obrigatórios.');
    setProcessando(true);
    try {
      const url = editandoId ? `/api/livros?id=${editandoId}` : '/api/livros';
      const res = await fetch(url, {
        method: editandoId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formLivro, isVotacao: true }),
      });
      if (!res.ok) throw new Error();
      toast.success(editandoId ? 'Dados atualizados.' : 'Obra adicionada à urna.');
      setShowModal(false);
      loadDados();
    } catch { 
      toast.error('Erro ao salvar informações da obra.'); 
    } finally { 
      setProcessando(false); 
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente remover esta obra da votação atual?')) return;
    try {
      const res = await fetch(`/api/livros?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Obra removida.');
      loadDados();
    } catch { 
      toast.error('Erro ao deletar.'); 
    }
  };

  const handleEncerrar = async () => {
    if (!confirm('Isso arquivará o vencedor no histórico e limpará a urna para o próximo ciclo. Continuar?')) return;
    setProcessando(true);
    try {
      const periodo = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      const res = await fetch('/api/votacao', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encerrar: true, periodo }),
      });
      if (!res.ok) throw new Error();
      toast.success('Rodada encerrada e arquivada com sucesso.');
      loadDados();
    } catch { 
      toast.error('Erro ao finalizar ciclo.'); 
    } finally { 
      setProcessando(false); 
    }
  };

  if (loading) return <div className="p-20 text-center italic text-slate-400 font-alice">Sincronizando Urna Literária...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 font-alice text-[#1A1A1A] space-y-12 pb-20">
      
      {/* HEADER EDITORIAL */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b pb-8 border-slate-100">
        <div>
          <h1 className="text-4xl italic font-light tracking-tight">
            Urna <span style={{ color: rosaGabi }} className="not-italic font-medium">Literária</span>
          </h1>
          <p className="text-slate-500 mt-1 italic text-sm">Curadoria Elas nas Exatas — {totalVotos} participações</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={handleToggleAtiva} 
            disabled={processando} 
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${ativa ? 'bg-green-50 text-green-700 border-green-200 shadow-sm' : 'bg-slate-50 text-slate-400 border-slate-200'}`}
          >
            {ativa ? <ToggleRight size={16}/> : <ToggleLeft size={16}/>}
            {ativa ? 'Votação Aberta' : 'Votação Pausada'}
          </button>
          
          <Button 
            onClick={handleOpenAdd} 
            className="rounded-full px-8 h-10 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg transition-transform active:scale-95" 
            style={{ backgroundColor: rosaGabi }}
          >
            <Plus size={14} className="mr-2"/> Adicionar Livro
          </Button>

          {ativa && (
            <Button 
              onClick={handleEncerrar} 
              disabled={processando} 
              variant="outline" 
              className="rounded-full px-5 h-10 text-[10px] font-bold uppercase tracking-widest text-orange-700 border-orange-200 hover:bg-orange-50"
            >
              <History size={14} className="mr-2"/> Encerrar Ciclo
            </Button>
          )}
        </div>
      </header>

      {/* PRAZO DA RODADA */}
      <div className="flex items-center gap-4 bg-[#F5F2ED]/50 p-6 rounded-3xl border border-slate-100">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Exibição do Prazo:</span>
        <input 
          value={prazo} 
          onChange={e => setPrazo(e.target.value)} 
          placeholder="Ex: Abril de 2026" 
          className="flex-1 bg-transparent text-sm outline-none italic font-medium text-[#1A1A1A]" 
        />
        <button 
          onClick={handleSalvarPrazo} 
          className="px-6 py-2 rounded-xl text-white bg-slate-800 text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-colors"
        >
          Atualizar
        </button>
      </div>

      {/* RANKING DE CURADORIA */}
      <section className="space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 flex items-center gap-2">
          <BarChart3 size={14}/> Preferências Atuais
        </h3>
        
        <div className="grid grid-cols-1 gap-4">
          {livros.map((livro, idx) => {
            const pct = totalVotos > 0 ? Math.round((livro.votos / totalVotos) * 100) : 0;
            return (
              <div key={livro.id} className="bg-white p-5 rounded-[2.5rem] border border-slate-100 flex items-center gap-6 group hover:shadow-md transition-shadow">
                <div className="w-16 h-24 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100 shadow-sm">
                  {livro.capaUrl ? (
                    <img src={livro.capaUrl} className="w-full h-full object-cover" alt={livro.titulo} />
                  ) : (
                    <div className="flex items-center justify-center h-full opacity-10"><Book size={20} /></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-serif text-xl italic truncate text-[#1A1A1A]">{livro.titulo}</h3>
                    <span className="text-sm font-bold text-slate-300 italic">{pct}%</span>
                  </div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Escrito por {livro.autor}</p>
                  <div className="mt-3 h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-1000 ease-out" 
                      style={{ width: `${pct}%`, backgroundColor: idx === 0 ? rosaGabi : '#D1D5DB' }} 
                    />
                  </div>
                </div>

                <div className="flex gap-1 shrink-0">
                  <button onClick={() => handleOpenEdit(livro)} className="p-3 text-slate-300 hover:text-slate-600 transition-colors">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => handleDelete(livro.id)} className="p-3 text-slate-300 hover:text-rose-400 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* MODAL DE EDIÇÃO / ADIÇÃO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FDFCFB] rounded-[3rem] shadow-2xl max-w-4xl w-full flex flex-col md:flex-row overflow-hidden max-h-[90vh] animate-in fade-in zoom-in duration-300">
            
            <aside className="w-full md:w-72 bg-[#F5F2ED] p-10 flex flex-col items-center justify-center border-r border-slate-100">
              <div onClick={() => fileInputRef.current?.click()} className="relative w-40 aspect-[3/4] cursor-pointer shadow-2xl group overflow-hidden rounded-2xl bg-white border-2 border-dashed border-slate-200 flex items-center justify-center hover:border-[#B04D4A] transition-colors">
                {formLivro.capaUrl ? (
                  <img src={formLivro.capaUrl} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <Upload className="mx-auto mb-2 opacity-20" />
                    <span className="text-[8px] uppercase font-bold tracking-widest opacity-30">Capa do Livro</span>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
              </div>
              <p className="text-[9px] text-slate-400 mt-6 uppercase tracking-widest font-bold">Upload de Imagem</p>
            </aside>

            <div className="flex-1 p-12 space-y-8 overflow-y-auto bg-white">
              <div className="flex justify-between items-center">
                <h2 className="font-serif text-2xl italic text-[#1A1A1A]">{editandoId ? 'Editar Escolha' : 'Nova Obra para Urna'}</h2>
                <button onClick={() => setShowModal(false)} className="text-slate-300 hover:text-black transition-colors"><X size={24}/></button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-bold text-slate-400 ml-2">Título da Obra</label>
                  <input 
                    value={formLivro.titulo} 
                    onChange={e => setFormLivro({...formLivro, titulo: e.target.value})} 
                    placeholder="Ex: A Coragem de Ser Imperfeito" 
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none italic focus:bg-white focus:border-slate-200 transition-all" 
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-bold text-slate-400 ml-2">Autor(a)</label>
                  <input 
                    value={formLivro.autor} 
                    onChange={e => setFormLivro({...formLivro, autor: e.target.value})} 
                    placeholder="Ex: Brené Brown" 
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-slate-200 transition-all" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-bold text-slate-400 ml-2">Link para Aquisição (Opcional)</label>
                  <input 
                    value={formLivro.linkCompra} 
                    onChange={e => setFormLivro({...formLivro, linkCompra: e.target.value})} 
                    placeholder="URL da Amazon ou Livraria" 
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-xs focus:bg-white focus:border-slate-200 transition-all" 
                  />
                </div>
              </div>

              <Button 
                onClick={handleSalvar} 
                disabled={processando} 
                className="w-full h-14 rounded-2xl text-white font-bold uppercase tracking-widest shadow-xl transition-all active:scale-95" 
                style={{ backgroundColor: rosaGabi }}
              >
                {processando ? <Loader2 className="animate-spin" /> : 'Confirmar e Publicar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}