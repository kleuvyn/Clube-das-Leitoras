"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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

export default function SolicitacoesAdmin() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const searchParams = useSearchParams();
  const [filtro, setFiltro] = useState('todas');
  type SolicitacaoType = 'todas' | 'leitora' | 'escritora' | 'empreendedora' | 'parceria' | 'carteirinha';
  const [statusFiltro, setStatusFiltro] = useState('pendente');
  const [showAllPendentes, setShowAllPendentes] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0, hasMore: false });
  const [uploadingCardIds, setUploadingCardIds] = useState<Record<string, boolean>>({});
  const [cardUploadErrors, setCardUploadErrors] = useState<Record<string, string>>({});
  const [uploadingImageIds, setUploadingImageIds] = useState<Record<string, boolean>>({});
  const [imageUploadErrors, setImageUploadErrors] = useState<Record<string, string>>({});
  const limit = 10;

  const load = async (pageNum = 1, forcedSearchTerm?: string) => {
    setCarregando(true);
    try {
      const effectiveLimit = statusFiltro === 'pendente' && showAllPendentes ? 100 : limit;
      const params = new URLSearchParams({ page: String(pageNum), limit: String(effectiveLimit) });
      if (statusFiltro !== 'todos') params.append('status', statusFiltro);
      if (filtro !== 'todas') params.append('tipo', filtro);
      const currentSearchTerm = forcedSearchTerm ?? searchTerm;
      if (currentSearchTerm.trim()) params.append('search', currentSearchTerm.trim());
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

  useEffect(() => {
    const tipo = searchParams.get('tipo');
    const search = (searchParams.get('search') || '').trim();

    if (tipo && tipo !== filtro) {
      setFiltro(tipo as SolicitacaoType);
    }

    if (search && search !== searchTerm) {
      setSearchTerm(search);
      load(1, search);
    }
  }, [searchParams]);

  useEffect(() => { load(1); }, [filtro, statusFiltro, showAllPendentes]);

const atualizarStatus = async (id: string, status: string, item?: Solicitacao) => {
    if (status === 'aprovada' && item && ['empreendedora', 'escritora'].includes(item.tipo) && !item.fotoUrl) {
      const confirmed = confirm(
        'Esta solicitação não tem imagem/logo gravada no sistema. Deseja aprovar mesmo assim? Se a solicitante enviou a imagem, confirme o link ou peça o reenvio antes de aprovar.'
      );
      if (!confirmed) return;
    }

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
      } else if (status === 'rejeitada') {
        toast.success('Solicitação rejeitada.', { id: loadingToast });
      }
      await load(page);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar.', { id: loadingToast });
    }
  };

  const excluirSolicitacao = async (id: string) => {
    if (!confirm('Excluir esta solicitação permanentemente?')) return;
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
      toast.error(err.message || 'Erro ao excluir solicitação.', { id: loadingToast });
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

  const handleUploadSolicitacaoImagem = async (id: string, file: File) => {
    setImageUploadErrors(prev => ({ ...prev, [id]: '' }));
    setUploadingImageIds(prev => ({ ...prev, [id]: true }));
    const loadingToast = toast.loading('Enviando imagem...');
    try {
      const url = await uploadFile(file);
      const res = await fetch('/api/solicitacoes', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, fotoUrl: url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Erro ao atualizar a solicitação');
      toast.success('Imagem anexada com sucesso.', { id: loadingToast });
      await load(page);
    } catch (err: any) {
      const message = err?.message || 'Erro ao enviar a imagem.';
      setImageUploadErrors(prev => ({ ...prev, [id]: message }));
      toast.error(message, { id: loadingToast });
    } finally {
      setUploadingImageIds(prev => ({ ...prev, [id]: false }));
    }
  };

  const updateLeitoraStatus = async (email: string, status: string) => {
    if (!confirm(`Alterar status da leitora com e-mail ${email} para ${status}?`)) return;
    const loadingToast = toast.loading('Atualizando status da leitora...');
    try {
      const searchRes = await fetch(`/api/colaboradores?email=${encodeURIComponent(email)}`, {
        credentials: 'include',
      });
      const searchData = await searchRes.json();
      if (!searchRes.ok || !Array.isArray(searchData.data) || searchData.data.length === 0) {
        throw new Error('Leitora não encontrada para o e-mail informado.');
      }
      const user = searchData.data[0];
      const res = await fetch('/api/colaboradores', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Falha ao atualizar status da leitora');
      toast.success('Status da leitora atualizado.', { id: loadingToast });
      await load(page);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar status da leitora.', { id: loadingToast });
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
        {['todas', 'leitora', 'escritora', 'empreendedora', 'parceria', 'carteirinha'].map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
              filtro === f ? 'bg-white shadow-sm text-rosa-gabi' : 'text-slate-500 hover:text-slate-700'
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
              statusFiltro === status ? 'bg-white shadow-sm text-rosa-gabi' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {status === 'todos' ? 'Todos' : status === 'pendente' ? 'Pendentes' : status === 'aprovada' ? 'Aprovadas' : 'Rejeitadas'}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
        <div className="flex flex-1 items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && load(1)}
            placeholder="Procurar por nome ou e-mail"
            className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
          />
          <Button
            onClick={() => load(1)}
            className="rounded-2xl bg-[#8C7B6E] px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm shadow-[#8C7B6E]/20 transition-colors hover:bg-[#7a6a5a]"
          >
            Procurar
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
            className="ml-2 underline text-rosa-gabi hover:text-[#8B3A37]"
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
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-rosa-gabi block mb-1">{item.tipo}</span>
                    <h3 className="text-xl font-serif text-slate-900 leading-tight">{item.nome}</h3>
                  </div>
                  <div className="space-y-2 text-sm text-slate-500">
                    <div className="flex items-center gap-2"><Mail size={14} className="opacity-40" /> {item.email}</div>
                    {item.whatsapp && <div className="flex items-center gap-2"><Phone size={14} className="opacity-40" /> {item.whatsapp}</div>}
                    {item.telefone && <div className="flex items-center gap-2"><Phone size={14} className="opacity-40" /> {item.telefone}</div>}
                    {item.instagram && <div className="flex items-center gap-2"><Instagram size={14} className="opacity-40" /> <a href={item.instagram.startsWith('http') ? item.instagram : `https://instagram.com/${item.instagram.replace('@','')}`} target="_blank" className="text-blue-600 underline">{item.instagram}</a></div>}
                    {item.site && <div className="flex items-center gap-2"><MapPin size={14} className="opacity-40" /> <a href={item.site.startsWith('http') ? item.site : `https://${item.site}`} target="_blank" className="text-blue-600 underline">{item.site}</a></div>}
                    <div className="flex items-center gap-2"><Calendar size={14} className="opacity-40" /> Enviado em {normalizeDateValue(item.createdAt).toLocaleDateString('pt-BR')}</div>
                    {item.approvedAt && <div className="flex items-center gap-2"><Calendar size={14} className="opacity-40" /> Aceito em {normalizeDateValue(item.approvedAt).toLocaleDateString('pt-BR')}</div>}
                  </div>
                  {item.fotoUrl && (
                    <div className="mt-4 rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                      <img src={item.fotoUrl} alt={`Foto de ${item.nome}`} className="w-full h-auto object-cover" />
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

                {/* Coluna 2: Conteúdo/Mensagem */}
                {(item.enderecoCompleto || item.mensagem) && (
                  <div className="md:col-span-1 bg-slate-50 p-6 rounded-3xl border border-black/3">
                    {item.enderecoCompleto && (
                      <p className="text-sm text-slate-700 mb-2 wrap-break-word">
                        <strong>Endereço:</strong> {item.enderecoCompleto}
                      </p>
                    )}
                    {item.mensagem && (
                      <p className="text-sm text-slate-700 italic leading-relaxed whitespace-pre-line">
                        {item.mensagem}
                      </p>
                    )}
                  </div>
                )}

                {/* Coluna 3: Ações */}
                <div className="flex flex-col justify-center gap-3">
                  {item.status === 'pendente' ? (
                    <>
                      <Button 
                        onClick={() => atualizarStatus(item.id, 'aprovada', item)} 
                        className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-2xl h-12 text-xs font-bold uppercase tracking-widest"
                      >
                        Aprovar Cadastro
                      </Button>
                      <Button 
                        onClick={() => atualizarStatus(item.id, 'rejeitada', item)} 
                        variant="outline"
                        className="w-full border-rose-200 text-rose-600 hover:bg-rose-50 rounded-2xl h-12 text-xs font-bold uppercase tracking-widest"
                      >
                        Recusar
                      </Button>
                    </>
                  ) : (
                    <div className="text-center p-4 border border-dashed border-slate-200 rounded-2xl text-xs">
                      {item.tipo !== 'carteirinha' && (
                        <p className="font-semibold text-slate-700">Status: {item.status}</p>
                      )}
                      {item.status === 'rejeitada' && (
                        <div className="mt-3 space-y-2">
                          <Button onClick={() => atualizarStatus(item.id, 'aprovada')} className="w-full bg-emerald-500 hover:bg-emerald-600 rounded-2xl h-10 text-xs">Aceitar agora</Button>
                          <Button onClick={() => excluirSolicitacao(item.id)} className="w-full bg-rose-500 hover:bg-rose-600 rounded-2xl h-10 text-xs">Excluir solicitação</Button>
                        </div>
                      )}
                      {item.status === 'aprovada' && item.tipo === 'leitora' && (
                        <div className="mt-3 space-y-2">
                          <Button onClick={() => updateLeitoraStatus(item.email, 'bloqueada')} className="w-full bg-orange-500 hover:bg-orange-600 rounded-2xl h-10 text-xs" >Bloquear</Button>
                          <Button onClick={() => updateLeitoraStatus(item.email, 'ativa')} className="w-full bg-emerald-500 hover:bg-emerald-600 rounded-2xl h-10 text-xs" >Reativar</Button>
                          <Button onClick={() => updateLeitoraStatus(item.email, 'excluida')} className="w-full bg-rose-500 hover:bg-rose-600 rounded-2xl h-10 text-xs" >Excluir</Button>
                        </div>
                      )}
                      {item.status !== 'pendente' && item.status !== 'rejeitada' && item.status !== 'aprovada' && (
                        <Button onClick={() => excluirSolicitacao(item.id)} className="w-full bg-rose-500 hover:bg-rose-600 rounded-2xl h-10 text-xs">Excluir solicitação</Button>
                      )}
                    </div>
                  )}

                  {!item.fotoUrl && item.tipo !== 'carteirinha' && (
                    <div className={`rounded-2xl border p-4 text-left space-y-3 ${item.status === 'aprovada' ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-slate-50'}`}>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-2">Nenhuma imagem/logo recebida</p>
                        <p className="text-xs leading-relaxed ${item.status === 'aprovada' ? 'text-rose-700' : 'text-slate-600'}">
                          {item.status === 'aprovada'
                            ? 'Esta solicitação foi aprovada sem imagem/logo no sistema. Se a solicitante enviou a imagem, confirme o link ou peça o reenvio antes de fazer upload manual.'
                            : 'Este pedido não tem imagem/logo gravada no sistema. Se a solicitante enviou, confirme o link ou peça o reenvio antes de fazer upload manual.'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-2">Upload de imagem/logo</p>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingImageIds[item.id]}
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            handleUploadSolicitacaoImagem(item.id, file);
                            event.currentTarget.value = '';
                          }}
                          className="text-xs text-slate-600"
                        />
                        {imageUploadErrors[item.id] && (
                          <p className="mt-2 text-[11px] text-rose-600">{imageUploadErrors[item.id]}</p>
                        )}
                      </div>
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