"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Plus, Trash2, Instagram, Image as ImageIcon, 
  Loader2, Save, Star, Heart, Info, UploadCloud, X, Pencil
} from 'lucide-react';

const azulSerenoLogo = "var(--page-color)";
const rosaLetrasGabi = "var(--page-color)";

export default function AdminParcerias() {
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [parcerias, setParcerias] = useState<any[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [novaParceria, setNovaParceria] = useState({
    nome: '',
    info: '',
    link: '',
    img: '' 
  });

  const loadParcerias = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/parcerias');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setParcerias(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Erro ao carregar parceiros.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadParcerias(); }, []);

  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNovaParceria({ ...novaParceria, img: reader.result as string });
        setIsUploading(false);
        toast.success("Logo carregada!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddParceria = async () => {
    if (!novaParceria.nome || !novaParceria.img) {
      return toast.error("Nome e Logo são obrigatórios!");
    }

    try {
      if (editandoId) {
        
        const res = await fetch(`/api/parcerias?id=${editandoId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(novaParceria),
        });
        if (res.ok) {
          toast.success("Parceiro atualizado!");
          setEditandoId(null);
          setNovaParceria({ nome: '', info: '', link: '', img: '' });
          loadParcerias();
        }
      } else {
        
        const res = await fetch('/api/parcerias', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(novaParceria),
        });
        if (res.ok) {
          toast.success("Parceiro adicionado!");
          setNovaParceria({ nome: '', info: '', link: '', img: '' });
          loadParcerias();
        }
      }
    } catch (e) {
      toast.error("Erro ao salvar parceria.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover este parceiro?")) return;
    try {
      await fetch(`/api/parcerias?id=${id}`, { method: 'DELETE' });
      toast.success("Removido!");
      loadParcerias();
    } catch (e) {
      toast.error("Erro ao excluir.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20 font-alice text-slate-900">
      
      <header className="flex justify-between items-center border-b pb-8" style={{ borderColor: `${azulSerenoLogo}30` }}>
        <div>
          <h1 className="font-serif text-4xl italic text-slate-900">
            Caderno de <span style={{ color: azulSerenoLogo }}>Parcerias</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">Gerencie as editoras e aliados do clube.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#8DA4BF] text-white px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-900/10">
            <Star size={12} className="animate-pulse" />
            Curadoria Ativa
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        
        <div className="lg:col-span-1">
          <section className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm sticky top-8 space-y-6">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 border-b pb-4">
              <Plus size={14} style={{ color: azulSerenoLogo }} /> {editandoId ? 'Editar Parceiro' : 'Nova Aliança'}
            </div>

            <div className="space-y-4">
              
              
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase ml-2">Selo / Logo da Parceria</label>
                
                {novaParceria.img ? (
                  <div className="relative group w-full aspect-square bg-[#FDFBF9] rounded-4xl border border-slate-100 overflow-hidden flex items-center justify-center p-6">
                    <img src={novaParceria.img} alt="Preview" className="w-full h-full object-contain" />
                    <button 
                      onClick={() => setNovaParceria({ ...novaParceria, img: '' })}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2"
                    >
                      <X size={20} />
                      <span className="text-[9px] font-bold uppercase tracking-widest">Trocar Logo</span>
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-square bg-[#FDFBF9] rounded-4xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 transition-all hover:border-[#8DA4BF]/50 group"
                  >
                    {isUploading ? (
                      <Loader2 className="animate-spin text-[#8DA4BF]" />
                    ) : (
                      <>
                        <div className="p-4 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                          <UploadCloud size={24} style={{ color: azulSerenoLogo }} />
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Clique para subir selo</span>
                      </>
                    )}
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase ml-2 italic">Nome da Editora</label>
                <input 
                  value={novaParceria.nome}
                  onChange={e => setNovaParceria({...novaParceria, nome: e.target.value})}
                  placeholder="Ex: Editora Record"
                  className="w-full p-4 bg-[#FDFBF9] rounded-2xl text-sm outline-none border border-slate-50" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase ml-2 italic">Descrição</label>
                <textarea 
                  value={novaParceria.info}
                  onChange={e => setNovaParceria({...novaParceria, info: e.target.value})}
                  placeholder="Histórias fundamentais..."
                  className="w-full p-4 bg-[#FDFBF9] rounded-2xl text-sm outline-none border border-slate-50 min-h-20 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase ml-2 italic">Instagram</label>
                <input 
                  value={novaParceria.link}
                  onChange={e => setNovaParceria({...novaParceria, link: e.target.value})}
                  placeholder="Link do perfil"
                  className="w-full p-4 bg-[#FDFBF9] rounded-2xl text-sm outline-none border border-slate-50" 
                />
              </div>

              <Button 
                onClick={handleAddParceria}
                disabled={isUploading}
                className="w-full h-14 rounded-2xl text-white font-bold uppercase text-[10px] tracking-widest border-none shadow-lg mt-4 transition-transform hover:scale-[1.02]"
                style={{ backgroundColor: azulSerenoLogo }}
              >
                <Save size={16} className="mr-2" /> {editandoId ? 'Salvar Alterações' : 'Publicar Parceiro'}
              </Button>
              {editandoId && (
                <button
                  onClick={() => { setEditandoId(null); setNovaParceria({ nome: '', info: '', link: '', img: '' }); }}
                  className="w-full text-center text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors mt-1"
                >
                  Cancelar edição
                </button>
              )}
            </div>
          </section>
        </div>

        
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-4">
             <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Aliados Cadastrados</h3>
             <span className="text-[10px] italic text-slate-400">{parcerias.length} parceiros</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin opacity-10" size={40} /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parcerias.length === 0 && (
                <div className="col-span-full py-20 bg-white rounded-[3rem] border border-dashed border-slate-200 text-center">
                   <Info className="mx-auto mb-2 opacity-20" />
                   <p className="text-slate-400 italic text-sm font-alice">Nenhum parceiro cadastrado.</p>
                </div>
              )}
              
              {parcerias.map((parceiro) => (
                <div key={parceiro.id} className="group bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="flex gap-4 items-start">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl overflow-hidden shrink-0 border border-slate-100 flex items-center justify-center p-2">
                       {parceiro.imagem ? (
                         <img src={parceiro.imagem} alt="" className="w-full h-full object-contain" />
                       ) : (
                         <ImageIcon className="text-slate-200" size={20} />
                       )}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-700 text-lg leading-tight italic font-serif">{parceiro.name}</h4>
                      <p className="text-[11px] text-slate-400 italic line-clamp-2">{parceiro.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
                    <div className="flex gap-2">
                      {parceiro.link && (
                        <a href={parceiro.link} target="_blank" className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-blue-400 transition-colors">
                          <Instagram size={14} />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setEditandoId(parceiro.id);
                          setNovaParceria({
                            nome: parceiro.name || '',
                            info: parceiro.description || '',
                            link: parceiro.link || '',
                            img: parceiro.imagem || '',
                          });
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="flex items-center gap-1 text-[10px] font-bold text-blue-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
                      >
                        <Pencil size={12} /> Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(parceiro.id)}
                        className="flex items-center gap-2 text-[10px] font-bold text-rose-300 hover:text-rose-500 transition-colors uppercase tracking-widest"
                      >
                        <Trash2 size={14} /> Remover
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="p-8 bg-white/50 border border-dashed border-[#8DA4BF]/30 rounded-[3rem] flex items-center gap-6">
             <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                <Heart size={20} style={{ color: rosaLetrasGabi }} className="opacity-40" />
             </div>
             <p className="text-xs italic text-[#8C7A66] leading-relaxed">
               As parcerias aparecem automaticamente no rodapé do jornal e na página de Aliados.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}