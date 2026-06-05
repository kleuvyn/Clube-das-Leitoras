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
  const [inviteRole, setInviteRole] = useState('convidada');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todas');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0, hasMore: false });
  const limit = 15;

  const load = async (pageNum = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(pageNum), limit: String(limit) });
      if (statusFilter !== 'todas') params.append('status', statusFilter);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      const res = await fetch(`/api/colaboradores?${params.toString()}`, { credentials: 'include' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLista(Array.isArray(data.data) ? data.data : []);
      setPagination(data.pagination || { total: 0, pages: 0, hasMore: false });
      setPage(pageNum);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(1); }, [statusFilter, searchTerm]);

  const scrollTop = () => document.getElementById('admin-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });

  const filteredList = lista
    .filter(u => (u.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(u => {
      if (statusFilter === 'todas') return true;
      return (u.status ?? 'ativa').toLowerCase() === statusFilter;
    });

  const handleEdit = (u: any) => {
    setEditing({ id: u.id, name: u.name, role: u.role, active: u.active ?? true });
    scrollTop();
  };

  const handleInvite = async () => {
    if (!email || !name) return toast.error('Nome e E-mail são obrigatórios para o convite');
    setLoading(true);
    try {
      const res = await fetch('/api/colaboradores/invite', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, role: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error);

      if (data.emailError) {
        toast.warning(
          `Acesso criado! E-mail não pôde ser enviado. Passe a senha temporária manualmente: ${data.tempPassword}`,
          { duration: 20000 }
        );
      } else {
        toast.success(`Convite enviado para ${name}!`);
      }
      setEmail(''); setName(''); setInviteRole('convidada');
      scrollTop();
      await load(1);
    } catch (err: any) {
      toast.error(err.message ?? 'Erro ao processar convite.');
    } finally {
      setLoading(false);
    }
  };
  const handleBlock = async (u: any) => {
    if (!confirm(`Bloquear leitora "${u.name}"?`)) return;
    setLoading(true);
    try {
      const res = await fetch('/api/colaboradores', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: u.id, status: 'bloqueada' }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Falha ao bloquear');
      toast.success(`${u.name} bloqueada com sucesso.`);
      await load(page);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao bloquear.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (u: any) => {
    if (!confirm(`Desbloquear leitora "${u.name}"?`)) return;
    setLoading(true);
    try {
      const res = await fetch('/api/colaboradores', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: u.id, status: 'ativa' }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Falha ao desbloquear');
      toast.success(`${u.name} reativada com sucesso.`);
      await load(page);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao desbloquear.');
    } finally {
      setLoading(false);
    }
  };

  const handleExclude = async (u: any) => {
    if (!confirm(`Marcar leitora "${u.name}" como excluída?`)) return;
    setLoading(true);
    try {
      const res = await fetch('/api/colaboradores', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: u.id, status: 'excluida' }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Falha ao excluir');
      toast.success(`${u.name} marcada como excluída.`);
      await load(page);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (u: any) => {
    if (!confirm(`Remover o acesso de "${u.name}"? Esta ação não pode ser desfeita.`)) return;
    try {
      const res = await fetch(`/api/colaboradores?id=${u.id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Erro ao remover');
      toast.success(`${u.name} removida do clube.`);
      await load(page);
    } catch (err: any) {
      toast.error(err.message ?? 'Erro ao remover.');
    }
  };

  const handleApprove = async (u: any) => {
    if (!confirm(`Aprovar leitora "${u.name}" e enviar senha temporária?`)) return;
    setLoading(true);
    try {
      const res = await fetch('/api/colaboradores/approve', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: u.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Falha ao aprovar');
      toast.success('Leitora aprovada com sucesso!');
      await load(page);
    } catch (err: any) {
      toast.error(err.message ?? 'Erro na aprovação.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    setLoading(true);
    try {
      const res = await fetch('/api/colaboradores', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editing.id, name: editing.name, role: editing.role, active: editing.active }),
      });
      if (!res.ok) throw new Error();
      toast.success('Perfil atualizado!');
      setEditing(null);
      await load(page);
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

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 tracking-widest">Nível de Acesso</label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 rounded-2xl text-sm outline-none focus:bg-white transition-all"
                >
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 mb-6 gap-3">
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-4 top-3 text-slate-300" size={14} />
                <input 
                  placeholder="Buscar por nome..." 
                  className="w-full pl-10 p-2.5 bg-slate-50 rounded-xl text-xs outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2 items-center">
                {['todas', 'ativa', 'bloqueada', 'excluida'].map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1 rounded-lg text-[9px] uppercase tracking-wider ${statusFilter === status ? 'bg-violet-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {status === 'todas' ? 'Todas' : status === 'ativa' ? 'Ativas' : status === 'bloqueada' ? 'Bloqueadas' : 'Excluídas'}
                  </button>
                ))}
              </div>
              <div className="text-right">
                <span className="text-2xl font-serif italic text-slate-900">{filteredList.length}</span>
                <span className="block text-[8px] font-bold uppercase text-slate-400 tracking-tighter">Membros</span>
              </div>
            </div>

            <div className="divide-y divide-slate-50">
              {filteredList.map((u) => (
                <div key={u.id} className={`flex flex-col gap-4 p-4 hover:bg-slate-50 transition-all group rounded-2xl md:flex-row md:items-center md:justify-between ${editing?.id === u.id ? 'bg-violet-50' : ''}`}>
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center font-serif italic text-slate-400 border-2 border-white shadow-sm overflow-hidden">
                      {u.avatarUrl ? <img src={u.avatarUrl} className="w-full h-full object-cover" alt={u.name} /> : (u.name?.[0] ?? '?')}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-serif text-lg italic text-slate-800 leading-none wrap-break-word">{u.name}</h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-widest break-all">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:justify-end">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest whitespace-nowrap ${
                      u.role === 'admin' ? 'bg-amber-50 text-slate-900' :
                      u.role === 'colaboradora' ? 'bg-violet-50 text-violet-500' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {u.role === 'admin' ? 'Curadoria' : u.role === 'colaboradora' ? 'Colaboradora' : 'Leitora'}
                    </span>
                    
                    {!u.active && (
                      <span className="px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-rose-50 text-rose-400">Pendente</span>
                    )}
                    {u.active && u.status !== 'ativa' && (
                      <span className="px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-amber-50 text-slate-900 whitespace-nowrap">{u.status || 'ativa'}</span>
                    )}

                    {u.email !== 'clubedasleitorasbsb@gmail.com' && (
                      <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity ml-auto md:ml-0">
                        {u.status !== 'ativa' && (
                          <button
                            onClick={() => handleUnblock(u)}
                            className="p-2 text-green-500 hover:text-emerald-600 transition-colors"
                            title="Reativar"
                          >
                            <ShieldCheck size={15} />
                          </button>
                        )}
                        {u.status === 'ativa' && (
                          <button
                            onClick={() => handleBlock(u)}
                            className="p-2 text-orange-500 hover:text-orange-600 transition-colors"
                            title="Bloquear"
                          >
                            <ShieldOff size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => handleExclude(u)}
                          className="p-2 text-rose-500 hover:text-rose-600 transition-colors"
                          title="Marcar como excluída"
                        >
                          <Trash2 size={15} />
                        </button>
                        <button
                          onClick={() => handleEdit(u)}
                          className="p-2 text-slate-300 hover:text-violet-500 transition-colors"
                          title="Editar"
                        >
                          <Edit3 size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Paginação */}
        {!loading && filteredList.length > 0 && pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-12 mb-8">
            <button
              onClick={() => load(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-6 py-2 rounded-lg font-bold uppercase text-[10px] tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ backgroundColor: page === 1 ? '#ddd' : corLeitora, color: 'white' }}
            >
              ← Anterior
            </button>
            <span className="text-xs text-slate-500 italic">Página {page} de {pagination.pages}</span>
            <button
              onClick={() => load(page + 1)}
              disabled={!pagination.hasMore}
              className="px-6 py-2 rounded-lg font-bold uppercase text-[10px] tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ backgroundColor: !pagination.hasMore ? '#ddd' : corLeitora, color: 'white' }}
            >
              Próxima →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}