"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  UserPlus, Mail, User, Trash2, Edit3, Search, Loader2, Send, X, Save, ShieldCheck, ShieldOff
} from 'lucide-react';
import { toast } from 'sonner';

const corLeitora = "#8B5CF6";

const ROLES = [
  { value: 'convidada', label: 'Leitora' },
  { value: 'colaboradora', label: 'Colaboradora' },
  { value: 'admin', label: 'Curadoria (Admin)' },
];

export default function LeitorasAdmin() {
  const [lista, setLista] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const load = async () => {
    try {
      const res = await fetch('/api/colaboradores');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLista(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { load(); }, []);

  const handleInvite = async () => {
    if (!email || !name) return toast.error('Nome e E-mail são obrigatórios para o convite');
    setLoading(true);
    try {
      const res = await fetch('/api/colaboradores/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, role: 'convidada' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error);

      if (data.emailError) {
        
        toast.warning(
          `Acesso criado! E-mail não pôde ser enviado. Passe a senha manualmente: leitura2026`,
          { duration: 15000 }
        );
      } else {
        toast.success(`Convite enviado para ${name}!`);
      }
      setEmail(''); setName('');
      load();
    } catch (err: any) {
      toast.error(err.message ?? 'Erro ao processar convite.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (u: any) => {
    if (!confirm(`Remover o acesso de "${u.name}"? Esta ação não pode ser desfeita.`)) return;
    try {
      const res = await fetch(`/api/colaboradores?id=${u.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Erro ao remover');
      toast.success(`${u.name} removida do clube.`);
      load();
    } catch (err: any) {
      toast.error(err.message ?? 'Erro ao remover.');
    }
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    setLoading(true);
    try {
      const res = await fetch('/api/colaboradores', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editing.id, name: editing.name, role: editing.role, active: editing.active }),
      });
      if (!res.ok) throw new Error();
      toast.success('Perfil atualizado!');
      setEditing(null);
      load();
    } catch {
      toast.error('Erro ao salvar alterações.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 font-alice">
      
      <header className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl italic text-slate-900">Comunidade de Leitoras</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Gerencie os acessos e convide novas participantes.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        
        <aside className="lg:col-span-1 space-y-4">

          
          {editing && (
            <div className="bg-violet-50 p-8 rounded-[2.5rem] border border-violet-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-500 flex items-center gap-2">
                  <Edit3 size={14} /> Editando
                </h3>
                <button onClick={() => setEditing(null)} className="text-slate-300 hover:text-slate-600 transition-all">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 tracking-widest">Nome</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-slate-300" size={16} />
                  <input 
                    value={editing.name}
                    onChange={e => setEditing({ ...editing, name: e.target.value })}
                    className="w-full pl-11 p-3.5 bg-white rounded-2xl text-sm outline-none border border-violet-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 tracking-widest">Nível de Acesso</label>
                <select
                  value={editing.role}
                  onChange={e => setEditing({ ...editing, role: e.target.value })}
                  className="w-full p-3.5 bg-white rounded-2xl text-sm outline-none border border-violet-100"
                >
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => setEditing({ ...editing, active: !editing.active })}
                  className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl transition-all border ${editing.active ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-rose-50 border-rose-200 text-rose-500'}`}
                >
                  {editing.active ? <><ShieldCheck size={12} /> Ativa</> : <><ShieldOff size={12} /> Inativa</>}
                </button>
                <span className="text-[9px] text-slate-400 italic">Clique para alternar</span>
              </div>

              <Button
                onClick={handleSaveEdit}
                disabled={loading}
                className="w-full h-12 rounded-2xl text-white font-bold uppercase text-[10px] tracking-widest shadow border-none"
                style={{ backgroundColor: corLeitora }}
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <><Save size={14} className="mr-2" /> Salvar Alterações</>}
              </Button>
            </div>
          )}

          
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm sticky top-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-2">
              <UserPlus size={14} style={{ color: corLeitora }} /> Convidar para o Clube
            </h3>
            
            <div className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 tracking-widest">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-slate-300" size={16} />
                  <input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Ex: Maria Silva" 
                    className="w-full pl-11 p-3.5 bg-slate-50 rounded-2xl text-sm outline-none focus:bg-white transition-all" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 tracking-widest">E-mail de Acesso</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-slate-300" size={16} />
                  <input 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="leitora@email.com" 
                    className="w-full pl-11 p-3.5 bg-slate-50 rounded-2xl text-sm outline-none focus:bg-white transition-all" 
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={handleInvite} 
                  disabled={loading} 
                  className="w-full h-14 rounded-2xl text-white font-bold uppercase text-[10px] tracking-widest shadow-lg border-none"
                  style={{ backgroundColor: corLeitora }}
                >
                  {loading ? <Loader2 className="animate-spin" /> : <><Send size={14} className="mr-2" /> Enviar Convite com Senha</>}
                </Button>
                <p className="text-[9px] text-center text-slate-400 mt-4 italic">
                  A leitora receberá os dados de login por e-mail.
                </p>
              </div>
            </div>
          </div>
        </aside>

        
        <section className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 mb-6">
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-4 top-3 text-slate-300" size={14} />
                <input 
                  placeholder="Buscar por nome..." 
                  className="w-full pl-10 p-2.5 bg-slate-50 rounded-xl text-xs outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="text-right">
                <span className="text-2xl font-serif italic text-slate-900">{lista.length}</span>
                <span className="block text-[8px] font-bold uppercase text-slate-400 tracking-tighter">Membros</span>
              </div>
            </div>

            <div className="divide-y divide-slate-50">
              {lista.filter(u => (u.name ?? '').toLowerCase().includes(searchTerm.toLowerCase())).map((u) => (
                <div key={u.id} className={`flex items-center justify-between p-4 hover:bg-slate-50 transition-all group rounded-2xl ${editing?.id === u.id ? 'bg-violet-50' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center font-serif italic text-slate-400 border-2 border-white shadow-sm overflow-hidden">
                      {u.avatarUrl ? <img src={u.avatarUrl} className="w-full h-full object-cover" alt={u.name} /> : (u.name?.[0] ?? '?')}
                    </div>
                    <div>
                      <h4 className="font-serif text-lg italic text-slate-800 leading-none">{u.name}</h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-widest">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      u.role === 'admin' ? 'bg-amber-50 text-amber-600' :
                      u.role === 'colaboradora' ? 'bg-violet-50 text-violet-500' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {u.role === 'admin' ? 'Curadoria' : u.role === 'colaboradora' ? 'Colaboradora' : 'Leitora'}
                    </span>
                    
                    {!u.active && (
                      <span className="px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-rose-50 text-rose-400">Inativa</span>
                    )}

                    {u.email !== 'clubedasleitorasbsb@gmail.com' && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditing({ id: u.id, name: u.name, role: u.role, active: u.active ?? true })}
                          className="p-2 text-slate-300 hover:text-violet-500 transition-colors"
                          title="Editar"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                          title="Remover"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}