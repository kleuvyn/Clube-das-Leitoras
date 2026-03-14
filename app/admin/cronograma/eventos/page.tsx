"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Plus, Trash2, MapPin, Calendar, 
  Loader2, Save, Image as ImageIcon, X, Clock, Edit3, DollarSign, Phone, Link
} from 'lucide-react';
import { uploadFile } from '@/lib/upload-client';

const ocreDestaque = "var(--page-color)";

function formatarData(dataStr: string) {
  if (!dataStr) return '';
  const d = new Date(dataStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export default function AdminEventos() {
  const { isAdmin } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [eventos, setEventos] = useState<any[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    titulo: '',
    data: '',
    horario: '',
    local: '',
    descricao: '',
    imagem: '',
    valor: '',
    telefone: '',
    linkInscricao: '',
  });

  const resetForm = () => {
    setForm({ titulo: '', data: '', horario: '', local: '', descricao: '', imagem: '', valor: '', telefone: '', linkInscricao: '' });
    setEditandoId(null);
  };

  const loadEventos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/eventos');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setEventos(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Erro ao carregar eventos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEventos(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este evento?')) return;
    try {
      const res = await fetch(`/api/eventos?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Evento removido!');
      loadEventos();
    } catch {
      toast.error('Erro ao remover.');
    }
  };

  const handleEditar = (evento: any) => {
    setEditandoId(evento.id);
    setForm({
      titulo: evento.title || '',
      data: evento.date ? new Date(evento.date).toISOString().split('T')[0] : '',
      horario: evento.horaInicio || '',
      local: evento.location || '',
      descricao: evento.description || '',
      imagem: evento.imageUrl || '',
      valor: evento.valor || '',
      telefone: evento.telefone || '',
      linkInscricao: evento.linkInscricao || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadFile(file);
      setForm(prev => ({ ...prev, imagem: url }));
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar imagem.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSalvar = async () => {
    if (!form.titulo || !form.data) return toast.error("Título e Data são obrigatórios!");
    if (saving) return;
    setSaving(true);
    try {
      const payload = {
        title: form.titulo,
        date: form.data,
        horaInicio: form.horario,
        location: form.local,
        description: form.descricao,
        imageUrl: form.imagem,
        valor: form.valor || null,
        telefone: form.telefone || null,
        linkInscricao: form.linkInscricao || null,
      };
      const url = editandoId ? `/api/eventos?id=${editandoId}` : '/api/eventos';
      const res = await fetch(url, {
        method: editandoId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(editandoId ? 'Evento atualizado!' : 'Evento publicado!');
        resetForm();
        loadEventos();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Erro ao salvar.');
      }
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 p-6 font-alice">

      <header className="border-b pb-8 border-slate-100">
        <h1 className="font-serif text-4xl italic text-slate-900">
          Galeria de <span style={{ color: ocreDestaque }}>Encontros</span>
        </h1>
        <p className="text-slate-400 mt-1 text-sm italic">Publique e gerencie os eventos do clube.</p>
      </header>

      
      <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
            {editandoId ? <Edit3 size={13} style={{ color: ocreDestaque }} /> : <Plus size={13} style={{ color: ocreDestaque }} />}
            {editandoId ? 'Editando Evento' : 'Novo Evento'}
          </span>
          {editandoId && (
            <button onClick={resetForm} className="text-slate-300 hover:text-rose-400 transition-colors">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-4">
            
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase ml-1 block mb-2">Foto do Evento</label>
              {form.imagem ? (
                <div className="relative group w-full aspect-video rounded-2xl overflow-hidden border border-slate-100">
                  <img src={form.imagem} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setForm(f => ({ ...f, imagem: '' }))}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] uppercase font-bold gap-2"
                  >
                    <X size={14} /> Trocar
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-100 transition-all"
                >
                  {isUploading
                    ? <Loader2 className="animate-spin text-slate-300" size={24} />
                    : <ImageIcon size={24} className="text-slate-300" />
                  }
                  <span className="text-[10px] font-bold text-slate-300 uppercase">Clique para enviar foto</span>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
            </div>

            <input
              placeholder="Nome do Evento *"
              value={form.titulo}
              onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
              className="w-full p-4 bg-slate-50 rounded-2xl text-sm outline-none font-alice italic"
            />
          </div>

          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase ml-1 block mb-2">Data *</label>
                <div className="relative">
                  <Calendar size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="date"
                    value={form.data}
                    onChange={e => setForm(f => ({ ...f, data: e.target.value }))}
                    className="w-full p-4 pl-10 bg-slate-50 rounded-2xl text-sm outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase ml-1 block mb-2">Horário</label>
                <div className="relative">
                  <Clock size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    placeholder="Ex: 19h"
                    value={form.horario}
                    onChange={e => setForm(f => ({ ...f, horario: e.target.value }))}
                    className="w-full p-4 pl-10 bg-slate-50 rounded-2xl text-sm outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="relative">
              <MapPin size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <input
                placeholder="Local do Evento"
                value={form.local}
                onChange={e => setForm(f => ({ ...f, local: e.target.value }))}
                className="w-full p-4 pl-10 bg-slate-50 rounded-2xl text-sm outline-none"
              />
            </div>

            <textarea
              placeholder="Descrição do evento..."
              value={form.descricao}
              onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
              className="w-full p-4 bg-slate-50 rounded-2xl text-sm min-h-[120px] resize-none outline-none font-alice"
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <DollarSign size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  placeholder="Valor (ex: R$ 30)"
                  value={form.valor}
                  onChange={e => setForm(f => ({ ...f, valor: e.target.value }))}
                  className="w-full p-4 pl-10 bg-slate-50 rounded-2xl text-sm outline-none"
                />
              </div>
              <div className="relative">
                <Phone size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  placeholder="Telefone / WhatsApp"
                  value={form.telefone}
                  onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))}
                  className="w-full p-4 pl-10 bg-slate-50 rounded-2xl text-sm outline-none"
                />
              </div>
            </div>

            <div className="relative">
              <Link size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <input
                placeholder="Link de inscrição (URL)"
                value={form.linkInscricao}
                onChange={e => setForm(f => ({ ...f, linkInscricao: e.target.value }))}
                className="w-full p-4 pl-10 bg-slate-50 rounded-2xl text-sm outline-none"
              />
            </div>

            <Button
              onClick={handleSalvar}
              disabled={saving}
              className="w-full h-12 rounded-2xl text-white font-bold uppercase text-[10px] tracking-widest"
              style={{ backgroundColor: ocreDestaque }}
            >
              {saving ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Save size={14} className="mr-2" />}
              {saving ? 'Salvando...' : editandoId ? 'Salvar Alterações' : 'Publicar Evento'}
            </Button>
          </div>
        </div>
      </section>

      
      <section className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">
          Eventos Publicados ({eventos.length})
        </h3>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin opacity-10" size={40} /></div>
        ) : eventos.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-slate-200 rounded-[2.5rem]">
            <p className="text-slate-400 italic">Nenhum evento publicado ainda.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {eventos.map((evento) => (
              <div key={evento.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-5 p-5 group">
                
                <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-slate-50">
                  {evento.imageUrl
                    ? <img src={evento.imageUrl} className="w-full h-full object-cover" alt="" />
                    : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={18} className="text-slate-200" /></div>
                  }
                </div>

                
                <div className="shrink-0 w-14 text-center">
                  <p className="text-xl font-bold leading-none" style={{ color: ocreDestaque }}>
                    {evento.date ? new Date(evento.date).getUTCDate().toString().padStart(2, '0') : '--'}
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-wider mt-0.5 opacity-50">
                    {evento.date ? new Date(evento.date).toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' }).replace('.', '') : '---'}
                  </p>
                </div>

                
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 italic truncate">{evento.title}</p>
                  <div className="flex gap-4 mt-1">
                    {evento.horaInicio && (
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Clock size={10} /> {evento.horaInicio}
                      </span>
                    )}
                    {evento.location && (
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <MapPin size={10} /> {evento.location}
                      </span>
                    )}
                  </div>
                  {evento.description && (
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 italic">{evento.description}</p>
                  )}
                </div>

                
                {isAdmin && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => handleEditar(evento)}
                    className="p-2.5 text-slate-300 hover:text-blue-400 transition-colors"
                    title="Editar"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(evento.id)}
                    className="p-2.5 text-slate-300 hover:text-rose-400 transition-colors"
                    title="Remover"
                  >
                    <Trash2 size={15} />
                  </button>
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
