"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Mic2, Music2, Youtube, PlayCircle, Save, 
  Loader2, Image as ImageIcon, Link2, Radio,
  Headphones, CassetteTape, UploadCloud, X,
  FileAudio, Disc, Laptop, Trash2, Plus
} from 'lucide-react';

const rosaRetro = "var(--page-color)";

export default function PodcastAdmin() {
  const [loading, setLoading] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [episodios, setEpisodios] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    titulo: '',
    convidada: '',
    resumo: '',
    spotifyUrl: '',
    youtubeUrl: '',
    audioUrl: '',
    imageUrl: '',
    data: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  });

  const loadEpisodios = async () => {
    setCarregando(true);
    try {
      const res = await fetch('/api/podcast');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setEpisodios(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Erro ao carregar episódios.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { loadEpisodios(); }, []);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      setFormData(prev => ({ ...prev, imageUrl: url }));
    } catch {
      toast.error('Erro ao subir imagem.');
    } finally {
      setUploadingImg(false);
    }
  };

  const handleAudioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAudio(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      const { url } = await res.json();
      setFormData(prev => ({ ...prev, audioUrl: url }));
      toast.success('Áudio enviado!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao subir áudio.');
    } finally {
      setUploadingAudio(false);
      if (audioInputRef.current) audioInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!formData.titulo) return toast.error('O título é obrigatório.');
    setLoading(true);
    try {
      const res = await fetch('/api/podcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: formData.titulo,
          convidada: formData.convidada || null,
          resumo: formData.resumo || null,
          spotifyUrl: formData.spotifyUrl || null,
          youtubeUrl: formData.youtubeUrl || null,
          audioUrl: formData.audioUrl || null,
          imageUrl: formData.imageUrl || null,
          data: formData.data || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro');
      }
      toast.success('Episódio publicado!');
      setFormData({ titulo: '', convidada: '', resumo: '', spotifyUrl: '', youtubeUrl: '', audioUrl: '', imageUrl: '', data: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) });
      loadEpisodios();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao publicar o episódio.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este episódio?')) return;
    try {
      const res = await fetch(`/api/podcast?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Episódio removido!');
      setEpisodios(prev => prev.filter(e => e.id !== id));
    } catch {
      toast.error('Erro ao remover.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20 font-alice">
      
      <header className="flex justify-between items-center border-b pb-6" style={{ borderColor: `${rosaRetro}30` }}>
        <div>
          <h1 className="font-serif text-4xl italic text-slate-900">
            Estação: <span style={{ color: rosaRetro }}>Clube FM</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">Configure o episódio e os links de streaming.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          
          
          <div
            onClick={() => imageInputRef.current?.click()}
            className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 hover:border-[#D9B5B2] transition-all group relative min-h-35 flex items-center justify-center overflow-hidden cursor-pointer"
          >
            {formData.imageUrl ? (
              <>
                <img src={formData.imageUrl} alt="Capa" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                <button
                  onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, imageUrl: '' })); }}
                  className="absolute top-3 right-3 z-30 p-1 bg-white rounded-full text-slate-400 shadow"
                >
                  <X size={14} />
                </button>
                <span className="relative z-10 text-[10px] font-bold uppercase tracking-widest text-slate-600">Trocar Capa</span>
              </>
            ) : (
              <div className="text-center space-y-2 p-8">
                {uploadingImg
                  ? <Loader2 className="animate-spin mx-auto" style={{ color: rosaRetro }} />
                  : <ImageIcon className="mx-auto text-slate-200 group-hover:text-[#D9B5B2]" size={28} />
                }
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Capa do Episódio</p>
              </div>
            )}
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>

          
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-2">
               <Disc size={14} style={{ color: rosaRetro }} /> Informações do Episódio
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Título do Episódio *</label>
                    <input value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl text-sm outline-none" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Convidada</label>
                    <input value={formData.convidada} onChange={e => setFormData({...formData, convidada: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl text-sm outline-none" />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Resumo / Legenda</label>
                <textarea value={formData.resumo} onChange={e => setFormData({...formData, resumo: e.target.value})} rows={3} className="w-full p-5 bg-slate-50 rounded-4xl text-sm outline-none resize-none" />
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Link do Áudio (Drive / Anchor / URL)</label>
                <input value={formData.audioUrl} onChange={e => setFormData({...formData, audioUrl: e.target.value})} placeholder="https://..." className="w-full p-4 bg-slate-50 rounded-2xl text-sm outline-none" />
                <div className="flex items-center gap-3 pt-1">
                  <div className="h-px flex-1 bg-slate-100" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300">ou</span>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>
                <button
                  type="button"
                  onClick={() => audioInputRef.current?.click()}
                  disabled={uploadingAudio}
                  className="w-full flex items-center justify-center gap-2 p-4 bg-slate-50 rounded-2xl text-[11px] font-bold text-slate-400 uppercase tracking-widest border-2 border-dashed border-slate-200 hover:border-[#D9B5B2] hover:text-[#D9B5B2] transition-all disabled:opacity-50"
                >
                  {uploadingAudio
                    ? <><Loader2 size={14} className="animate-spin" /> Enviando...</>
                    : <><FileAudio size={14} /> Subir Arquivo de Áudio (MP3, WAV, M4A)</>}
                </button>
                {formData.audioUrl && formData.audioUrl.startsWith('/uploads/') && (
                  <p className="text-[10px] text-emerald-500 italic flex items-center gap-1 mt-1">
                    <FileAudio size={11} /> {formData.audioUrl.split('/').pop()}
                  </p>
                )}
                <input ref={audioInputRef} type="file" accept="audio/mpeg,audio/mp4,audio/wav,audio/ogg,audio/x-m4a,audio/aac" className="hidden" onChange={handleAudioChange} />
            </div>
          </div>
        </div>

        
        <aside className="space-y-6">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                   <Link2 size={14} style={{ color: rosaRetro }} /> Plataformas
                </h3>
                
                <div className="space-y-4">
                    <div className="relative">
                        <Music2 className="absolute left-4 top-4 text-emerald-400" size={16} />
                        <input value={formData.spotifyUrl} onChange={e => setFormData({...formData, spotifyUrl: e.target.value})} placeholder="Spotify URL" className="w-full pl-12 p-4 bg-slate-50 rounded-2xl text-[11px] outline-none" />
                    </div>
                    <div className="relative">
                        <Youtube className="absolute left-4 top-4 text-red-400" size={16} />
                        <input value={formData.youtubeUrl} onChange={e => setFormData({...formData, youtubeUrl: e.target.value})} placeholder="YouTube URL" className="w-full pl-12 p-4 bg-slate-50 rounded-2xl text-[11px] outline-none" />
                    </div>
                </div>

                <Button 
                    onClick={handleSave} 
                    disabled={loading || uploadingImg}
                    className="w-full h-16 rounded-4xl text-white font-bold uppercase text-[10px] tracking-[0.3em] shadow-xl hover:scale-105 transition-all border-none"
                    style={{ backgroundColor: rosaRetro }}
                >
                    {loading ? <Loader2 className="animate-spin" /> : <><Save size={16} className="mr-2" /> Publicar Episódio</>}
                </Button>
            </div>

            <div className="p-6 bg-[#FDFBF9] rounded-[2.5rem] border border-slate-100 flex items-center gap-4">
                <CassetteTape className="text-slate-300 shrink-0" size={20} />
                <p className="text-[10px] text-slate-400 italic leading-tight">
                  Use links externos (Spotify, YouTube) ou cole o link direto do áudio.
                </p>
            </div>
        </aside>
      </div>

      
      <section className="space-y-4 pt-4">
        <div className="flex items-center gap-3 px-2 pb-2">
          <Radio size={16} style={{ color: rosaRetro }} />
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Episódios Publicados</h2>
        </div>

        {carregando ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-slate-200" size={36} />
          </div>
        ) : episodios.length === 0 ? (
          <div className="py-20 text-center space-y-3 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
            <Headphones size={36} className="mx-auto text-slate-200" />
            <p className="text-slate-400 italic">Nenhum episódio publicado ainda.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {episodios.map((ep) => (
              <div key={ep.id} className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all p-6 flex gap-5 items-center">
                {ep.imageUrl ? (
                  <img src={ep.imageUrl} alt={ep.titulo} className="w-16 h-16 rounded-2xl object-cover shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
                    <Mic2 size={22} className="text-slate-200" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 italic truncate">{ep.titulo}</p>
                  {ep.convidada && <p className="text-[11px] text-slate-400 mt-0.5">com {ep.convidada}</p>}
                  <div className="flex gap-3 mt-2">
                    {ep.spotifyUrl && <a href={ep.spotifyUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold uppercase tracking-widest text-emerald-500 hover:underline flex items-center gap-1"><Music2 size={10} /> Spotify</a>}
                    {ep.youtubeUrl && <a href={ep.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold uppercase tracking-widest text-red-400 hover:underline flex items-center gap-1"><Youtube size={10} /> YouTube</a>}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(ep.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl"
                  title="Remover episódio"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}