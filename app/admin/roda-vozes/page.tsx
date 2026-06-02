"use client";

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Mic, RefreshCw, Users } from 'lucide-react';

interface Participante {
  id: string;
  nome: string;
  ordem: number;
  falou: boolean;
  tempoUtilizado: number;
  minutosAdicionaisUsados: number;
}

export default function AdminRodaVozesPage() {
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [rodaId, setRodaId] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [participantes, setParticipantes] = useState<Participante[]>([]);

  const carregarRoda = async () => {
    try {
      setLoading(true);
      setErro('');
      const res = await fetch('/api/roda-vozes', { cache: 'no-store' });
      if (!res.ok) throw new Error('Falha ao carregar a roda de vozes.');
      const data = await res.json();
      if (data.success !== true) {
        throw new Error(data.error || 'Resposta inválida da API.');
      }
      setParticipantes(data.participantes || []);
      setRodaId(data.roda?.id ?? null);
      setStatus(data.roda?.status ?? 'desconhecido');
    } catch (err: any) {
      console.error(err);
      setErro(err?.message || 'Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRodaStatus = async () => {
    if (!rodaId) return;

    const novoStatus = status === 'ativa' ? 'pausada' : 'ativa';
    try {
      const res = await fetch('/api/roda-vozes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rodaId, status: novoStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Falha ao atualizar status.');

      setStatus(data.roda?.status || novoStatus);
      toast.success(`Roda ${novoStatus === 'ativa' ? 'ativada' : 'desativada'} com sucesso.`);
      carregarRoda();
    } catch (err: any) {
      console.error('Erro ao alterar status da roda:', err);
      toast.error(err?.message || 'Erro ao alterar o status da roda.');
    }
  };

  const handleLimparParticipantes = async () => {
    if (!rodaId) return;

    const confirmacao = window.confirm(
      'Tem certeza que deseja limpar a lista anterior desta roda? Esta ação não pode ser desfeita.'
    );

    if (!confirmacao) return;

    try {
      const res = await fetch('/api/roda-vozes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rodaId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Falha ao limpar a lista anterior.');
      }

      setParticipantes([]);
      toast.success('Lista anterior limpa com sucesso.');
      carregarRoda();
    } catch (err: any) {
      console.error('Erro ao limpar participantes:', err);
      toast.error(err?.message || 'Erro ao limpar a lista anterior.');
    }
  };

  useEffect(() => {
    carregarRoda();
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 space-y-10 font-alice text-slate-900">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-[#E9E4DD] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f8efe0] px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-slate-700 font-bold">
            <Mic size={14} /> Roda de Vozes
          </div>
          <h1 className="mt-4 text-3xl font-serif italic text-slate-900">Administração da Roda de Vozes</h1>
          <p className="max-w-2xl mt-3 text-sm leading-6 text-slate-600">
            Aqui você acompanha a sessão ativa e os participantes cadastrados para a roda de vozes.
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-3 w-full md:w-auto">
          <Button onClick={carregarRoda} variant="outline" className="flex items-center gap-2">
            <RefreshCw size={16} /> Atualizar
          </Button>
          <Button onClick={handleToggleRodaStatus} className="flex items-center gap-2 bg-rosa-gabi text-white hover:bg-[#8B3A37]">
            {status === 'ativa' ? 'Desativar Roda' : 'Ativar Roda'}
          </Button>
          <Button onClick={handleLimparParticipantes} variant="destructive" className="flex items-center gap-2">
            Limpar Lista Anterior
          </Button>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-[#E9E4DD] bg-white p-6 shadow-sm">
          <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Status</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900 capitalize">{status}</p>
        </div>
        <div className="rounded-3xl border border-[#E9E4DD] bg-white p-6 shadow-sm">
          <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Participantes</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{participantes.length}</p>
        </div>
        <div className="rounded-3xl border border-[#E9E4DD] bg-white p-6 shadow-sm">
          <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Roda ativa</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-700 wrap-break-word">{rodaId ?? 'Nenhuma roda encontrada'}</p>
        </div>
      </div>

      <section className="rounded-4xl border border-[#E9E4DD] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Lista de Participantes</h2>
            <p className="text-sm text-slate-500">Ordem de fala atual e histórico de presença.</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-slate-600">
            <Users size={14} /> {participantes.length}
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500">Carregando participantes...</div>
        ) : erro ? (
          <div className="py-12 text-center text-rose-600">{erro}</div>
        ) : participantes.length === 0 ? (
          <div className="py-12 text-center text-slate-500">Nenhum participante registrado ainda.</div>
        ) : (
          <div className="space-y-3">
            {participantes.map((participante) => (
              <div key={participante.id} className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#F0ECE7] bg-white p-4">
                <div>
                  <p className="text-base font-semibold text-slate-900">{participante.nome}</p>
                  <p className="text-sm text-slate-500">Ordem #{participante.ordem}</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-slate-700 border border-slate-200">
                  {participante.falou ? 'Já falou' : 'Ainda não falou'}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
