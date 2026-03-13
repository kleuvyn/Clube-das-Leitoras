"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Plus, Trash2, Edit3, 
  UploadCloud, Loader2, Save, 
  Image as ImageIcon, Check, RotateCcw, BookOpen, Upload
} from 'lucide-react';

const lavandaPrincipal = "var(--page-color)";
const roxoEscuro = "var(--page-color)";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const DIAS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));

function AdminContent() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [agenda, setAgenda] = useState<any[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [configGeral, setConfigGeral] = useState({
    calendarioImagem: '', 
    livroDoMes: '',
    ano: new Date().getFullYear(),
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [editandoMes, setEditandoMes] = useState({
    index: -1, 
    mes: 'Janeiro',
    dia: '01',
    livro: ''
  });

  const loadDados = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cronograma');
      if (res.ok) {
        const dataArray = await res.json();
        const data = Array.isArray(dataArray)
          ? (dataArray.find((r: any) => r.status === 'ativo') ?? dataArray[0])
          : dataArray;

        if (data) {
          setCurrentId(data.id);
          const imageUrlSalva = (data.imageUrl || '').startsWith('blob:') ? '' : (data.imageUrl || '');
          setConfigGeral({
            calendarioImagem: imageUrlSalva,
            livroDoMes: data.title || '',
            ano: data.ano ?? new Date().getFullYear(),
          });
          if (data.notes) {
            try { setAgenda(JSON.parse(data.notes)); } catch { setAgenda([]); }
          }
        }
      }
    } catch (e) {
      toast.error("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDados(); }, []);

  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setConfigGeral(prev => ({ ...prev, calendarioImagem: previewUrl }));
      toast.info("Imagem selecionada. Clique em 'Salvar Imagem' para confirmar.");
    }
  };

  
  const handleSaveImage = async () => {
    if (!selectedFile) return toast.error("Selecione uma imagem primeiro.");
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      
      const res = await fetch('/api/upload', { 
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      
      setConfigGeral(prev => ({ ...prev, calendarioImagem: data.url }));
      setSelectedFile(null);
      toast.success("Imagem salva com sucesso!");
    } catch (e) {
      toast.error("Erro ao fazer upload da imagem.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSalvarLista = () => {
    if (!editandoMes.livro) return toast.error("O nome da leitura é obrigatório.");
    if (editandoMes.index > -1) {
      const novaAgenda = [...agenda];
      novaAgenda[editandoMes.index] = { mes: editandoMes.mes, dia: editandoMes.dia, livro: editandoMes.livro };
      setAgenda(novaAgenda);
    } else {
      setAgenda([...agenda, { mes: editandoMes.mes, dia: editandoMes.dia, livro: editandoMes.livro }]);
    }
    setEditandoMes({ index: -1, mes: 'Janeiro', dia: '01', livro: '' });
  };

  const handlePublicarNoBanco = async () => {
    setIsSaving(true);

    let imageUrl = configGeral.calendarioImagem;
    
    if (imageUrl.startsWith('blob:')) imageUrl = '';

    
    if (selectedFile) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      try {
        const upRes = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!upRes.ok) throw new Error();
        const upData = await upRes.json();
        imageUrl = upData.url;
        setConfigGeral(prev => ({ ...prev, calendarioImagem: upData.url }));
        setSelectedFile(null);
      } catch {
        toast.error("Erro ao fazer upload da imagem.");
        setIsSaving(false);
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    const payload = {
      title: configGeral.livroDoMes,
      imageUrl,
      notes: JSON.stringify(agenda),
      ano: configGeral.ano,
      status: 'ativo'
    };

    try {
      const method = currentId ? 'PATCH' : 'POST';
      const url = currentId ? `/api/cronograma?id=${currentId}` : '/api/cronograma';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || `Erro ${res.status}`);
      }
      toast.success("Cronograma publicado!");
      loadDados();
    } catch (e: any) {
      toast.error(e?.message || "Erro ao publicar cronograma.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center italic text-slate-400">Carregando...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 p-6 font-sans">
      <header className="flex flex-col md:flex-row justify-between items-center border-b pb-8 gap-4" style={{ borderColor: 'var(--page-color-20)' }}>
        <div>
          <h1 className="text-4xl italic text-slate-900 font-serif">Painel <span style={{ color: lavandaPrincipal }}>Administrativo</span></h1>
          <p className="text-slate-500 mt-1 italic">Gerencie o conteúdo do Clube.</p>
        </div>
        <Button onClick={handlePublicarNoBanco} disabled={isSaving} className="rounded-full px-10 h-14 text-white font-bold uppercase text-xs tracking-widest shadow-2xl" style={{ backgroundColor: roxoEscuro }}>
          {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
          Publicar Cronograma
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        <div className="space-y-6">
          <section className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 border-b pb-4">Capa do Mês</h3>
            
            <div className="space-y-4">
              <input 
                value={configGeral.livroDoMes} 
                onChange={e => setConfigGeral({...configGeral, livroDoMes: e.target.value})} 
                placeholder="Livro em Destaque" 
                className="w-full p-4 bg-[#FDFBF9] rounded-2xl text-sm outline-none border border-slate-50 focus:outline-none" 
              />

              <div className="flex items-center gap-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 shrink-0">Ano</label>
                <input
                  type="number"
                  value={configGeral.ano}
                  onChange={e => setConfigGeral({...configGeral, ano: Number(e.target.value)})}
                  className="flex-1 p-4 bg-[#FDFBF9] rounded-2xl text-sm outline-none border border-slate-50 font-bold text-slate-700"
                  min={2020}
                  max={2040}
                />
              </div>

              
              <div 
                onClick={() => fileInputRef.current?.click()} 
                className="relative group rounded-3xl overflow-hidden border-4 border-white shadow-lg cursor-pointer aspect-4/3 bg-slate-50 flex items-center justify-center transition-all hover:border-rose-100"
              >
                {configGeral.calendarioImagem ? (
                  <>
                    <img src={configGeral.calendarioImagem} className="w-full h-full object-cover" alt="Preview" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                      <RotateCcw size={24} />
                      <span className="text-[10px] mt-2 font-bold">TROCAR ARQUIVO</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <UploadCloud size={40} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-[10px] font-bold text-slate-400">SELECIONAR ARTE (4:3)</p>
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

              
              <Button 
                onClick={handleSaveImage} 
                disabled={!selectedFile || isUploading} 
                className="w-full rounded-2xl h-12 text-white font-bold text-[10px] tracking-widest uppercase"
                style={{ backgroundColor: lavandaPrincipal }}
              >
                {isUploading ? <Loader2 className="animate-spin mr-2" size={14} /> : <Upload size={14} className="mr-2" />}
                Salvar Imagem
              </Button>
            </div>
          </section>
        </div>

        
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-10 rounded-5xl border border-slate-100 shadow-sm space-y-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Cronograma de Encontros</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_2fr_auto] gap-4 bg-[#FDFBF9] p-6 rounded-4xl border border-rose-50">
              <select value={editandoMes.mes} onChange={e => setEditandoMes({...editandoMes, mes: e.target.value})} className="p-3 bg-white rounded-xl text-sm outline-none border border-slate-100">
                {MESES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={editandoMes.dia} onChange={e => setEditandoMes({...editandoMes, dia: e.target.value})} className="p-3 bg-white rounded-xl text-sm outline-none border border-slate-100">
                {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <input value={editandoMes.livro} onChange={e => setEditandoMes({...editandoMes, livro: e.target.value})} placeholder="Leitura do dia" className="p-3 bg-white rounded-xl text-sm outline-none border border-slate-100" />
              <Button onClick={handleSalvarLista} className="rounded-xl h-full" style={{ backgroundColor: lavandaPrincipal }}>
                {editandoMes.index > -1 ? <Check size={20} /> : <Plus size={20} />}
              </Button>
            </div>

            <div className="space-y-4">
              {agenda.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-6 bg-white border border-slate-50 rounded-4xl hover:shadow-md transition-all">
                  <div className="flex items-center gap-6">
                    <div className="text-center min-w-15">
                      <span className="text-[10px] font-bold uppercase block" style={{ color: lavandaPrincipal }}>{item.mes}</span>
                      <span className="text-4xl font-serif italic text-slate-800">{item.dia}</span>
                    </div>
                    <p className="text-slate-700 font-bold italic text-lg">{item.livro}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditandoMes({ index: idx, ...item })} className="p-2 text-slate-300 hover:text-rose-400"><Edit3 size={20} /></button>
                    <button onClick={() => setAgenda(agenda.filter((_, i) => i !== idx))} className="p-2 text-slate-300 hover:text-rose-400"><Trash2 size={20} /></button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <main className="min-h-screen bg-[#FDFBF9]">
      <AdminContent />
    </main>
  );
}