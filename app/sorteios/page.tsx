"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Gift, Loader2, PartyPopper, Quote, Shuffle, Trash2, Trophy } from "lucide-react";
import { toast } from "sonner";
import { normalizeDateValue, getCurrentMonthReference } from '@/lib/utils';

type SorteioHistorico = {
  id?: string;
  nome: string;
  premio: string;
  dataSorteio?: string;
  fotoUrl?: string | null;
  foto_url?: string | null;
};

type Participante = {
  id?: string;
  nome: string;
};

const corDestaque = "#B06543";
const corFundo = "#FAFAF5";
const corTexto = "#4A443F";
const verdeMusgo = "#4F5E46";

export default function SorteiosPage() {
  const [mesBase, setMesBase] = useState(getCurrentMonthReference());
  const [nome, setNome] = useState("");
  const [premios, setPremios] = useState<string[]>([]);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [historico, setHistorico] = useState<SorteioHistorico[]>([]);
  const [urnaAberta, setUrnaAberta] = useState(true);
  const [sorteando, setSorteando] = useState(false);
  const [nomeAnimado, setNomeAnimado] = useState<string | null>(null);
  const [vencedora, setVencedora] = useState<string | null>(null);
  const [premioAtual, setPremioAtual] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [rodaStatus, setRodaStatus] = useState('ativa');
  const [isAdmin, setIsAdmin] = useState(false);
  const [sorteioFotoUrl, setSorteioFotoUrl] = useState('');

  const carregarDados = async () => {
    try {
      const res = await fetch("/api/sorteios");
      const data = await res.json();
      if (data.participantes) setParticipantes(data.participantes);
      if (data.historico) setHistorico(data.historico);
      if (data.urnaAberta !== undefined) setUrnaAberta(data.urnaAberta);
      if (data.roda?.status) setRodaStatus(data.roda.status);
      if (data.activeMesBase) setMesBase(data.activeMesBase);
      if (data.premios) {
        setPremios(data.premios.map((item: any) => item.premio));
      }
      if (data.sorteioFotoUrl) setSorteioFotoUrl(data.sorteioFotoUrl);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar dados dos sorteios.");
    } finally {
      setLoading(false);
    }
  };

  const carregarUsuario = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setIsAdmin(data.user?.role === 'admin');
      }
    } catch (err) {
      console.error('Erro ao carregar usuário:', err);
    }
  };

  useEffect(() => {
    carregarDados();
    carregarUsuario();
  }, []);

  const totalParticipantes = useMemo(() => participantes.length, [participantes]);

  async function adicionarParticipante(event: FormEvent) {
    event.preventDefault();
    const limpo = nome.trim().replace(/\s+/g, " ");

    if (!limpo) {
      toast.error("Digite um nome para participar.");
      return;
    }

    if (!urnaAberta) {
      toast.error("A urna está fechada e não recebe novos nomes no momento.");
      return;
    }

    if (rodaStatus !== 'ativa') {
      toast.error('Roda de Vozes está desativada. Não é possível cadastrar novos nomes.');
      return;
    }

    const existe = participantes.some(
      (p) => p.nome.toLocaleLowerCase("pt-BR") === limpo.toLocaleLowerCase("pt-BR"),
    );

    if (existe) {
      toast.error("Esse nome já encabeça na urna deste mês.");
      return;
    }

    try {
      const res = await fetch("/api/sorteios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addParticipante", payload: { nome: limpo, mesBase } }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Erro ao salvar participante na urna.');
      }

      setNome("");
      setParticipantes((prev) => [{ id: data.id, nome: limpo }, ...prev]);
      toast.success("Adicionada à urna com sucesso!");
      carregarDados();
    } catch (err: any) {
      toast.error(err?.message || "Erro ao salvar participante na urna.");
      await carregarDados();
    }
  }

  async function removerParticipante(id: string | undefined, nome: string) {
    setParticipantes((prev) => prev.filter((p) => p.id !== id || (id === undefined && p.nome !== nome)));

    if (vencedora === nome) {
      setVencedora(null);
      setPremioAtual(null);
    }

    try {
      await fetch("/api/sorteios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "removeParticipante", payload: id ? { id } : { nome } }),
      });
    } catch {
      toast.error("Erro ao retirar da urna.");
    }
  }

  function sortearIndice(total: number) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % total;
  }

  async function iniciarSorteio() {
    if (!isAdmin) {
      toast.error('Somente admin pode sortear.');
      return;
    }

    if (participantes.length === 0 || sorteando) {
      toast.error('A urna está vazia. Adicione participantes primeiro.');
      return;
    }

    setSorteando(true);
    setVencedora(null);
    setPremioAtual(null);

    const duracaoMs = 2400;
    const intervaloMs = 100;
    const fim = Date.now() + duracaoMs;
    const premiosDoMes = premios.length > 0 ? premios : ['Um presente especial'];

    const ticker = window.setInterval(async () => {
      const i = sortearIndice(participantes.length);
      setNomeAnimado(participantes[i].nome);

      if (Date.now() >= fim) {
        window.clearInterval(ticker);

        const indiceFinal = sortearIndice(participantes.length);
        const premioFinal = premiosDoMes[sortearIndice(premiosDoMes.length)];
        const vencedoraFinal = participantes[indiceFinal];

        setNomeAnimado(null);
        setVencedora(vencedoraFinal.nome);
        setPremioAtual(premioFinal);
        setSorteando(false);

        try {
          await fetch('/api/sorteios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'salvarHistorico',
              payload: { nome: vencedoraFinal.nome, premio: premioFinal, mesBase, id: vencedoraFinal.id },
            }),
          });
          toast.success(`Parabéns, ${vencedoraFinal.nome}! Uma nova página se inicia.`);
          carregarDados();
        } catch {
          toast.error('Erro ao registrar o sorteio.');
        }
      }
    }, intervaloMs);
  }

  function resetarResultado() {
    setVencedora(null);
    setPremioAtual(null);
    setNomeAnimado(null);
  }

  const premioPreview = premioAtual ?? (premios.length > 0 ? premios[0] : "Em breve novos presentes!");

  return (
    <div
      className="min-h-screen font-alice pb-28 pt-28 lg:pt-32 relative overflow-hidden"
      style={{
        background: `#F4EEE6 url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')`,
        color: corTexto,
      }}
    >
      <header className="max-w-5xl mx-auto px-6 md:px-12 pb-20 relative z-10 text-center border-b border-[#7e6d60]/10">
        <div className="flex items-center justify-center gap-4 mb-8 opacity-60">
          <div className="h-px w-12 bg-[#7e6d60]/30" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.6em]" style={{ color: corDestaque }}>
            Mimo Mensal
          </span>
          <div className="h-px w-12 bg-[#7e6d60]/30" />
        </div>

        <h1 className="text-4xl md:text-[64px] tracking-[-0.02em] leading-[0.92] mb-8">
          <span className="italic font-light" style={{ color: corTexto }}>
            Sorteios do
          </span>{' '}
          <span className="italic font-light" style={{ color: corDestaque }}>
            Clube
          </span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-[0.95fr_0.7fr] gap-8 text-left max-w-4xl mx-auto pt-8 border-t border-[#7e6d60]/15">
          <div className="relative pl-8">
            <Quote size={20} className="absolute left-0 top-0 opacity-30" style={{ color: corDestaque }} />
            <p className="italic text-sm md:text-base leading-relaxed opacity-85 text-[#4A443F]">
              Todo mês sorteamos um presente para quem compartilha essa travessia literária com a gente.
            </p>
          </div>
          <p className="text-[10px] uppercase tracking-[0.4em] font-semibold opacity-70 self-end" style={{ color: verdeMusgo }}>
            Nome na urna, sorteio transparente e novo ciclo a cada mês.
          </p>
        </div>
        {sorteioFotoUrl && (
          <div className="mx-auto mt-10 grid gap-6 max-w-5xl md:grid-cols-[minmax(16rem,22rem)_1fr] items-center">
            <a
              href={sorteioFotoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-[1.75rem] overflow-hidden border border-[#c8b7aa]/30 bg-[#f7f1e7] shadow-[0_18px_45px_rgba(0,0,0,0.08)] transition-transform hover:-translate-y-1"
              title="Clique para ver a imagem em tamanho real"
            >
              <img
                src={sorteioFotoUrl}
                alt="Foto do sorteio"
                className="w-full h-[18rem] object-cover"
                style={{ display: 'block' }}
              />
            </a>

            <div className="rounded-[1.75rem] border border-[#c8b7aa]/30 bg-white/95 p-8 shadow-[0_18px_45px_rgba(0,0,0,0.06)]">
              <span className="text-[10px] uppercase tracking-[0.35em] text-[#8c7b6e] mb-4 block">
                Prêmio em destaque
              </span>
              <h2 className="text-3xl font-serif italic leading-tight" style={{ color: corTexto }}>
                O que vai ser sorteado
              </h2>
              <p className="mt-4 text-sm leading-relaxed opacity-80 text-[#4A443F]">
                Essa imagem mostra o presente em destaque. Clique nela para ver em tamanho real.
              </p>
              <div className="mt-6 rounded-[1.25rem] bg-[#f8f3ea] border border-[#c8b7aa]/20 p-5">
                <p className="text-[10px] uppercase tracking-[0.35em] text-[#7e6d60] mb-2">
                  Sorteio
                </p>
                <p className="text-lg font-alice" style={{ color: corDestaque }}>
                  {premioAtual ?? premioPreview}
                </p>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-12 grid lg:grid-cols-12 gap-12 items-start relative z-10">
        <section className="lg:col-span-7 space-y-10">
          <div className="relative group">
            <div className="bg-white/95 border rounded-[1.5rem] p-8 md:p-10 shadow-[0_10px_25px_rgba(0,0,0,0.06)] relative z-10" style={{ borderColor: `${corDestaque}30` }}>
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.35em] mb-7" style={{ color: corDestaque }}>
                A Urna
              </h2>

              <form onSubmit={adicionarParticipante} className="flex flex-col sm:flex-row gap-4 mb-10">
                <input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder={urnaAberta ? "Nome completo..." : "Urna fechada para novos nomes"}
                  className="flex-1 rounded-[0.95rem] border px-5 py-3.5 bg-[#f5eee5] text-lg outline-none focus:ring-1 transition-all"
                  style={{ borderColor: `${corDestaque}20`, '--tw-ring-color': corDestaque } as any}
                  aria-label="Digite seu nome"
                  disabled={!urnaAberta}
                />
                <button
                  type="submit"
                  disabled={!urnaAberta}
                  className="rounded-[0.95rem] px-8 py-3.5 text-white font-semibold uppercase tracking-[0.28em] text-[10px] transition-all hover:bg-opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: corDestaque }}
                >
                  Depositar Nome
                </button>
              </form>

              {isAdmin && (
                <div className="mb-8">
                  <button
                    type="button"
                    onClick={iniciarSorteio}
                    disabled={sorteando || participantes.length === 0 || !!vencedora || loading}
                    className="w-full rounded-sm px-8 py-3.5 text-white font-bold uppercase tracking-widest text-[10px] transition-all hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#285944' }}
                  >
                    Sortear Agora como Admin
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-3 mb-6" style={{ borderColor: `${corDestaque}20` }}>
                <div>
                  <h3 className="text-[9px] font-bold uppercase tracking-[0.35em] opacity-80" style={{ color: corTexto }}>
                    Nomes Confirmados
                  </h3>
                  <p className="text-[10px] uppercase tracking-[0.35em] opacity-60 mt-1" style={{ color: corDestaque }}>
                    {urnaAberta ? 'Urna aberta para novos nomes' : 'Urna fechada: não recebe mais nomes'}
                  </p>
                </div>
                <span className="text-[13px] font-serif italic" style={{ color: corDestaque }}>
                  {loading ? "..." : totalParticipantes} {totalParticipantes === 1 ? "nome" : "nomes"}
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto pr-3">
                {loading ? (
                  <div className="flex justify-center flex-col items-center py-10 opacity-50">
                    <Loader2 size={24} className="animate-spin mb-3" />
                    <p className="text-sm italic">Abrindo a lista de participantes...</p>
                  </div>
                ) : participantes.length === 0 ? (
                  <p className="text-[15px] italic opacity-50 text-center py-10">A urna aguarda a primeira participante...</p>
                ) : (
                  <ul className="space-y-3">
                    {participantes.map((p, index) => (
                      <li
                        key={p.id ?? `${p.nome}-${index}`}
                        className="flex justify-between items-center py-3 pl-4 pr-3 border rounded-sm hover:-translate-y-[1px] transition-all bg-[#FAFAF5]/80"
                        style={{ borderColor: `${corDestaque}15` }}
                      >
                        <span className="font-alice text-[17px] truncate opacity-90">{p.nome}</span>
                        <button
                          type="button"
                          onClick={() => removerParticipante(p.id, p.nome)}
                          className="shrink-0 transition-colors p-2 hover:bg-black/5 rounded-sm opacity-50 hover:opacity-100"
                          title={`Remover ${p.nome}`}
                          aria-label={`Remover ${p.nome}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            
            <div
              className="absolute top-2 left-2 right-[-8px] bottom-[-8px] border rounded-sm -z-0 transition-transform group-hover:translate-x-1 group-hover:translate-y-1"
              style={{ borderColor: `${corDestaque}20`, backgroundColor: `${corDestaque}05` }}
            />
          </div>
        </section>

        <aside className="lg:col-span-5 space-y-10">
          <div className="relative group">
            <div className="bg-white/95 border rounded-[1.5rem] p-8 md:p-10 shadow-[0_10px_25px_rgba(0,0,0,0.06)] flex flex-col justify-center items-center text-center relative z-10" style={{ borderColor: `${corDestaque}30` }}>
              <div className="rounded-[1.2rem] border p-6 w-full min-h-40 flex flex-col items-center justify-center text-center relative" style={{ borderColor: `${corDestaque}15`, backgroundColor: '#f7f1e7' }}>
                <p className="text-[14px] italic opacity-75 font-serif leading-relaxed">
                  O momento aguarda revelação.
                </p>
              </div>
            </div>

            <div
              className="absolute top-2 left-2 right-[-8px] bottom-[-8px] border rounded-sm -z-0 transition-transform group-hover:translate-x-1 group-hover:translate-y-1"
              style={{ borderColor: `${corDestaque}20`, backgroundColor: `${corDestaque}05` }}
            />
          </div>

          <div className="relative group">
            <div className="bg-white/95 border rounded-[1.5rem] p-8 md:p-10 shadow-[0_10px_25px_rgba(0,0,0,0.06)] relative z-10" style={{ borderColor: `${corDestaque}30` }}>
              {premios.length > 0 && (
                <div className="mb-7 text-left">
                      <h2 className="text-[10px] font-semibold uppercase tracking-[0.35em] mb-4" style={{ color: corDestaque }}>
                        Prêmios do Mês
                      </h2>
                      <ul className="space-y-3 text-sm opacity-85">
                        {premios.map((premio, index) => (
                          <li key={`${premio}-${index}`} className="flex items-start gap-3">
                            <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-[#c8b7aa]" />
                            <span>{premio}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-4 text-xs opacity-60">Destaque atual: {premioPreview}</p>
                    </div>
                  )}

              <div className="mb-6 border-b pb-4" style={{ borderColor: `${corDestaque}20` }}>
                <h2 className="text-[10px] font-bold uppercase tracking-[0.35em]" style={{ color: corDestaque }}>
                  Últimas Ganhadoras
                </h2>
              </div>

              {loading ? (
                <p className="text-[13px] italic opacity-50 text-center py-4 font-serif">Puxando dos registros...</p>
              ) : historico.length === 0 ? (
                <p className="text-[13px] font-serif italic opacity-60 py-2">Sem memórias recentes por aqui.</p>
              ) : (
                <ul className="space-y-4 max-h-52 overflow-y-auto pr-3">
                  {historico.map((item, idx) => (
                    <li key={`${item.id}-${idx}`} className="flex flex-col gap-1.5 pb-4 border-b last:border-b-0" style={{ borderColor: `${corDestaque}15` }}>
                      <p className="font-alice text-[18px] opacity-90 truncate flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-3 min-w-0">
                          {(item.fotoUrl || item.foto_url) ? (
                            <img
                              src={item.fotoUrl || item.foto_url || ''}
                              alt={`Foto do sorteio de ${item.nome}`}
                              className="h-8 w-8 rounded-full object-cover border border-[#c8b7aa]/30"
                            />
                          ) : (
                            <span className="inline-block h-8 w-8 rounded-full bg-[#e6d8c8] border border-[#c8b7aa]/30" />
                          )}
                          <span className="truncate">{item.nome}</span>
                        </span>
                        <Trophy size={14} style={{ color: corDestaque }} className="opacity-70" />
                      </p>
                      <div className="flex justify-between items-baseline">
                        <span className="font-serif italic text-[14px] opacity-75">{item.premio}</span>
                        <span className="opacity-50 text-[9px] uppercase tracking-wider font-bold">
                          {item.dataSorteio
                            ? normalizeDateValue(item.dataSorteio).toLocaleDateString("pt-BR", {
                                month: "short",
                                year: "numeric",
                              })
                            : ""}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div
              className="absolute top-2 left-2 right-[-8px] bottom-[-8px] border rounded-sm -z-0 transition-transform group-hover:translate-x-1 group-hover:translate-y-1"
              style={{ borderColor: `${corDestaque}20`, backgroundColor: `${corDestaque}05` }}
            />
          </div>
        </aside>
      </main>
    </div>
  );
}
