"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, RefreshCw, Mail, Phone, Calendar, MapPin, Instagram } from 'lucide-react';
import { normalizeDateValue } from '@/lib/utils';

type Solicitacao = {
  id: string;
  tipo: string;
  nome: string;
  email: string;
  telefone?: string;
  instagram?: string;
  site?: string;
  mensagem?: string;
  enderecoCompleto?: string;
  status: string;
  createdAt: string | number;
  approvedAt?: string | number | null;
};

export default function SolicitacoesAdmin() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [filtro, setFiltro] = useState('todas');
  const [statusFiltro, setStatusFiltro] = useState('pendente');
  const [showAllPendentes, setShowAllPendentes] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0, hasMore: false });
  const limit = 10;

  const load = async (pageNum = 1) => {
    setCarregando(true);
    try {
      const effectiveLimit = statusFiltro === 'pendente' && showAllPendentes ? 100 : limit;
      const params = new URLSearchParams({ page: String(pageNum), limit: String(effectiveLimit) });
      if (statusFiltro !== 'todos') params.append('status', statusFiltro);
      if (filtro !== 'todas') params.append('tipo', filtro);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      const res = await fetch(`/api/solicitacoes?${params.toString()}`, { cache: 'no-store', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Erro ao buscar');
      
      setSolicitacoes(Array.isArray(data.data) ? data.data : []);
      setPagination(data.pagination || { total: 0, pages: 0, hasMore: false });
      setPage(pageNum);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Erro ao carregar solicitações.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { load(1); }, [filtro, statusFiltro, showAllPendentes]);

  const atualizarStatus = async (id: string, status: string) => {
    const loadingToast = toast.loading("Atualizando status...");
    try {
      const res = await fetch('/api/solicitacoes', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Falha ao atualizar');

      if (status === 'aprovada') {
        const sent = data?.emailStatus?.sent || data?.emailStatus?.user;
        if (sent) {
          toast.success('Aprovada! E-mail de aprovação enviado com sucesso.', { id: loadingToast });
        } else {
          toast.warning('Aprovada, mas houve problema no envio de notificação. Verifique os logs.', { id: loadingToast });
          console.warn('Resposta de emailStatus:', data?.emailStatus);
        }
      } else {
        toast.success('Solicitação rejeitada.', { id: loadingToast });
      }
      await load(page);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar.', { id: loadingToast });
    }
  };

  const updateLeitoraStatus = async (email: string, status: 'ativa'|'bloqueada'|'excluida') => {
    const loadingToast = toast.loading('Atualizando status da leitora...');
    try {
      const resList = await fetch('/api/colaboradores', { credentials: 'include' });
      if (!resList.ok) throw new Error('Erro ao buscar colaboradoras');
      const colaboradorasData = await resList.json();
      const leitora = colaboradorasData.find((u:any) => u.email?.toLowerCase() === email?.toLowerCase());
      if (!leitora) throw new Error('Leitora não encontrada no cadastro de colaboradoras');

      const res = await fetch('/api/colaboradores', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leitora.id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Falha ao atualizar leitora');

      toast.success(`Leitora ${status === 'ativa' ? 'ativada' : status === 'bloqueada' ? 'bloqueada' : 'excluída'} com sucesso.`, { id: loadingToast });
      await load(page);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar leitora.', { id: loadingToast });
    }
  };

  // Filtro Case-Insensitive (ignora maiúsculas/minúsculas)
  const itens = filtro === 'todas' 
    ? solicitacoes 
    : solicitacoes.filter(item => item.tipo?.toLowerCase() === filtro.toLowerCase());

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-8 font-sans">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-serif italic text-slate-900">Curadoria de Acessos</h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie quem entra no Clube das Leitoras.</p>
          <p className="text-slate-500 text-xs mt-2 italic">Duplicatas por e-mail, telefone ou nome são ocultadas para facilitar a triagem — somente a inscrição mais recente é exibida.</p>
        </div>
        <Button onClick={() => load()} variant="ghost" className="gap-2 text-slate-400 hover:text-slate-900">
          <RefreshCw size={16} className={carregando ? "animate-spin" : ""} /> Atualizar Lista
        </Button>
      </header>

      {/* Barra de Filtros Estilizada */}
      <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-xl w-fit">
        {['todas', 'leitora', 'escritora', 'empreendedora', 'parceria'].map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
              filtro === f ? 'bg-white shadow-sm text-[#B04D4A]' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {f === 'todas' ? 'Ver Todas' : f}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-xl w-fit">
        {['todos', 'pendente', 'aprovada', 'rejeitada'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFiltro(status)}
            className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
              statusFiltro === status ? 'bg-white shadow-sm text-[#B04D4A]' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {status === 'todos' ? 'Todos' : status === 'pendente' ? 'Pendentes' : status === 'aprovada' ? 'Aprovadas' : 'Rejeitadas'}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-4 py-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && load(1)}
            placeholder="Buscar por nome ou e-mail"
            className="bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
          />
          <Button onClick={() => load(1)} variant="outline" className="text-xs uppercase tracking-widest">
            Buscar
          </Button>
        </div>
        <div className="text-slate-500 text-sm italic">
          Exibindo <strong>{statusFiltro === 'todos' ? 'todas' : statusFiltro}</strong> solicitações {filtro !== 'todas' ? `de ${filtro}` : 'de todos os tipos'}.
        </div>
      </div>
      {statusFiltro === 'pendente' && (
        <div className="text-slate-500 text-sm italic">
          As barras de tipo mostram apenas pendentes enquanto o filtro de status estiver ativo.
          <button
            onClick={() => setShowAllPendentes(prev => !prev)}
            className="ml-2 underline text-[#B04D4A] hover:text-[#8B3A37]"
          >
            {showAllPendentes ? 'Limitar para páginas de 10' : 'Mostrar até 100 pendentes de uma vez'}
          </button>
        </div>
      )}

      {carregando ? (
        <div className="flex flex-col items-center py-20 opacity-20">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p className="font-serif italic text-xl">Consultando os manuscritos...</p>
        </div>
      ) : itens.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-[3rem]">
          <p className="text-slate-400 italic">
            Nenhuma solicitação de "{filtro}" com status "{statusFiltro}" encontrada.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {itens.map(item => (
            <div key={item.id} className="group bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden">
              
              {/* Tag de Status Lateral */}
              <div className={`absolute top-0 right-0 px-6 py-1 text-[9px] font-bold uppercase tracking-widest rounded-bl-2xl ${
                item.status === 'pendente' ? 'bg-amber-100 text-slate-900' : 
                item.status === 'aprovada' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {item.status}
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                
                {/* Coluna 1: Perfil */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-[#B04D4A] block mb-1">{item.tipo}</span>
                    <h3 className="text-xl font-serif text-slate-900 leading-tight">{item.nome}</h3>
                  </div>
                  <div className="space-y-2 text-sm text-slate-500">
                    <div className="flex items-center gap-2"><Mail size={14} className="opacity-40" /> {item.email}</div>
                    {item.telefone && <div className="flex items-center gap-2"><Phone size={14} className="opacity-40" /> {item.telefone}</div>}
                    {item.instagram && <div className="flex items-center gap-2"><Instagram size={14} className="opacity-40" /> <a href={item.instagram.startsWith('http') ? item.instagram : `https://instagram.com/${item.instagram.replace('@','')}`} target="_blank" className="text-blue-600 underline">{item.instagram}</a></div>}
                    {item.site && <div className="flex items-center gap-2"><MapPin size={14} className="opacity-40" /> <a href={item.site.startsWith('http') ? item.site : `https://${item.site}`} target="_blank" className="text-blue-600 underline">{item.site}</a></div>}
                    <div className="flex items-center gap-2"><Calendar size={14} className="opacity-40" /> Enviado em {normalizeDateValue(item.createdAt).toLocaleDateString('pt-BR')}</div>
                    {item.approvedAt && <div className="flex items-center gap-2"><Calendar size={14} className="opacity-40" /> Aceito em {normalizeDateValue(item.approvedAt).toLocaleDateString('pt-BR')}</div>}
                  </div>
                </div>

                {/* Coluna 2: Conteúdo/Mensagem */}
                <div className="md:col-span-1 bg-slate-50 p-6 rounded-3xl border border-black/[0.03]">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                    <MapPin size={12} /> Detalhes da Inscrição
                  </p>
                    {item.enderecoCompleto && (
                      <p className="text-sm text-slate-700 mb-2 break-words">
                        <strong>Endereço:</strong> {item.enderecoCompleto}
                      </p>
                    )}
                  <p className="text-sm text-slate-700 italic leading-relaxed whitespace-pre-line">
                    {item.mensagem || "Sem mensagem adicional."}
                  </p>
                </div>

                {/* Coluna 3: Ações */}
                <div className="flex flex-col justify-center gap-3">
                  {item.status === 'pendente' ? (
                    <>
                      <Button 
                        onClick={() => atualizarStatus(item.id, 'aprovada')} 
                        className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-2xl h-12 text-xs font-bold uppercase tracking-widest"
                      >
                        Aprovar Cadastro
                      </Button>
                      <Button 
                        onClick={() => atualizarStatus(item.id, 'rejeitada')} 
                        variant="outline"
                        className="w-full border-rose-200 text-rose-600 hover:bg-rose-50 rounded-2xl h-12 text-xs font-bold uppercase tracking-widest"
                      >
                        Recusar
                      </Button>
                    </>
                  ) : (
                    <div className="text-center p-4 border border-dashed border-slate-200 rounded-2xl text-xs">
                      <p className="font-semibold text-slate-700">Status: {item.status}</p>
                      {item.tipo === 'leitora' && (
                        <div className="mt-3 space-y-2">
                          <Button onClick={() => updateLeitoraStatus(item.email, 'bloqueada')} className="w-full bg-orange-500 hover:bg-orange-600 rounded-2xl h-10 text-xs" >Bloquear</Button>
                          <Button onClick={() => updateLeitoraStatus(item.email, 'ativa')} className="w-full bg-emerald-500 hover:bg-emerald-600 rounded-2xl h-10 text-xs" >Reativar</Button>
                          <Button onClick={() => updateLeitoraStatus(item.email, 'excluida')} className="w-full bg-rose-500 hover:bg-rose-600 rounded-2xl h-10 text-xs" >Excluir</Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>
          ))}

          {/* Paginação */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12 mb-8">
              <button
                onClick={() => load(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-6 py-2 rounded-lg font-bold uppercase text-[10px] tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-[#B04D4A] text-white hover:bg-[#8B3A37]"
              >
                ← Anterior
              </button>
              <span className="text-xs text-slate-500 italic">Página {page} de {pagination.pages}</span>
              <button
                onClick={() => load(page + 1)}
                disabled={!pagination.hasMore}
                className="px-6 py-2 rounded-lg font-bold uppercase text-[10px] tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-[#B04D4A] text-white hover:bg-[#8B3A37]"
              >
                Próxima →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}