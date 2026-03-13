"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Trash2, Calendar, MessageSquare, Plus, 
  Loader2, Clock, Trash, AlertCircle, Video,
  Image as ImageIcon, Youtube, FileText,
  Save, CheckCircle, Upload, Edit3, X, Check,
  ShieldAlert, ShieldCheck, AlertTriangle, Filter
} from 'lucide-react';
import { analyzeContentModeration } from '@/lib/content-moderation';

const vermelhoTerracota = "var(--page-color)";

interface EncontroCardProps {
  enc: Encontro;
  isEncerrado?: boolean;
  editandoId: string | null;
  editData: Partial<Encontro>;
  uploadingImg: boolean;
  setEditData: React.Dispatch<React.SetStateAction<Partial<Encontro>>>;
  setEditandoId: (id: string | null) => void;
  startEdit: (enc: Encontro) => void;
  handleSalvarEdicao: (id: string) => void;
  handleEncerrar: (id: string) => void;
  handleReativar: (id: string) => void;
  handleDelete: (id: string) => void;
  handleUploadImagem: (file: File, paraEdicao?: boolean) => void;
}

function EncontroCard({
  enc, isEncerrado = false, editandoId, editData, uploadingImg,
  setEditData, setEditandoId, startEdit, handleSalvarEdicao,
  handleEncerrar, handleReativar, handleDelete, handleUploadImagem,
}: EncontroCardProps) {
  const editando = editandoId === enc.id;
  return (
    <div className={`p-6 bg-white border rounded-[2.5rem] shadow-sm flex flex-col gap-4 ${isEncerrado ? 'opacity-70 border-slate-100' : 'border-slate-50'}`}>
      {editando ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Data/Hora */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Data/Hora</label>
            <input
              value={(editData as any).data ?? ''}
              onChange={e => setEditData(p => ({ ...p, data: e.target.value }))}
              placeholder="ex: 15/04 às 19:30"
              className="w-full p-3 bg-slate-50 rounded-xl text-sm outline-none border border-slate-100"
            />
          </div>
          {/* Tema — textarea para não limitar a escrita */}
          <div className="space-y-1 md:col-span-2">
            <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Tema / Capítulo</label>
            <textarea
              value={(editData as any).tema ?? ''}
              onChange={e => setEditData(p => ({ ...p, tema: e.target.value }))}
              placeholder="ex: Cap 1 - La Loba"
              rows={2}
              className="w-full p-3 bg-slate-50 rounded-xl text-sm outline-none border border-slate-100 resize-y"
            />
          </div>
          {/* Links */}
          {[
            { label: 'Link Meet', key: 'linkMeet', placeholder: 'Link da reunião' },
            { label: 'Link Live', key: 'linkLive', placeholder: 'Link da gravação' },
            { label: 'Link Drive', key: 'linkDrive', placeholder: 'Link Drive/PDF' },
          ].map(({ label, key, placeholder }) => (
            <div key={key} className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">{label}</label>
              <input
                value={(editData as any)[key] ?? ''}
                onChange={e => setEditData(p => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full p-3 bg-slate-50 rounded-xl text-sm outline-none border border-slate-100"
              />
            </div>
          ))}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Imagem</label>
            <div className="flex gap-2">
              <input
                value={editData.imagem ?? ''}
                onChange={e => setEditData(p => ({ ...p, imagem: e.target.value }))}
                placeholder="URL ou faça upload"
                className="flex-1 p-3 bg-slate-50 rounded-xl text-sm outline-none border border-slate-100"
              />
              <label className="cursor-pointer p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-50">
                {uploadingImg ? <Loader2 size={13} className="animate-spin text-slate-400"/> : <Upload size={13} className="text-slate-400"/>}
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => e.target.files?.[0] && handleUploadImagem(e.target.files[0], true)} />
              </label>
            </div>
          </div>
          <div className="md:col-span-2 flex gap-3 justify-end mt-2">
            <button onClick={() => setEditandoId(null)} className="flex items-center gap-1 px-4 py-2 text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase">
              <X size={12}/> Cancelar
            </button>
            <button onClick={() => handleSalvarEdicao(enc.id)} className="flex items-center gap-1 px-5 py-2 text-[10px] font-bold text-white uppercase rounded-xl" style={{ backgroundColor: vermelhoTerracota }}>
              <Check size={12}/> Salvar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex gap-4">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden shrink-0 border border-slate-50">
              {enc.imagem && <img src={enc.imagem} alt="" className="w-full h-full object-cover"/>}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-slate-300">{enc.data}</span>
              <h5 className="text-lg font-bold text-slate-700 font-serif italic">{enc.tema}</h5>
              <div className="flex gap-3 mt-2">
                {enc.linkMeet && <Video size={14} className="text-blue-500" title="Meet"/>}
                {enc.linkLive && <Youtube size={14} className="text-red-500" title="Live"/>}
                {enc.linkDrive && <FileText size={14} className="text-emerald-500" title="Drive"/>}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-1 self-start">
            <button onClick={() => startEdit(enc)} className="text-slate-300 hover:text-blue-500 p-2 transition-colors" title="Editar">
              <Edit3 size={16}/>
            </button>
            {isEncerrado ? (
              <button onClick={() => handleReativar(enc.id)} className="text-slate-300 hover:text-emerald-500 p-2 transition-colors" title="Reativar">
                <CheckCircle size={16}/>
              </button>
            ) : (
              <button onClick={() => handleEncerrar(enc.id)} className="text-slate-300 hover:text-amber-500 p-2 transition-colors" title="Marcar como encerrado">
                <Clock size={16}/>
              </button>
            )}
            <button onClick={() => handleDelete(enc.id)} className="text-slate-200 hover:text-rose-500 p-2 transition-colors" title="Excluir">
              <Trash2 size={16}/>
            </button>
          </div>
        </div>
      )}
    </div>
  );
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

interface Encontro {
  id: string;
  data: string;
  tema: string;
  linkMeet: string | null;
  linkLive: string | null;
  linkDrive: string | null;
  imagem: string | null;
  status: string;
}

interface Reflexao {
  id: string;
  leituraId: string | null;
  autoraNome: string;
  autoraEmail: string | null;
  texto: string;
  createdAt: string;
}

export default function LeituraAtivaAdmin() {
  const [loading, setLoading] = useState(true);
  const [encontros, setEncontros] = useState<Encontro[]>([]);
  const [encerrados, setEncerrados] = useState<Encontro[]>([]);
  const [reflexoes, setReflexoes] = useState<Reflexao[]>([]);
  const [uploadingImg, setUploadingImg] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Encontro>>();

  const [novoEncontro, setNovoEncontro] = useState({ 
    data: '', tema: '', linkMeet: '', linkLive: '', linkDrive: '', imagem: '' 
  });

  
  const [filtroMod, setFiltroMod] = useState<'todos' | 'suspeitos'>('todos');
  const [extras, setExtras] = useState<string[]>([]);
  const [novaPalavra, setNovaPalavra] = useState('');
  const [savingFilter, setSavingFilter] = useState(false);
  const [termsBase, setTermsBase] = useState<string[]>([]);

  const loadFiltro = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/moderacao');
      if (!res.ok) return;
      const data = await res.json();
      setExtras(data.extras ?? []);
      setTermsBase(data.termsBase ?? []);
    } catch {}
  }, []);

  const loadDados = async () => {
    setLoading(true);
    try {
      const [leitRes, refRes] = await Promise.all([
        fetch('/api/leitura'),
        fetch('/api/leitura/reflexoes'),
      ]);
      const leitData = await leitRes.json();
      const refData = await refRes.json();
      setEncontros(Array.isArray(leitData.encontros) ? leitData.encontros : []);
      setEncerrados(Array.isArray(leitData.encerrados) ? leitData.encerrados : []);
      setReflexoes(Array.isArray(refData) ? refData : []);
    } catch {
      toast.error("Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDados(); loadFiltro(); }, [loadFiltro]);

  const handleUploadImagem = async (file: File, paraEdicao = false) => {
    setUploadingImg(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      if (paraEdicao) setEditData(p => ({ ...p, imagem: url }));
      else setNovoEncontro(p => ({ ...p, imagem: url }));
      toast.success('Imagem enviada!');
    } catch {
      toast.error('Erro ao fazer upload.');
    } finally {
      setUploadingImg(false);
    }
  };

  const handleAddEncontro = async () => {
    if (!novoEncontro.data || !novoEncontro.tema) return toast.error("Preencha ao menos data e tema!");
    try {
      const res = await fetch('/api/leitura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoEncontro),
      });
      if (res.ok) {
        toast.success("Encontro publicado!");
        setNovoEncontro({ data: '', tema: '', linkMeet: '', linkLive: '', linkDrive: '', imagem: '' });
        loadDados();
      } else toast.error("Erro ao publicar.");
    } catch { toast.error("Erro de conexão."); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este encontro permanentemente?')) return;
    try {
      const res = await fetch(`/api/leitura?id=${id}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Excluído.'); loadDados(); }
      else toast.error('Erro ao excluir.');
    } catch { toast.error('Erro de conexão.'); }
  };

  const handleEncerrar = async (id: string) => {
    try {
      const res = await fetch(`/api/leitura?id=${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'encerrado' }),
      });
      if (res.ok) { toast.success('Marcado como encerrado.'); loadDados(); }
      else toast.error('Erro ao encerrar.');
    } catch { toast.error('Erro de conexão.'); }
  };

  const handleReativar = async (id: string) => {
    try {
      const res = await fetch(`/api/leitura?id=${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ativo' }),
      });
      if (res.ok) { toast.success('Reativado.'); loadDados(); }
      else toast.error('Erro ao reativar.');
    } catch { toast.error('Erro de conexão.'); }
  };

  const handleSalvarEdicao = async (id: string) => {
    try {
      const res = await fetch(`/api/leitura?id=${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      if (res.ok) { toast.success('Salvo!'); setEditandoId(null); loadDados(); }
      else toast.error('Erro ao salvar.');
    } catch { toast.error('Erro de conexão.'); }
  };

  const handleDeleteReflexao = async (id: string) => {
    try {
      const res = await fetch(`/api/leitura/reflexoes?id=${id}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Reflexão removida.'); loadDados(); }
      else toast.error('Erro ao remover.');
    } catch { toast.error('Erro de conexão.'); }
  };

  const startEdit = (enc: Encontro) => {
    setEditandoId(enc.id);
    setEditData({ data: enc.data, tema: enc.tema, linkMeet: enc.linkMeet ?? '', linkLive: enc.linkLive ?? '', linkDrive: enc.linkDrive ?? '', imagem: enc.imagem ?? '' });
  };

  const handleAddPalavra = () => {
    const p = novaPalavra.trim().toLowerCase();
    if (!p || extras.includes(p)) return;
    setExtras(prev => [...prev, p]);
    setNovaPalavra('');
  };

  const handleRemovePalavra = (p: string) => setExtras(prev => prev.filter(e => e !== p));

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
    } catch {
      toast.error('Erro ao salvar o filtro.');
    } finally {
      setSavingFilter(false);
    }
  };

  const suspeitos = reflexoes.filter(r => analyzeContentModeration(`${r.autoraNome} ${r.texto}`).score > 0);
  const reflexoesFiltradas = filtroMod === 'suspeitos' ? suspeitos : reflexoes;

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20 font-alice text-slate-900">
      
      <header className="flex justify-between items-center border-b pb-6" style={{ borderColor: `${vermelhoTerracota}20` }}>
        <div>
          <h1 className="font-serif text-4xl italic text-slate-900">
            Gestão da <span style={{ color: vermelhoTerracota }}>Leitura Ativa</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">Materiais, encontros e reflexões do ciclo.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#8B2F2F] text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          Lobas 2026
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin opacity-20" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-2 mb-4">
                <Plus size={14} style={{ color: vermelhoTerracota }} /> Novo Encontro
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#FDFBF9] p-8 rounded-[2.5rem] border border-red-50">
                {[
                  { label: 'Data/Hora', key: 'data', placeholder: 'ex: 15/04 às 19:30' },
                  { label: 'Capítulo / Tema', key: 'tema', placeholder: 'ex: Cap 1 - La Loba' },
                  { label: 'Link do Meet', key: 'linkMeet', placeholder: 'Link da reunião ao vivo' },
                  { label: 'Link Drive (PDF/Pasta)', key: 'linkDrive', placeholder: 'Link do Drive' },
                  { label: 'Link da Live / Gravação', key: 'linkLive', placeholder: 'Link da live gravada' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key} className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase ml-2">{label}</label>
                    <input
                      value={(novoEncontro as any)[key]}
                      onChange={e => setNovoEncontro({ ...novoEncontro, [key]: e.target.value })}
                      placeholder={placeholder}
                      className="w-full p-4 bg-white rounded-2xl text-sm outline-none border border-slate-100"
                    />
                  </div>
                ))}

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase ml-2 flex items-center gap-1">
                    <ImageIcon size={10}/> Imagem da Capa
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={novoEncontro.imagem}
                      onChange={e => setNovoEncontro({ ...novoEncontro, imagem: e.target.value })}
                      placeholder="URL ou faça upload"
                      className="flex-1 p-4 bg-white rounded-2xl text-sm outline-none border border-slate-100"
                    />
                    <label className="cursor-pointer flex items-center gap-1 px-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors text-slate-400 text-[10px] font-bold uppercase whitespace-nowrap">
                      {uploadingImg ? <Loader2 size={12} className="animate-spin"/> : <Upload size={12}/>}
                      <span className="hidden md:inline">Upload</span>
                      <input type="file" accept="image/*" className="hidden" ref={imgRef}
                        onChange={e => e.target.files?.[0] && handleUploadImagem(e.target.files[0])} />
                    </label>
                  </div>
                  {novoEncontro.imagem && (
                    <img src={novoEncontro.imagem} alt="preview" className="mt-2 h-20 object-cover rounded-2xl"/>
                  )}
                </div>

                <Button
                  onClick={handleAddEncontro}
                  className="md:col-span-2 h-14 rounded-2xl text-white font-bold uppercase text-[10px] tracking-widest border-none shadow-lg mt-2"
                  style={{ backgroundColor: vermelhoTerracota }}
                >
                  <Save size={16} className="mr-2"/> Publicar Encontro
                </Button>
              </div>

              
              <div className="space-y-4 pt-4">
                <h4 className="text-[9px] font-bold text-slate-300 uppercase tracking-widest border-b pb-2">
                  Encontros Ativos ({encontros.length})
                </h4>
                <div className="grid gap-4">
                  {encontros.length === 0 ? (
                    <p className="text-slate-300 italic text-sm text-center py-4">Nenhum encontro ativo.</p>
                  ) : encontros.map(enc => <EncontroCard key={enc.id} enc={enc} editandoId={editandoId} editData={editData} uploadingImg={uploadingImg} setEditData={setEditData} setEditandoId={setEditandoId} startEdit={startEdit} handleSalvarEdicao={handleSalvarEdicao} handleEncerrar={handleEncerrar} handleReativar={handleReativar} handleDelete={handleDelete} handleUploadImagem={handleUploadImagem}/>)}
                </div>
              </div>

              
              {encerrados.length > 0 && (
                <div className="space-y-4 pt-4">
                  <h4 className="text-[9px] font-bold text-slate-300 uppercase tracking-widest border-b pb-2">
                    Histórico Encerrado ({encerrados.length})
                  </h4>
                  <div className="grid gap-4">
                    {encerrados.map(enc => <EncontroCard key={enc.id} enc={enc} isEncerrado editandoId={editandoId} editData={editData} uploadingImg={uploadingImg} setEditData={setEditData} setEditandoId={setEditandoId} startEdit={startEdit} handleSalvarEdicao={handleSalvarEdicao} handleEncerrar={handleEncerrar} handleReativar={handleReativar} handleDelete={handleDelete} handleUploadImagem={handleUploadImagem}/>)}
                  </div>
                </div>
              )}
            </section>
          </div>

          
          <aside className="space-y-8">
            
            <section className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--page-color-20)' }}>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                  <MessageSquare size={14} style={{ color: vermelhoTerracota }}/> Bate-Papo das Leitoras
                </h3>
                <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{reflexoes.length}</span>
              </div>

              
              <div className="flex gap-2">
                <button onClick={() => setFiltroMod('todos')} className={`flex-1 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all ${filtroMod === 'todos' ? 'text-white' : 'bg-slate-50 text-slate-400'}`} style={filtroMod === 'todos' ? { backgroundColor: vermelhoTerracota } : {}}>
                  Todos
                </button>
                <button onClick={() => setFiltroMod('suspeitos')} className={`flex-1 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${filtroMod === 'suspeitos' ? 'bg-amber-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
                  <AlertTriangle size={9}/> Suspeitos {suspeitos.length > 0 && `(${suspeitos.length})`}
                </button>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {reflexoesFiltradas.length === 0 ? (
                  <p className="text-slate-300 italic text-sm text-center py-4">
                    {filtroMod === 'suspeitos' ? 'Nenhuma mensagem suspeita.' : 'Sem reflexões ainda.'}
                  </p>
                ) : reflexoesFiltradas.map(ref => (
                  <div key={ref.id} className="p-4 bg-[#FDFBF9] rounded-2xl space-y-2 group relative border border-red-50/50">
                    <div className="flex justify-between items-start gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black text-slate-400 uppercase">{ref.autoraNome}</span>
                        <ModerationBadge texto={ref.texto} nome={ref.autoraNome} />
                      </div>
                      <button onClick={() => handleDeleteReflexao(ref.id)} className="opacity-0 group-hover:opacity-100 text-rose-400 p-1 transition-opacity shrink-0" title="Remover">
                        <Trash size={14}/>
                      </button>
                    </div>
                    <p className="text-[11px] italic text-slate-600 leading-relaxed font-medium">"{ref.texto}"</p>
                    <span className="text-[9px] text-slate-300">{new Date(ref.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                ))}
              </div>
            </section>

            
            <section className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--page-color-20)' }}>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                  <Filter size={14} style={{ color: vermelhoTerracota }}/> Filtro de Palavras Ofensivas
                </h3>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Base padrão ({termsBase.length} termos)</p>
                <div className="flex flex-wrap gap-1.5">
                  {termsBase.map(t => <span key={t} className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-400 text-[8px] font-mono">{t}</span>)}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Extras personalizados</p>
                <div className="flex gap-2">
                  <input
                    value={novaPalavra}
                    onChange={e => setNovaPalavra(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddPalavra()}
                    placeholder="Nova palavra..."
                    className="flex-1 p-3 bg-slate-50 rounded-xl text-sm outline-none border border-slate-100"
                  />
                  <button onClick={handleAddPalavra} className="p-3 rounded-xl text-white" style={{ backgroundColor: vermelhoTerracota }}>
                    <Plus size={14}/>
                  </button>
                </div>
                {extras.length === 0 ? (
                  <p className="text-[10px] text-slate-300 italic text-center py-1">Nenhuma palavra extra.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {extras.map(p => (
                      <span key={p} className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50 text-rose-600 text-[9px] font-bold border border-rose-100">
                        {p}<button onClick={() => handleRemovePalavra(p)} className="hover:text-rose-800"><X size={9}/></button>
                      </span>
                    ))}
                  </div>
                )}
                <Button onClick={handleSaveFiltro} disabled={savingFilter} className="w-full h-10 rounded-xl text-white text-[10px] font-bold uppercase tracking-wider border-none mt-1" style={{ backgroundColor: vermelhoTerracota }}>
                  {savingFilter ? <Loader2 size={12} className="animate-spin"/> : <><Save size={11} className="mr-1.5"/> Salvar Filtro</>}
                </Button>
              </div>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
