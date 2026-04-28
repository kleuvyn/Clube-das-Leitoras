"use client";

import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { 
  Gift, Loader2, Plus, Trash2, Search, ShieldCheck, 
  Users, PartyPopper, RefreshCw, Trophy, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { normalizeDateValue } from '@/lib/utils';

const mesAtualRef = new Date().toISOString().substring(0, 7);

type Participante = { id?: string; nome: string };
type SorteioHistorico = { id?: string; nome: string; premio: string; dataSorteio?: string };
type SorteioPremio = { id: string; premio: string; mesBase: string };

export default function AdminSorteiosPage() {
  const [loading, setLoading] = useState(true);
  
  // States - Dados
  const [premios, setPremios] = useState<SorteioPremio[]>([]);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [historico, setHistorico] = useState<SorteioHistorico[]>([]);
  const [urnaAberta, setUrnaAberta] = useState(true);

  // States - Interação UI
  const [busca, setBusca] = useState('');
  const [premioText, setPremioText] = useState('');
  const [savingPremio, setSavingPremio] = useState(false);

  // States - Sorteio
  const [sorteando, setSorteando] = useState(false);
  const [vencedoresAtuais, setVencedoresAtuais] = useState<SorteioHistorico[]>([]);
  const [drawCount, setDrawCount] = useState(1);

  const corDestaque = "#B06543";

  const carregarDados = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sorteios');
      if (!res.ok) throw new Error('Falha ao carregar dados do Sorteio.');
      const data = await res.json();
      
      setPremios((data.premios || []).filter((item: any) => item.mesBase === mesAtualRef));
      setParticipantes(data.participantes || []);
      setHistorico(data.historico || []);
      setUrnaAberta(data.urnaAberta ?? true);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar dados do Sorteio da base.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const participantesFiltrados = useMemo(() => {
    if (!busca.trim()) return participantes;
    return participantes.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()));
  }, [participantes, busca]);

  // ================= 3. Gestão de Prêmios =================
  const handleAddPremio = async () => {
    const value = premioText.trim();
    if (!value) {
      toast.error('Informe o nome do prêmio.');
      return;
    }

    setSavingPremio(true);
    try {
      const res = await fetch('/api/sorteios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addPremio', payload: { premio: value, mesBase: mesAtualRef } }),
      });
      if (!res.ok) throw new Error('Erro ao adicionar prêmio.');
      const data = await res.json();
      setPremios(prev => [...prev, data]);
      setPremioText('');
      toast.success('Prêmio adicionado com sucesso!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingPremio(false);
    }
  };

  const handleRemovePremio = async (id: string) => {
    if (!confirm('Deseja excluir este prêmio?')) return;
    try {
      const res = await fetch('/api/sorteios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'removePremio', payload: { id } }),
      });
      if (!res.ok) throw new Error();
      setPremios(prev => prev.filter(p => p.id !== id));
      toast.success('Prêmio removido.');
    } catch {
      toast.error('Não foi possível remover o prêmio.');
    }
  };

  // ================= 2. Gestão de Participantes =================
  const handleRemoveParticipante = async (id: string | undefined, nome: string) => {
    if (!confirm(`Remover participante ${nome}?`)) return;
    try {
      const res = await fetch('/api/sorteios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'removeParticipante', payload: id ? { id } : { nome } }),
      });
      if (!res.ok) throw new Error();
      setParticipantes(prev => prev.filter((p) => (id ? p.id !== id : p.nome !== nome)));
      toast.success('Participante removido da urna.');
    } catch {
      toast.error('Não foi possível remover nome.');
    }
  };

  const handleSetUrnaStatus = async (open: boolean) => {
    try {
      const res = await fetch('/api/sorteios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setUrnaStatus', payload: { mesBase: mesAtualRef, urnaAberta: open } }),
      });
      const body = await res.json();
      if (!res.ok) {
        console.error('Falha ao alterar urna:', body);
        throw new Error(body?.error || 'Erro desconhecido');
      }
      setUrnaAberta(open);
      toast.success(`Urna ${open ? 'aberta' : 'fechada'} com sucesso.`);
    } catch (error) {
      console.error('Erro ao alterar o estado da urna:', error);
      toast.error('Erro ao alterar o estado da urna.');
    }
  };

  // ================= 4. Controle de Sorteio =================
  const sortearIndice = (total: number) => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % total;
  };

  const maxDrawCount = premios.length > 0 ? Math.min(premios.length, participantes.length) : participantes.length;

  useEffect(() => {
    if (maxDrawCount > 0 && drawCount > maxDrawCount) {
      setDrawCount(maxDrawCount);
    }
  }, [maxDrawCount, drawCount]);

  const handleRealizarSorteio = async () => {
    if (participantes.length === 0) {
      toast.error('Urna de participantes vazia!');
      return;
    }

    const count = Math.max(1, Math.min(drawCount, maxDrawCount || 1));
    if (count === 0) {
      toast.error('Não há participantes suficientes para esse sorteio.');
      return;
    }

    setSorteando(true);
    setVencedoresAtuais([]);

    const participantesDisponiveis = [...participantes];
    const premiosDisponiveis = premios.length > 0 ? [...premios.map(p => p.premio)] : Array(count).fill('Surpresa especial do mês');
    const resultados: SorteioHistorico[] = [];

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    try {
      for (let i = 0; i < count; i += 1) {
        const indiceVencedor = sortearIndice(participantesDisponiveis.length);
        const ganhadora = participantesDisponiveis.splice(indiceVencedor, 1)[0];
        const indicePremio = sortearIndice(premiosDisponiveis.length);
        const premioSorteado = premiosDisponiveis.splice(indicePremio, 1)[0];

        resultados.push({ nome: ganhadora.nome, premio: premioSorteado, dataSorteio: new Date().toISOString() });
        setVencedoresAtuais([...resultados]);
        await delay(700);
      }

      const responses = await Promise.all(resultados.map((item) =>
        fetch('/api/sorteios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'salvarHistorico',
            payload: { nome: item.nome, premio: item.premio, mesBase: mesAtualRef },
          }),
        })
      ));

      if (responses.some((res) => !res.ok)) throw new Error();

      const novosHistoricos = await Promise.all(responses.map((res) => res.json()));
      setParticipantes((prev) => prev.filter((p) => !resultados.some((item) => item.nome === p.nome)));
      setHistorico((prev) => [...novosHistoricos, ...prev]);
      setVencedoresAtuais(novosHistoricos);

      toast.success('🎉 Sorteio realizado com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error('Ocorreu um erro ao finalizar e registrar o sorteio.');
    } finally {
      setSorteando(false);
    }
  };

  const handleResetarSorteio = () => {
    if (confirm('Deseja preparar uma nova rodada ocultando o resultado atual?')) {
      setVencedoresAtuais([]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="italic font-alice">Carregando painel de sorteios...</p>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-10 font-alice pb-24 space-y-10 text-[#1A1A1A]">
      {/* 1. Cabeçalho Seguro */}
      <header className="flex flex-col gap-2 pb-6 border-b border-[#E5E1DA]">
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.35em]" style={{ color: corDestaque }}>
          <ShieldCheck size={16} /> Admin • Sorteios do Clube
        </div>
        <h1 className="text-4xl lg:text-5xl tracking-tight leading-none mt-2 mb-1">
          Gerencie <span className="italic" style={{ color: corDestaque }}>Sorteios e Prêmios</span>
        </h1>
        <p className="text-sm font-serif italic text-slate-600 opacity-80">
          Controle participantes, adicione prêmios avulsos e realize sorteios de forma segura.
        </p>
      </header>

      <div className="grid lg:grid-cols-[1.5fr_1fr] xl:grid-cols-[2fr_1.5fr] gap-8">
        
        {/* COLUNA ESQUERDA: Participantes e Histórico */}
        <div className="space-y-8">
          
          {/* 2. Lista de Participantes */}
          <section className="bg-white border shadow-sm rounded-xl p-6" style={{ borderColor: '#E5E1DA' }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 mb-4" style={{ borderColor: '#E5E1DA' }}>
              <div>
                <h2 className="text-xl flex items-center gap-2 font-semibold">
                  <Users size={20} className="opacity-80" /> Lista de Participantes
                </h2>
                <p className="text-xs text-slate-500 italic mt-1">Total na urna: {participantes.length} nomes - 1 entrada por participante</p>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar participante..."
                  className="pl-9 pr-4 py-2 border rounded-full text-sm bg-slate-50 w-full md:w-64 outline-none focus:ring-1 focus:ring-[#B06543]/30"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto pr-2 custom-scrollbar">
              {participantesFiltrados.length === 0 ? (
                <div className="text-center py-10 text-slate-400 font-serif italic text-sm">
                  Nenhum nome participante encontrado na urna atual.
                </div>
              ) : (
                <ul className="space-y-2">
                  {participantesFiltrados.map((p, index) => (
                    <li key={p.id ?? `${p.nome}-${index}`} className="flex justify-between items-center bg-[#FAFAF5] border border-[#EDEBE6] py-2 px-4 rounded-lg">
                      <span className="font-serif text-[15px] opacity-90">{p.nome}</span>
                      <button 
                        onClick={() => handleRemoveParticipante(p.id, p.nome)}
                        className="text-red-600/70 hover:text-red-700 hover:bg-red-50 p-2 rounded-md transition-colors"
                        title="Remover nome"
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* 6. Histórico */}
          <section className="bg-white border shadow-sm rounded-xl p-6" style={{ borderColor: '#E5E1DA' }}>
            <div className="border-b pb-4 mb-4" style={{ borderColor: '#E5E1DA' }}>
              <h2 className="text-xl flex items-center gap-2 font-semibold">
                <Trophy size={20} className="opacity-80" /> Histórico de Ganhadoras
              </h2>
              <p className="text-xs text-slate-500 italic mt-1">Transparência e registros de sorteios já realizados</p>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {historico.length === 0 ? (
                <p className="text-sm italic text-slate-400 py-6 text-center">Nenhum evento registrado no histórico.</p>
              ) : (
                <ul className="space-y-3">
                  {historico.map((item, idx) => (
                    <li key={item.id ?? idx} className="border border-[#EDEBE6] bg-white rounded-lg p-3 relative overflow-hidden">
                      <p className="font-semibold text-base mb-1">{item.nome}</p>
                      <p className="text-sm text-slate-600 font-serif italic">Ganhou: <strong>{item.premio}</strong></p>
                      {item.dataSorteio && (
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-2">
                          Data: {normalizeDateValue(item.dataSorteio).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                        </p>
                      )}
                      {/* Ganhadora Tag */}
                      <span className="absolute top-3 right-3 text-[10px] uppercase font-bold tracking-widest bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Sorteado</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

        {/* COLUNA DIREITA: Controle de Sorteio e Prêmios */}
        <div className="space-y-8">
          
          {/* 4. Controle de Sorteio & 5. Resultado */}
          <section className="bg-white border shadow-sm rounded-xl p-6 relative overflow-hidden" style={{ borderColor: '#E5E1DA' }}>
            <div className="flex items-center gap-2 mb-2">
              <Settings size={18} className="text-slate-400" />
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Controle da Roda da Sorte</h2>
            </div>
            <h3 className="text-2xl font-light italic mb-6 text-center mt-2 border-b pb-4" style={{ borderColor: corDestaque + '30', color: corDestaque }}>
              {mesAtualRef}
            </h3>

            {/* Resultado do Sorteio */}
            <div className="bg-[#FAFAF5] border border-[#EDEBE6] rounded-xl min-h-48 flex flex-col items-center justify-center p-6 text-center shadow-inner mb-6 relative">
              {sorteando ? (
                <div className="space-y-3 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-[#B06543] animate-spin" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#B06543]">Selecionando ao acaso...</p>
                </div>
              ) : vencedoresAtuais.length > 0 ? (
                <div className="space-y-4 w-full animate-in fade-in zoom-in duration-500">
                  <PartyPopper size={32} className="mx-auto text-yellow-500 mb-2" />
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Ganhadoras Oficiais</p>
                  <div className="space-y-3">
                    {vencedoresAtuais.map((item, index) => (
                      <div
                        key={`${item.nome}-${index}`}
                        className={`rounded-2xl p-4 border ${index === vencedoresAtuais.length - 1 ? 'border-[#B06543] bg-[#FFF7EB]' : 'border-[#EDEBE6] bg-white'}`}
                      >
                        <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500 mb-2">Premiação #{index + 1}</p>
                        <p className="text-base font-semibold text-[#1F2937] truncate">
                          {item.premio} <span className="text-[#B06543]">→</span> {item.nome}
                        </p>
                        <p className="text-sm italic text-slate-600 mt-2">
                          {item.dataSorteio
                            ? normalizeDateValue(item.dataSorteio).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
                            : 'em andamento'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="opacity-50 space-y-2">
                  <PartyPopper size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-serif italic">Nenhum sorteio em andamento.</p>
                  <p className="text-[10px] uppercase tracking-widest font-bold">1 Participante ≡ 1 Prêmio</p>
                </div>
              )}
            </div>

            {/* Botões do Sorteio */}
            <div className="mb-4 grid gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <label className="text-xs uppercase tracking-[0.35em] text-slate-500 font-bold">
                    Quantas pessoas sortear?
                  </label>
                  <p className="text-[11px] text-slate-500 italic mt-1">
                    {premios.length > 0
                      ? `Máximo ${maxDrawCount} pessoas com prêmios únicos.`
                      : `Máximo ${maxDrawCount || 1} pessoa(s) com prêmios surpresa.`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSetUrnaStatus(!urnaAberta)}
                  className={`rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] transition ${urnaAberta ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700'}`}
                >
                  {urnaAberta ? 'Fechar Urna' : 'Abrir Urna'}
                </button>
              </div>
              <input
                type="number"
                min={1}
                max={Math.max(1, maxDrawCount)}
                value={drawCount}
                onChange={(e) => setDrawCount(Math.max(1, Math.min(Math.max(1, maxDrawCount), Number(e.target.value) || 1)))}
                className="w-full rounded-md border px-3 py-2 text-sm bg-slate-50 outline-none focus:ring-1 focus:ring-[#B06543]/30"
                disabled={participantes.length === 0}
              />
            </div>

            <div className="grid gap-3">
              <Button 
                onClick={handleRealizarSorteio}
                disabled={sorteando || participantes.length === 0}
                className="w-full text-[11px] font-bold uppercase tracking-widest py-8 rounded-xl hover:brightness-110 shadow-md transition-all active:scale-95"
                style={{ backgroundColor: corDestaque }}
              >
                {sorteando ? <Loader2 className="animate-spin" /> : <span>🎉 Realizar Sorteio Justo</span>}
              </Button>
              
              {vencedoresAtuais.length > 0 && (
                <Button 
                  onClick={handleResetarSorteio}
                  variant="outline"
                  className="w-full text-[10px] font-bold uppercase tracking-widest py-6 rounded-xl border-[#E5E1DA] bg-slate-50 text-slate-600"
                >
                  <RefreshCw size={14} className="mr-2" /> Sortear Próximo Prêmio (Nova Rodada)
                </Button>
              )}
            </div>
            
            <p className="mt-4 text-center text-[9px] uppercase tracking-wider text-slate-400 font-bold opacity-70">
              * Ganhadoras não repetem no mesmo banco <br/>e são persistidas online.
            </p>
          </section>

          {/* 3. Gestão de Prêmios */}
          <section className="bg-white border shadow-sm rounded-xl p-6" style={{ borderColor: '#E5E1DA' }}>
            <h2 className="text-xl flex items-center justify-between gap-2 font-semibold mb-6">
              <span className="flex items-center gap-2"><Gift size={20} className="text-[#B06543]" /> Prêmios da Urna</span>
              <span className="bg-[#FBF7F4] text-[#B06543] py-1 px-3 rounded-full text-xs font-bold border border-[#E5E1DA]">
                {premios.length} itens
              </span>
            </h2>

            <div className="flex gap-2 mb-6">
              <input
                value={premioText}
                onChange={(e) => setPremioText(e.target.value)}
                placeholder="Ex: Livro do mês..."
                className="flex-1 rounded-md border px-3 py-2 text-sm bg-slate-50 outline-none focus:border-[#B06543]"
                style={{ borderColor: '#E5E1DA' }}
              />
              <Button
                onClick={handleAddPremio}
                disabled={savingPremio}
                className="px-4 text-[10px] uppercase font-bold tracking-widest h-auto border-none"
                style={{ backgroundColor: '#B06543', color: '#FFF' }}
              >
                {savingPremio ? <Loader2 className="animate-spin h-4 w-4" /> : <Plus size={16} />}
              </Button>
            </div>

            {premios.length === 0 ? (
              <p className="text-xs text-slate-500 font-serif italic text-center p-4 border border-dashed rounded bg-slate-50">
                A urna do mês não tem prêmios cadastrados. Será usado "Surpresa especial do mês".
              </p>
            ) : (
              <ul className="space-y-2 max-h-48 overflow-y-auto">
                {premios.map(p => (
                  <li key={p.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-b-0" style={{ borderColor: '#E5E1E0' }}>
                    <span className="italic font-serif truncate pr-4 text-slate-800">{p.premio}</span>
                    <button 
                      onClick={() => handleRemovePremio(p.id)}
                      className="text-[#A41C1C] opacity-70 hover:opacity-100 hover:bg-red-50 p-1.5 rounded transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

        </div>
      </div>
    </main>
  );
}