"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, RefreshCw, Users, Link2 } from 'lucide-react';

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

  useEffect(() => {
    carregarRoda();
  }, []);

  return (
    <div className="min-h-screen p-8 space-y-8 bg-[#FAF7F1] text-slate-900 font-alice">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f8efe0] px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-slate-700 font-bold">
            <Mic size={14} /> Roda de Vozes
          </div>
          <h1 className="mt-4 text-3xl font-serif italic text-slate-900">Administração da Roda de Vozes</h1>
          <p className="max-w-2xl mt-3 text-sm leading-6 text-slate-600">
            Aqui você acompanha a sessão ativa e os participantes cadastrados para a roda de vozes.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={carregarRoda} variant="outline" className="flex items-center gap-2">
            <RefreshCw size={16} /> Atualizar
          </Button>
          <Button asChild>
            <a href="/roda-vozes" target="_blank" rel="noreferrer" className="flex items-center gap-2">
              <Link2 size={16} /> Abrir público
            </a>
          </Button>
        </div>
      </div>

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
          <p className="mt-3 text-sm leading-relaxed text-slate-700 break-words">{rodaId ?? 'Nenhuma roda encontrada'}</p>
        </div>
      </div>

      <section className="rounded-3xl border border-[#E9E4DD] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-4">
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
              <div key={participante.id} className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#F0ECE7] bg-[#FCFAF6] p-4">
                <div>
                  <p className="text-base font-semibold text-slate-900">{participante.nome}</p>
                  <p className="text-sm text-slate-500">Ordem #{participante.ordem}</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-slate-700 border border-slate-200">
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
