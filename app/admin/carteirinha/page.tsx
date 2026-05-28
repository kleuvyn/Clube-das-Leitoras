"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { uploadFile } from '@/lib/upload-client';
import { toast } from 'sonner';
import { Loader2, RefreshCw, Mail, Phone, Calendar, MapPin, Instagram, ArrowUpRight, Search } from 'lucide-react';
import { normalizeDateValue } from '@/lib/utils';

type Solicitacao = {
  id: string;
  tipo: string;
  nome: string;
  email: string;
  telefone?: string;
  whatsapp?: string;
  fotoUrl?: string;
  carteirinhaUrl?: string;
  instagram?: string;
  site?: string;
  mensagem?: string;
  enderecoCompleto?: string;
  status: string;
  createdAt: string | number;
  approvedAt?: string | number | null;
};

export default function AdminCarteirinhaPage() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [statusFiltro, setStatusFiltro] = useState('pendente');
  const [showAllPendentes, setShowAllPendentes] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0, hasMore: false });
  const [uploadingCardIds, setUploadingCardIds] = useState<Record<string, boolean>>({});
  const [cardUploadErrors, setCardUploadErrors] = useState<Record<string, string>>({});
  const [resendingIds, setResendingIds] = useState<Record<string, boolean>>({});
  const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({});
  const [removingCardIds, setRemovingCardIds] = useState<Record<string, boolean>>({});
  const limit = 10;

  const load = async (
    pageNum = 1,
    overrides?: { statusFiltro?: string; searchTerm?: string; showAllPendentes?: boolean }
  ) => {
    setCarregando(true);
    try {
      const currentStatus = overrides?.statusFiltro ?? statusFiltro;
      const currentSearch = overrides?.searchTerm ?? searchTerm;
      const currentShowAllPendentes = overrides?.showAllPendentes ?? showAllPendentes;

      const effectiveLimit = currentStatus === 'pendente' && currentShowAllPendentes ? 100 : limit;
      const params = new URLSearchParams({ page: String(pageNum), limit: String(effectiveLimit), tipo: 'carteirinha' });
      if (currentStatus !== 'todos') params.append('status', currentStatus);
      if (currentSearch.trim()) params.append('search', currentSearch.trim());
      const res = await fetch(`/api/solicitacoes?${params.toString()}`, { cache: 'no-store', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Erro ao buscar');

      setSolicitacoes(Array.isArray(data.data) ? data.data : []);
      setPagination(data.pagination || { total: 0, pages: 0, hasMore: false });
      setPage(pageNum);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Erro ao carregar carteirinhas.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { load(1); }, [statusFiltro, showAllPendentes]);

  const atualizarStatus = async (id: string, status: string) => {
    const loadingToast = toast.loading('Atualizando status...');
    try {
      const res = await fetch('/api/solicitacoes', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Falha ao atualizar');

      toast.success(status === 'aprovada' ? 'Solicitação aprovada.' : 'Solicitação rejeitada.', { id: loadingToast });
      await load(page);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar.', { id: loadingToast });
    }
  };

  const handleUploadCarteirinha = async (id: string, file: File) => {
    setCardUploadErrors(prev => ({ ...prev, [id]: '' }));
    setUploadingCardIds(prev => ({ ...prev, [id]: true }));
    const loadingToast = toast.loading('Enviando carteirinha...');
    try {
      const url = await uploadFile(file);
      const res = await fetch('/api/solicitacoes', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, carteirinhaUrl: url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Erro ao atualizar a solicitação');
      toast.success('Carteirinha anexada e e-mail enviado com sucesso.', { id: loadingToast });
      await load(page);
    } catch (err: any) {
      const message = err?.message || 'Erro ao enviar a carteirinha.';
      setCardUploadErrors(prev => ({ ...prev, [id]: message }));
      toast.error(message, { id: loadingToast });
    } finally {
      setUploadingCardIds(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDownloadPhoto = async (url: string, name: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const fileExtension = blob.type.split('/')[1] || 'jpg';
      const fileName = `${name.replace(/\s+/g, '_') || 'foto'}.${fileExtension}`;
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      window.open(url, '_blank');
    }
  };

  const handleReenviarEmail = async (id: string) => {
    setResendingIds(prev => ({ ...prev, [id]: true }));
    const loadingToast = toast.loading('Reenviando e-mail...');
    try {
      const res = await fetch('/api/solicitacoes', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, resendEmail: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Falha ao reenviar e-mail');
      toast.success('E-mail reenviado com sucesso.', { id: loadingToast });
      await load(page);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao reenviar e-mail.', { id: loadingToast });
    } finally {
      setResendingIds(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleRemoverCarteirinha = async (id: string) => {
    if (!confirm('Excluir esta carteirinha por completo? Isso remove a solicitação e o cartão do perfil.')) return;
    setRemovingCardIds(prev => ({ ...prev, [id]: true }));
    const loadingToast = toast.loading('Excluindo carteirinha...');
    try {
      const res = await fetch(`/api/solicitacoes?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Falha ao excluir carteirinha');
      toast.success('Carteirinha excluída por completo.', { id: loadingToast });
      await load(page);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir carteirinha.', { id: loadingToast });
    } finally {
      setRemovingCardIds(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleExcluir = async (id: string) => {
    if (!confirm('Excluir esta solicitação? Esta ação não pode ser desfeita.')) return;
    setDeletingIds(prev => ({ ...prev, [id]: true }));
    const loadingToast = toast.loading('Excluindo solicitação...');
    try {
      const res = await fetch(`/api/solicitacoes?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Falha ao excluir');
      toast.success('Solicitação excluída.', { id: loadingToast });
      await load(page);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir.', { id: loadingToast });
    } finally {
      setDeletingIds(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-8 font-sans">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-serif italic text-slate-900">Carteirinhas</h1>
          <p className="text-slate-500 text-sm mt-1">Esta página mostra apenas solicitações de carteirinha. Selecione uma solicitação aprovada e faça upload do arquivo para enviar por email e deixá-la disponível no perfil.</p>
        </div>
        <Button onClick={() => load(1)} variant="ghost" className="gap-2 text-slate-400 hover:text-slate-900">
          <RefreshCw size={16} className={carregando ? 'animate-spin' : ''} /> Atualizar
        </Button>
      </header>

      <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-xl w-fit">
        {['todos', 'pendente', 'aprovada', 'rejeitada', 'excluida'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFiltro(status)}
            className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
              statusFiltro === status ? 'bg-white shadow-sm text-rosa-gabi' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {status === 'todos' ? 'Todos' : status === 'pendente' ? 'Pendentes' : status === 'aprovada' ? 'Aprovadas' : status === 'rejeitada' ? 'Rejeitadas' : 'Excluídas'}
          </button>
        ))}
      </div>

      {statusFiltro === 'pendente' && (
        <div className="text-slate-500 text-sm italic">
          As barras de tipo mostram apenas carteirinhas enquanto o filtro de status estiver ativo.
          <button
            onClick={() => setShowAllPendentes(prev => !prev)}
            className="ml-2 underline text-rosa-gabi hover:text-[#8B3A37]"
          >
            {showAllPendentes ? 'Limitar para páginas de 10' : 'Mostrar até 100 pendentes de uma vez'}
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && load(1)}
            placeholder="Buscar por nome ou e-mail"
            className="bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
          />
          <Button
            onClick={() => load(1)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#8C7B6E] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-md shadow-[#8C7B6E]/30 transition-all hover:bg-[#7a6a5a] hover:shadow-lg"
          >
            <Search size={14} />
            Buscar
          </Button>
        </div>
        <div className="text-slate-500 text-sm italic">
          Exibindo <strong>{statusFiltro === 'todos' ? 'todas' : statusFiltro}</strong> solicitações de carteirinha.
        </div>
      </div>

      {carregando ? (
        <div className="flex flex-col items-center py-20 opacity-20">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p className="font-serif italic text-xl">Consultando os acessos...</p>
        </div>
      ) : solicitacoes.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-[3rem]">
          <p className="text-slate-400 italic">Nenhuma solicitação de carteirinha encontrada.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {solicitacoes.map(item => {
            const normalizedMessage = (item.mensagem || '').trim();
            const hasUsefulMessage = normalizedMessage.length > 0 && normalizedMessage.toLowerCase() !== 'sem mensagem';
            const hasDetails = Boolean(item.enderecoCompleto) || hasUsefulMessage;

            return (
            <div key={item.id} className="group bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden">
              <div className={`absolute top-0 right-0 px-6 py-1 text-[9px] font-bold uppercase tracking-widest rounded-bl-2xl ${
                item.status === 'pendente' ? 'bg-amber-100 text-slate-900' : item.status === 'aprovada' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {item.status}
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-rosa-gabi block mb-1">{item.tipo}</span>
                    <h3 className="text-xl font-serif text-slate-900 leading-tight">{item.nome}</h3>
                  </div>
                  <div className="space-y-2 text-sm text-slate-500">
                    <div className="flex items-center gap-2"><Mail size={14} className="opacity-40" /> {item.email}</div>
                    {item.whatsapp && <div className="flex items-center gap-2"><Phone size={14} className="opacity-40" /> {item.whatsapp}</div>}
                    {item.telefone && <div className="flex items-center gap-2"><Phone size={14} className="opacity-40" /> {item.telefone}</div>}
                    {item.instagram && <div className="flex items-center gap-2"><Instagram size={14} className="opacity-40" /> <a href={item.instagram.startsWith('http') ? item.instagram : `https://instagram.com/${item.instagram.replace('@','')}`} target="_blank" rel="noreferrer" className="text-blue-600 underline">{item.instagram}</a></div>}
                    {item.site && <div className="flex items-center gap-2"><MapPin size={14} className="opacity-40" /> <a href={item.site.startsWith('http') ? item.site : `https://${item.site}`} target="_blank" rel="noreferrer" className="text-blue-600 underline">{item.site}</a></div>}
                    <div className="flex items-center gap-2"><Calendar size={14} className="opacity-40" /> Enviado em {normalizeDateValue(item.createdAt).toLocaleDateString('pt-BR')}</div>
                    {item.approvedAt && <div className="flex items-center gap-2"><Calendar size={14} className="opacity-40" /> Aceito em {normalizeDateValue(item.approvedAt).toLocaleDateString('pt-BR')}</div>}
                  </div>
                  {item.fotoUrl && (
                    <div className="mt-4 inline-flex flex-col items-start gap-2">
                      <div className="h-28 w-28 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                        <img src={item.fotoUrl} alt={`Foto de ${item.nome}`} className="h-full w-full object-cover object-center" />
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Foto 4x4</span>
                    </div>
                  )}
                  {item.fotoUrl && (
                    <div className="mt-3">
                      <Button
                        type="button"
                        onClick={() => handleDownloadPhoto(item.fotoUrl!, item.nome)}
                        className="w-full justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white hover:bg-slate-700"
                      >
                        Baixar foto
                      </Button>
                    </div>
                  )}
                </div>

                {hasDetails && (
                  <div className="md:col-span-1 bg-slate-50 p-6 rounded-3xl border border-black/3">
                    {item.enderecoCompleto && (
                      <p className="text-sm text-slate-700 mb-2 wrap-break-word"><strong>Endereço:</strong> {item.enderecoCompleto}</p>
                    )}
                    {hasUsefulMessage && (
                      <p className="text-sm text-slate-700 italic leading-relaxed whitespace-pre-line">{normalizedMessage}</p>
                    )}
                  </div>
                )}

                <div className="flex flex-col justify-center gap-3">
                  {item.status === 'pendente' ? (
                    <>
                      <Button
                        onClick={() => atualizarStatus(item.id, 'aprovada')}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-2xl h-12 text-xs font-bold uppercase tracking-widest"
                      >
                        Aprovar Carteirinha
                      </Button>
                      <Button
                        onClick={() => atualizarStatus(item.id, 'rejeitada')}
                        variant="outline"
                        className="w-full border-rose-200 text-rose-600 hover:bg-rose-50 rounded-2xl h-12 text-xs font-bold uppercase tracking-widest"
                      >
                        Recusar
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleExcluir(item.id)}
                        disabled={deletingIds[item.id]}
                        variant="destructive"
                        className="w-full h-12 text-xs font-bold uppercase tracking-widest"
                      >
                        {deletingIds[item.id] ? 'Excluindo...' : 'Excluir'}
                      </Button>
                    </>
                  ) : (
                    <div className="text-center p-4 border border-dashed border-slate-200 rounded-2xl text-xs">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">Status</p>
                      <div className={`mx-auto mt-3 inline-flex items-center justify-center rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] ${
                        item.status === 'pendente' ? 'bg-amber-100 text-amber-800' : item.status === 'aprovada' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {item.status}
                      </div>
                      {item.carteirinhaUrl && (
                        <div className="mt-4 space-y-3 text-left">
                          <a href={item.carteirinhaUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-rosa-gabi hover:text-[#8C3A3F]">
                            Abrir carteirinha
                            <ArrowUpRight size={14} />
                          </a>
                          <p className="text-[11px] leading-relaxed">Carteirinha enviada por email para a leitora.</p>

                          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white">
                            {item.carteirinhaUrl.toLowerCase().endsWith('.pdf') ? (
                              <iframe
                                src={item.carteirinhaUrl}
                                title={`Prévia da carteirinha de ${item.nome}`}
                                className="h-64 w-full"
                              />
                            ) : (
                              <img
                                src={item.carteirinhaUrl}
                                alt={`Carteirinha de ${item.nome}`}
                                className="h-64 w-full object-contain bg-slate-50"
                              />
                            )}
                          </div>
                        </div>
                      )}
                      {!item.carteirinhaUrl && item.status !== 'rejeitada' && (
                        <div className="space-y-3 text-left">
                          <label className="grid gap-2 text-slate-500">
                            <span className="text-[11px] uppercase tracking-[0.2em]">Upload da carteirinha</span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadingCardIds[item.id]}
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (!file) return;
                                handleUploadCarteirinha(item.id, file);
                                event.currentTarget.value = '';
                              }}
                              className="w-full text-xs text-slate-600 file:mr-3 file:rounded-xl file:border-0 file:bg-[#8C7B6E] file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-[0.2em] file:text-white file:shadow-sm file:shadow-[#8C7B6E]/30 hover:file:bg-[#7a6a5a] disabled:opacity-60"
                            />
                          </label>
                          {cardUploadErrors[item.id] && <p className="text-rose-600 text-[11px]">{cardUploadErrors[item.id]}</p>}
                          <p className="text-[11px] text-slate-500">Ao enviar o arquivo, o sistema encaminha o email para a leitora e libera a carteirinha no perfil.</p>
                        </div>
                      )}
                      <div className="mt-4 grid gap-2">
                        <Button
                          type="button"
                          onClick={() => handleReenviarEmail(item.id)}
                          disabled={resendingIds[item.id]}
                          className="w-full bg-slate-900 text-white hover:bg-slate-800 rounded-2xl h-11 text-xs font-semibold uppercase tracking-[0.2em]"
                        >
                          {resendingIds[item.id] ? 'Reenviando...' : 'Reenviar'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleRemoverCarteirinha(item.id)}
                          disabled={removingCardIds[item.id]}
                          className="w-full rounded-2xl border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:border-rose-300 h-11 text-xs font-semibold uppercase tracking-[0.2em]"
                        >
                          {removingCardIds[item.id] ? 'Removendo...' : 'Excluir carteirinha'}
                        </Button>
                        {item.status !== 'aprovada' && item.status !== 'excluida' && (
                          <Button
                            type="button"
                            onClick={() => handleExcluir(item.id)}
                            disabled={deletingIds[item.id]}
                            variant="destructive"
                            className="w-full h-11 text-xs font-semibold uppercase tracking-[0.2em]"
                          >
                            {deletingIds[item.id] ? 'Excluindo...' : 'Excluir solicitação'}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )})}

          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12 mb-8">
              <button
                onClick={() => load(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-6 py-2 rounded-lg font-bold uppercase text-[10px] tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-rosa-gabi text-white hover:bg-[#8B3A37]"
              >
                ← Anterior
              </button>
              <span className="text-xs text-slate-500 italic">Página {page} de {pagination.pages}</span>
              <button
                onClick={() => load(page + 1)}
                disabled={!pagination.hasMore}
                className="px-6 py-2 rounded-lg font-bold uppercase text-[10px] tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-rosa-gabi text-white hover:bg-[#8B3A37]"
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
