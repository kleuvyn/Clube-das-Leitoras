"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Plus, Trash2, Edit3, 
  UploadCloud, Loader2, Save, 
  Image as ImageIcon, Check, RotateCcw, BookOpen
} from 'lucide-react';

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const DIAS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));

export default function AdminCronograma() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [agenda, setAgenda] = useState<any[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [configGeral, setConfigGeral] = useState({
    calendarioImagem: '',
    livroDoMes: '',
  });

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
        const data = await res.json();
        
        const ativo = Array.isArray(data) ? data.find((r: any) => r.status === 'ativo') : data;
        
        if (ativo) {
          setCurrentId(ativo.id);
          setConfigGeral({
            calendarioImagem: ativo.imageUrl || '',
            livroDoMes: ativo.title || ''
          });
          if (ativo.notes) {
            try { 
              const parsed = JSON.parse(ativo.notes);
              setAgenda(Array.isArray(parsed) ? parsed : []);
            } catch { setAgenda([]); }
          }
        }
      }
    } catch (e) {
      toast.error("Erro ao sincronizar com o banco.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDados(); }, []);

  
  const handleUploadCalendario = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setConfigGeral(prev => ({ ...prev, calendarioImagem: reader.result as string }));
        setIsUploading(false);
        toast.success("Preview da imagem atualizado!");
      };
      reader.readAsDataURL(file);
    }
  };

  
  const handleSalvarLista = () => {
    if (!editandoMes.livro) return toast.error("O que leremos nesse dia?");

    if (editandoMes.index > -1) {
      const novaAgenda = [...agenda];
      novaAgenda[editandoMes.index] = { mes: editandoMes.mes, dia: editandoMes.dia, livro: editandoMes.livro };
      setAgenda(novaAgenda);
      toast.success("Item atualizado!");
    } else {
      setAgenda([...agenda, { mes: editandoMes.mes, dia: editandoMes.dia, livro: editandoMes.livro }]);
      toast.success("Data adicionada!");
    }
    setEditandoMes({ index: -1, mes: 'Janeiro', dia: '01', livro: '' });
  };

  
  const handleSalvarTudoNoBanco = async () => {
    setIsSaving(true);
    
    
    const payload = {
      title: configGeral.livroDoMes,
      imageUrl: configGeral.calendarioImagem,
      notes: JSON.stringify(agenda),
      status: 'ativo'
    };

    try {
      
      
      const res = await fetch('/api/cronograma', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();
      
      toast.success("O site das leitoras foi atualizado!");
    } catch (e) {
      toast.error("Erro ao salvar. Verifique a conexão com o banco.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center italic text-slate-400">Buscando dados no banco...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 p-6 font-sans">
      <header className="flex flex-col md:flex-row justify-between items-center border-b pb-8 gap-4" style={{ borderColor: 'var(--page-color-30)' }}>
        <div>
          <h1 className="text-4xl italic text-slate-900 font-serif">Painel <span style={{ color: 'var(--page-color)' }}>Administrativo</span></h1>
          <p className="text-slate-500 mt-1 italic">Tudo que você salvar aqui aparecerá no site do Clube.</p>
        </div>
        <Button onClick={handleSalvarTudoNoBanco} disabled={isSaving} className="rounded-full px-10 h-14 text-white font-bold uppercase text-xs tracking-widest shadow-2xl transition-all hover:scale-105" style={{ backgroundColor: 'var(--page-color-60)' }}>
          {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
          {isSaving ? "Publicando..." : "Publicar Alterações"}
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        <div className="space-y-8">
          <section className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 border-b pb-4 flex items-center gap-2">
              <ImageIcon size={14} /> Capa do Mês
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 ml-2 italic">Livro em Destaque</label>
                <input value={configGeral.livroDoMes} onChange={e => setConfigGeral({...configGeral, livroDoMes: e.target.value})} placeholder="Ex: A Redoma de Vidro" className="w-full p-4 rounded-2xl text-sm outline-none border border-slate-50 transition-all" style={{ backgroundColor: 'var(--page-color-05)' }} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 ml-2 italic">Arte (Horizontal 4:3)</label>
                <div onClick={() => fileInputRef.current?.click()} className="relative rounded-3xl overflow-hidden border-4 border-white shadow-lg cursor-pointer aspect-[4/3] bg-slate-50 flex items-center justify-center transition-all">
                  {configGeral.calendarioImagem ? (
                    <>
                      <img src={configGeral.calendarioImagem} className="w-full h-full object-cover" alt="Arte" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold uppercase">
                        <RotateCcw size={24} className="mb-2" /> Trocar Imagem
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6">
                      {isUploading ? <Loader2 className="animate-spin mx-auto" style={{ color: 'var(--page-color)' }} /> : <UploadCloud size={40} className="mx-auto mb-2 text-slate-300" />}
                      <p className="text-[9px] font-black uppercase text-slate-400">Upload Arte Deitada</p>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleUploadCalendario} className="hidden" accept="image/*" />
              </div>
            </div>
          </section>
        </div>

        
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
            <div className="flex justify-between items-center">
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Datas de Encontros</h3>
               {editandoMes.index > -1 && (
                 <button onClick={() => setEditandoMes({ index: -1, mes: 'Janeiro', dia: '01', livro: '' })} className="text-[10px] font-bold text-rose-400 border-b border-rose-400 uppercase">Cancelar Edição</button>
               )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 rounded-[2.5rem] border" style={{ backgroundColor: 'var(--page-color-05)', borderColor: 'var(--page-color-10)' }}>
              <select value={editandoMes.mes} onChange={e => setEditandoMes({...editandoMes, mes: e.target.value})} className="p-3 bg-white rounded-xl text-sm outline-none border border-slate-100">
                {MESES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={editandoMes.dia} onChange={e => setEditandoMes({...editandoMes, dia: e.target.value})} className="p-3 bg-white rounded-xl text-sm outline-none border border-slate-100">
                {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <input value={editandoMes.livro} onChange={e => setEditandoMes({...editandoMes, livro: e.target.value})} placeholder="Título ou Meta de Leitura" className="p-3 bg-white rounded-xl text-sm outline-none border border-slate-100" />
              <Button onClick={handleSalvarLista} className="rounded-xl h-full shadow-md" style={{ backgroundColor: lavandaPrincipal }}>
                {editandoMes.index > -1 ? <Check size={20} /> : <Plus size={20} />}
              </Button>
            </div>

            <div className="space-y-4">
              {agenda.length === 0 && <div className="text-center py-10 text-slate-300 italic">Nenhum encontro na lista ainda.</div>}
              {agenda.map((item, idx) => (
                <div key={idx} className={`flex items-center justify-between p-6 rounded-[2rem] border transition-all ${editandoMes.index === idx ? '' : 'bg-white border-slate-50 hover:shadow-md'}`} style={editandoMes.index === idx ? { backgroundColor: 'var(--page-color-05)', borderColor: 'var(--page-color-30)' } : undefined}>
                  <div className="flex items-center gap-6">
                    <div className="text-center min-w-[70px]">
                      <span className="text-[10px] font-black uppercase block tracking-widest" style={{ color: 'var(--page-color)' }}>{item.mes}</span>
                      <span className="text-4xl font-serif italic text-slate-800">{item.dia}</span>
                    </div>
                    <div className="h-10 w-px bg-slate-100" />
                    <div>
                       <span className="text-[9px] font-black text-slate-300 uppercase flex items-center gap-1"><BookOpen size={10}/> Programação</span>
                       <p className="text-slate-700 font-bold italic text-lg">{item.livro}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditandoMes({ index: idx, ...item })} className="p-3 text-slate-300"><Edit3 size={20} /></button>
                    <button onClick={() => { setAgenda(agenda.filter((_, i) => i !== idx)); toast.info("Removido da lista."); }} className="p-3 text-slate-300 hover:text-rose-400"><Trash2 size={20} /></button>
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