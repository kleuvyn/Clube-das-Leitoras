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

type Premio = {
  id?: string;
  premio: string;
  fotoUrl?: string | null;
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
  const [premios, setPremios] = useState<Premio[]>([]);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [historico, setHistorico] = useState<SorteioHistorico[]>([]);
  const [urnaAberta, setUrnaAberta] = useState(true);
  const [sorteando, setSorteando] = useState(false);
  const [nomeAnimado, setNomeAnimado] = useState<string | null>(null);
  const [vencedora, setVencedora] = useState<string | null>(null);
  const [premioAtual, setPremioAtual] = useState<string | null>(null);
  const [premioAtualFotoUrl, setPremioAtualFotoUrl] = useState<string | null>(null);
  const [sorteioFotoUrl, setSorteioFotoUrl] = useState('');
  const [sorteioZoomAberto, setSorteioZoomAberto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rodaStatus, setRodaStatus] = useState('ativa');

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
        setPremios(data.premios.map((item: any) => ({
          id: item.id,
          premio: item.premio,
          fotoUrl: item.fotoUrl ?? item.foto_url ?? null,
        })));
      }
      if (data.sorteioFotoUrl ?? data.sorteio_foto_url) {
        setSorteioFotoUrl(data.sorteioFotoUrl ?? data.sorteio_foto_url ?? '');
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar dados dos sorteios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
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
    const premiosDoMes = premios.length > 0 ? premios : [{ premio: 'Um presente especial', fotoUrl: null }];

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
        setPremioAtual(premioFinal.premio);
        setPremioAtualFotoUrl(premioFinal.fotoUrl || null);
        setSorteando(false);

        try {
          await fetch('/api/sorteios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'salvarHistorico',
              payload: { nome: vencedoraFinal.nome, premio: premioFinal.premio, fotoUrl: premioFinal.fotoUrl, mesBase, id: vencedoraFinal.id },
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
    setPremioAtualFotoUrl(null);
    setNomeAnimado(null);
  }

  const premioPreview = premioAtual ?? (premios.length > 0 ? premios[0].premio : "Em breve novos presentes!");
  const premioPreviewFotoUrl = premioAtualFotoUrl ?? (premios.length > 0 ? premios[0].fotoUrl : null);

  return (
    <div
      className="min-h-screen font-alice pb-28 pt-28 lg:pt-32 relative overflow-hidden overflow-x-hidden"
      style={{
        background: `#FDFCFB url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')`,
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

        <h1 className="text-7xl md:text-[100px] tracking-tighter leading-[0.8] mb-10 drop-shadow-sm">
          <span className="text-[#2C3E50]">Sorteios do</span><br className="md:hidden" />
          <span className="italic font-light text-[#B04D4A]"> Clube</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-[0.95fr_0.7fr] gap-8 text-left max-w-4xl mx-auto pt-8 border-t border-[#7e6d60]/15">
          <div className="relative pl-8 min-w-0">
            <Quote size={20} className="absolute left-0 top-0 opacity-30" style={{ color: corDestaque }} />
            <p className="italic text-sm md:text-base leading-relaxed opacity-85 text-[#4A443F] break-words">
              Todo mês sorteamos um presente para quem compartilha essa travessia literária com a gente.
            </p>
          </div>
          <p className="text-[10px] uppercase tracking-[0.4em] font-semibold opacity-70 self-end break-words" style={{ color: verdeMusgo }}>
            Nome na urna, sorteio transparente e novo ciclo a cada mês.
          </p>
        </div>
        <>
          <div className="mx-auto mt-10">
            <div className="grid gap-6 min-w-0 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto justify-center items-start">
              {premios.length === 0 ? (
                <div className="col-span-full bg-white p-4 pb-12 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-[#e5d6c5]/50 max-w-[20rem] mx-auto w-full transition-transform hover:-translate-y-2 hover:-rotate-1 duration-500 rounded-[2px] relative before:absolute before:inset-0 before:-z-10 before:shadow-[0_20px_40px_rgba(0,0,0,0.1)] before:rotate-[1deg] before:opacity-0 hover:before:opacity-100 before:transition-opacity">
                  <div className="relative w-[calc(100%-1.5rem)] overflow-hidden border border-[#e5d6c5] bg-[#f7f1e7] rounded-sm mx-auto" style={{ aspectRatio: '1 / 1' }}>
                    {premioPreviewFotoUrl ? (
                      <img src={premioPreviewFotoUrl} alt={premioAtual ?? premioPreview} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500 font-serif italic">
                        Foto em breve
                      </div>
                    )}
                  </div>
                  <div className="mt-8 text-center px-4 font-serif">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-[#8c7b6e] mb-3 opacity-80">
                      Mimo do mês
                    </p>
                    <h2 className="text-lg italic leading-tight text-[#4A443F]">
                      {premioAtual ?? premioPreview}
                    </h2>
                    <p className="mt-3 text-[12px] leading-relaxed opacity-70 text-[#4A443F] max-w-[85%] mx-auto">
                      Em breve os prêmios disponíveis serão revelados aqui.
                    </p>
                  </div>
                </div>
              ) : (
                premios.map((premio, index) => (
                  <div key={`${premio.id ?? premio.premio}-${index}`} className="bg-white p-4 pb-12 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-[#e5d6c5]/50 max-w-[20rem] mx-auto w-full transition-transform hover:-translate-y-2 hover:rotate-1 duration-500 rounded-[2px] relative before:absolute before:inset-0 before:-z-10 before:shadow-[0_20px_40px_rgba(0,0,0,0.1)] before:rotate-[-1deg] before:opacity-0 hover:before:opacity-100 before:transition-opacity">
                    <div className="relative w-[calc(100%-1rem)] mx-auto overflow-hidden border border-[#d4c0af]/30 bg-[#fbf7f1] rounded-[2px]" style={{ aspectRatio: '1 / 1' }}>
                      {premio.fotoUrl ? (
                        <img src={premio.fotoUrl} alt={premio.premio} className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500 font-serif italic">
                          Em breve
                        </div>
                      )}
                    </div>
                    <div className="mt-8 text-center px-4 font-serif">
                      <p className="text-[9px] uppercase tracking-[0.4em] text-[#A69B91] mb-2 opacity-80">
                        Mimo do mês
                      </p>
                      <h2 className="text-[17px] italic leading-tight text-[#4A443F]">
                        {premio.premio}
                      </h2>
                      <p className="mt-2.5 text-[12px] leading-relaxed opacity-75 text-[#4A443F] max-w-[90%] mx-auto">
                        Um presente especial e pensado com carinho para quem compartilha essa leitura.
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-12 grid lg:grid-cols-12 gap-12 items-start relative z-10 min-w-0">
        <section className="lg:col-span-7 space-y-10 min-w-0">
          <div className="relative group">
            <div className="bg-white/95 border rounded-[1.5rem] p-8 md:p-10 shadow-[0_10px_25px_rgba(0,0,0,0.06)] relative z-10" style={{ borderColor: `${corDestaque}30` }}>
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.35em] mb-6" style={{ color: corDestaque }}>
                A Urna
              </h2>

              <ul className="mb-8 space-y-2.5 text-[0.9rem] opacity-85 leading-relaxed max-w-full break-words" style={{ color: corTexto }}>
                <li className="flex items-start gap-2.5 min-w-0">
                  <span className="h-1 w-1 min-w-1 rounded-full mt-2" style={{ backgroundColor: corDestaque }}></span>
                  <span className="min-w-0 break-words whitespace-normal">
                    Coloque <strong className="text-[16px] font-bold italic uppercase tracking-[0.35em]" style={{ color: corDestaque }}>NOME E SOBRENOME</strong> na urna de participação.
                  </span>
                </li>
                <li className="flex items-start gap-2.5 min-w-0">
                  <span className="h-1 w-1 min-w-1 rounded-full mt-2" style={{ backgroundColor: corDestaque }}></span>
                  <span className="min-w-0 break-words whitespace-normal">Será permitido apenas um nome por cadastro.</span>
                </li>
              </ul>

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
                        className="flex justify-between items-center min-w-0 py-3 pl-4 pr-3 border rounded-sm hover:-translate-y-[1px] transition-all bg-[#FAFAF5]/80"
                        style={{ borderColor: `${corDestaque}15` }}
                      >
                        <span className="font-alice text-[17px] truncate opacity-90 min-w-0">{p.nome}</span>
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
              className="absolute top-2 left-2 right-0 bottom-0 md:right-[-8px] md:bottom-[-8px] border rounded-sm -z-0 transition-transform group-hover:translate-x-1 group-hover:translate-y-1"
              style={{ borderColor: `${corDestaque}20`, backgroundColor: `${corDestaque}05` }}
            />
          </div>
        </section>

        <aside className="lg:col-span-5 space-y-10 min-w-0">
          <div className="relative group">
            <div className="bg-white/95 border rounded-[1.5rem] p-8 md:p-10 shadow-[0_10px_25px_rgba(0,0,0,0.06)] flex flex-col justify-center items-center text-center relative z-10" style={{ borderColor: `${corDestaque}30` }}>
              <div className="rounded-[1.2rem] border p-6 w-full min-h-40 flex flex-col items-center justify-center text-center relative" style={{ borderColor: `${corDestaque}15`, backgroundColor: '#f7f1e7' }}>
                <p className="text-[14px] italic opacity-75 font-serif leading-relaxed">
                  O momento aguarda revelação.
                </p>
              </div>
            </div>

            <div
              className="absolute top-2 left-2 right-0 bottom-0 md:right-[-8px] md:bottom-[-8px] border rounded-sm -z-0 transition-transform group-hover:translate-x-1 group-hover:translate-y-1"
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
                      <li key={`${premio.id ?? premio.premio}-${index}`} className="flex items-center gap-3">
                        {premio.fotoUrl ? (
                          <img
                            src={premio.fotoUrl}
                            alt={premio.premio}
                            className="h-10 w-10 rounded-xl object-cover border border-[#E5E1DA]"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-xl bg-[#F3ECE4] border border-[#E5E1DA] flex items-center justify-center text-[10px] uppercase tracking-[0.2em] text-slate-500">
                            Foto
                          </div>
                        )}
                        <span className="truncate">{premio.premio}</span>
                      </li>
                    ))}
                  </ul>
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
                      <p className="font-alice text-[18px] opacity-90 truncate flex items-center justify-between gap-3 min-w-0">
                        <span className="inline-flex items-center gap-3 min-w-0">
                          <span className="inline-block h-4 w-4 rounded-full bg-[#B06543]" />
                          <span className="truncate">{item.nome}</span>
                        </span>
                        <Trophy size={14} style={{ color: corDestaque }} className="opacity-70" />
                      </p>
                      <div className="flex justify-between items-baseline min-w-0 gap-3">
                        <span className="font-serif italic text-[14px] opacity-75 truncate min-w-0">{item.premio}</span>
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
              className="absolute top-2 left-2 right-0 bottom-0 md:right-[-8px] md:bottom-[-8px] border rounded-sm -z-0 transition-transform group-hover:translate-x-1 group-hover:translate-y-1"
              style={{ borderColor: `${corDestaque}20`, backgroundColor: `${corDestaque}05` }}
            />
          </div>
        </aside>
      </main>
    </div>
  );
}
