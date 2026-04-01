"use client";

import React, { useEffect, useState } from "react";
import {
  Instagram,
  ShoppingBag,
  Star,
  Feather,
  X,
  ArrowRight,
  CheckCircle2,
  Coffee,
  Sparkles,
  Heart,
} from "lucide-react";

// Paleta de Cores e Estilos (Consistente com DNA Club)
const lavandaPrincipal = "#967BB6";
const azulPetroleo = "#2C3E50";
const papelCor = "#FDFCFB";
const bgStyle = {
  backgroundColor: papelCor,
  backgroundImage: `url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')`,
};

const CATEGORIAS = [
  "Bordado",
  "Tecido",
  "Crochê",
  "Macramê",
  "Saúde",
  "Bem-Estar",
  "Literatura",
  "Escrita",
  "Arte",
  "Papelaria",
  "Presentes",
  "Beleza",
  "Estilo",
  "Serviços Profissionais",
  "Gestão",
  "Fotografia",
  "Arquitetura",
  "Design",
  "Gastronomia",
  "Viagens",
  "Pets",
  "Outros",
];

interface Empreendedora {
  id: number;
  nome: string;
  negocio: string;
  categoria: string;
  instagram?: string;
  frase: string;
  fotoUrl?: string;
}

export default function VitrineEmpreendedoras() {
  const [empreendedoras, setEmpreendedoras] = useState<Empreendedora[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriaSelecionada, setCategoriaSelecionada] =
    useState<string>("Todas");
  const [showFiltro, setShowFiltro] = useState(false);

  // Estados do Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [solNegocio, setSolNegocio] = useState("");
  const [solEmpreendedora, setSolEmpreendedora] = useState("");
  const [solEmail, setSolEmail] = useState("");
  const [solTelefone, setSolTelefone] = useState("");
  const [solInstagram, setSolInstagram] = useState("");
  const [solCategoria, setSolCategoria] = useState("");
  const [solFrase, setSolFrase] = useState("");
  const [solMensagem, setSolMensagem] = useState("");
  const [solEnviando, setSolEnviando] = useState(false);
  const [solEnviado, setSolEnviado] = useState(false);

  useEffect(() => {
    async function carregarVitrine() {
      try {
        const res = await fetch("/api/empreendedoras");
        const data = await res.json();
        setEmpreendedoras(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erro ao carregar vitrine:", err);
      } finally {
        setLoading(false);
      }
    }
    carregarVitrine();
  }, []);

  const filtradas = empreendedoras.filter(
    (item) =>
      categoriaSelecionada === "Todas" ||
      item.categoria === categoriaSelecionada,
  );

  const enviarSolicitacao = async () => {
    const empreendedoraVal = solEmpreendedora.trim();
    const negocioVal = solNegocio.trim();
    const emailVal = solEmail.trim();
    const telefoneVal = solTelefone.trim();
    const instagramVal = solInstagram.trim();
    const categoriaVal = solCategoria.trim();
    const fraseVal = solFrase.trim();
    const detalhesVal = solMensagem.trim();

    if (
      !empreendedoraVal ||
      !negocioVal ||
      !emailVal ||
      !telefoneVal ||
      !instagramVal ||
      !categoriaVal ||
      !fraseVal ||
      !detalhesVal
    ) {
      alert(
        "Por favor preencha todos os campos: Empreendedora, Nome do Negócio, E-mail, Telefone, Instagram, Categoria, A Essência e O que você cria.",
      );
      return;
    }

    setSolEnviando(true);
    try {
      const res = await fetch("/api/solicitacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "empreendedora",
          nome: negocioVal,
          email: emailVal,
          telefone: telefoneVal,
          responsavel: empreendedoraVal,
          instagram: instagramVal,
          categoria: categoriaVal,
          frase: fraseVal,
          mensagem: detalhesVal,
        }),
      });
      if (!res.ok) throw new Error("Falha ao enviar");
      setSolEnviado(true);
      setSolNegocio("");
      setSolEmpreendedora("");
      setSolEmail("");
      setSolInstagram("");
      setSolMensagem("");
      setSolCategoria("");
      setSolFrase("");
      setTimeout(() => {
        setSolEnviado(false);
        setModalOpen(false);
      }, 3500);
    } catch (err) {
      alert("Erro ao enviar solicitação.");
    } finally {
      setSolEnviando(false);
    }
  };

  return (
    <div
      className="min-h-screen font-serif pb-40 relative overflow-hidden selection:bg-[#967BB6]/20"
      style={bgStyle}
    >
      {/* HEADER EDITORIAL */}
      <header className="max-w-5xl mx-auto pt-32 pb-24 px-6 text-center border-b border-black/5">
        <div className="flex items-center justify-center gap-4 mb-8 opacity-40">
          <div className="h-[1px] w-10 bg-black" />
          <span className="text-[10px] font-bold uppercase tracking-[0.6em] italic">
            Brasília • Vitrine de Afeto
          </span>
          <div className="h-[1px] w-10 bg-black" />
        </div>
        <h1 className="text-7xl md:text-[100px] text-[#2C3E50] tracking-tighter leading-[0.8] mb-10">
          Vitrine{" "}
          <span
            style={{ color: lavandaPrincipal }}
            className="italic font-light"
          >
            Criativa
          </span>
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-3xl mx-auto border-t border-black/10 pt-10">
          <p className="text-base leading-relaxed opacity-60 text-black italic">
            "Um espaço dedicado ao talento que floresce nas mãos das nossas
            leitoras. Aqui, o empreendedorismo é feito de afeto e histórias."
          </p>
          <div className="flex flex-col justify-end items-start md:items-end">
            <div
              className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-sans font-bold"
              style={{ color: lavandaPrincipal }}
            >
              <ShoppingBag size={14} /> Apoie as Mãos Locais
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-16">
        {/* FILTRO REFINADO */}
        <div className="mb-20">
          <div className="flex items-center justify-between border-b border-black/5 pb-4">
            <button
              onClick={() => setShowFiltro(!showFiltro)}
              className="group flex items-center gap-4 text-[11px] uppercase tracking-[0.4em] text-black transition-all duration-500"
            >
              <div className="relative flex items-center justify-center">
                <Feather
                  size={16}
                  className={`transition-all duration-700 ${showFiltro ? "rotate-90 opacity-0" : "rotate-0 opacity-100"}`}
                  style={{ color: lavandaPrincipal }}
                />
                <X
                  size={16}
                  className={`absolute transition-all duration-700 ${showFiltro ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"}`}
                />
              </div>
              <span>
                {showFiltro
                  ? "Recolher Índice"
                  : `Explorar: ${categoriaSelecionada}`}
              </span>
            </button>
            {categoriaSelecionada !== "Todas" && (
              <button
                onClick={() => setCategoriaSelecionada("Todas")}
                className="text-[9px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity border-b border-black/20"
              >
                Limpar Filtro
              </button>
            )}
          </div>

          <div
            className={`grid transition-all duration-700 ease-in-out ${showFiltro ? "grid-rows-[1fr] opacity-100 mt-12" : "grid-rows-[0fr] opacity-0 mt-0"} overflow-hidden`}
          >
            <div className="min-h-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-8 pb-16">
                <button
                  onClick={() => {
                    setCategoriaSelecionada("Todas");
                    setShowFiltro(false);
                  }}
                  className="group flex flex-col items-start gap-2 transition-all"
                >
                  <span
                    className={`text-[10px] uppercase tracking-[0.2em] ${categoriaSelecionada === "Todas" ? "text-black font-bold" : "text-black/30 group-hover:text-black"}`}
                  >
                    Todas
                  </span>
                  <div
                    className={`h-[1px] bg-[#967BB6] transition-all duration-500 ${categoriaSelecionada === "Todas" ? "w-full" : "w-0 group-hover:w-8"}`}
                  />
                </button>
                {CATEGORIAS.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategoriaSelecionada(cat);
                      setShowFiltro(false);
                    }}
                    className="group flex flex-col items-start gap-2 transition-all"
                  >
                    <span
                      className={`text-left text-[10px] uppercase tracking-[0.2em] ${categoriaSelecionada === cat ? "text-black font-bold" : "text-black/30 group-hover:text-black"}`}
                    >
                      {cat}
                    </span>
                    <div
                      className={`h-[1px] bg-[#967BB6] transition-all duration-500 ${categoriaSelecionada === cat ? "w-full" : "w-0 group-hover:w-8"}`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* GRID DE EMPREENDEDORAS */}
        {loading ? (
          <div className="text-center py-40 italic opacity-40 animate-pulse tracking-widest text-xs uppercase">
            Sintonizando afetos...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-12 gap-y-24 mb-48">
            {filtradas.map((item, idx) => (
              <div
                key={item.id || idx}
                className="group space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700"
              >
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 border border-black/5 rounded-full rotate-6 group-hover:rotate-12 transition-all duration-700" />
                  <div className="absolute inset-0 rounded-full overflow-hidden flex items-center justify-center bg-white border border-black/5 shadow-sm">
                    {item.fotoUrl ? (
                      <img
                        src={item.fotoUrl}
                        alt={item.negocio}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                    ) : (
                      <span
                        className="text-xl italic opacity-40"
                        style={{ color: lavandaPrincipal }}
                      >
                        {item.negocio?.charAt(0)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <span
                    className="text-[9px] font-bold uppercase tracking-[0.3em]"
                    style={{ color: lavandaPrincipal }}
                  >
                    {item.categoria}
                  </span>
                  <h3 className="text-3xl text-[#2C3E50] tracking-tighter leading-none group-hover:italic transition-all duration-500">
                    {item.negocio}
                  </h3>
                  <p className="text-[10px] uppercase tracking-widest opacity-40 italic">
                    por {item.nome}
                  </p>
                </div>
                <div className="relative pl-6 border-l border-black/5">
                  <p className="text-sm italic leading-relaxed opacity-60 text-black break-words overflow-hidden line-clamp-3">
                    "{item.frase}"
                  </p>
                </div>
                {item.instagram && (
                  <a
                    href={`https://instagram.com/${item.instagram.replace("@", "")}`}
                    target="_blank"
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#2C3E50] hover:text-[#967BB6] transition-colors pt-2"
                  >
                    <Instagram
                      size={14}
                      style={{ color: lavandaPrincipal }}
                      strokeWidth={2.5}
                    />{" "}
                    {item.instagram}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CTA FINAL */}
        <section className="bg-white border border-black/5 p-12 md:p-24 text-center shadow-sm rounded-[3rem] relative overflow-hidden">
          <div className="max-w-xl mx-auto space-y-8 relative z-10">
            <Star
              className="mx-auto opacity-20"
              size={32}
              style={{ color: lavandaPrincipal }}
            />
            <h2 className="text-5xl text-[#2C3E50] tracking-tight leading-tight">
              Sua criatividade também <br />
              <span
                className="italic font-light"
                style={{ color: lavandaPrincipal }}
              >
                tem lugar aqui.
              </span>
            </h2>
            <p className="text-sm italic opacity-60 text-black leading-relaxed">
              Faz parte do clube e quer sua marca na vitrine? <br /> Venha tomar
              um café conosco e compartilhar sua história.
            </p>
            <div className="pt-6">
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-4 text-white px-14 py-5 rounded-2xl font-bold uppercase text-[10px] tracking-[0.3em] shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                style={{ backgroundColor: lavandaPrincipal }}
              >
                Tomar um café <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* MODAL REFINADO DNA CLUB */}
      {modalOpen && (
        <div className="fixed inset-0 z-[999999] flex items-start md:items-center justify-center p-2 pt-20 overflow-y-auto">
          <div
            className="absolute inset-0 bg-[#2C3E50]/40 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative w-full max-w-3xl bg-[#FDFCFB] rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh]">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-6 top-6 p-2 hover:bg-black/5 rounded-full transition-colors z-20"
            >
              <X size={20} className="opacity-30" />
            </button>
            <div className="grid md:grid-cols-5 h-full max-h-[85vh]">
              <div className="hidden md:flex md:col-span-2 bg-[#967BB6]/5 p-12 flex-col justify-between border-r border-black/5">
                <div className="space-y-8">
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm rotate-3">
                    <Heart size={28} style={{ color: lavandaPrincipal }} />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-4xl font-serif italic leading-tight text-[#2C3E50]">
                      Nova <br />
                      Empreendedora
                    </h3>
                    <div className="h-[1px] w-12 bg-[#967BB6]/30" />
                    <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-[0.2em] font-bold">
                      Buscamos a alma do seu negócio. Conte-nos sua história
                      criativa.
                    </p>
                  </div>
                </div>
                <div className="text-[9px] uppercase tracking-[0.4em] opacity-30 italic font-bold text-[#2C3E50]">
                  DNA Club • Curadoria 2026
                </div>
              </div>
              <div className="md:col-span-3 p-6 md:p-14 overflow-hidden max-h-[85vh]">
                <div className="flex flex-col h-full min-h-[70vh]">
                  {solEnviado ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20">
                      <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                        <CheckCircle2
                          size={32}
                          className="text-green-600 animate-bounce"
                        />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-3xl font-serif italic text-[#2C3E50]">
                          Pedido Recebido!
                        </h4>
                        <p className="text-sm text-slate-500 max-w-xs mx-auto">
                          Em breve, sua marca poderá florescer em nosso acervo.
                          Logo daremos retorno.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8 overflow-y-auto">
                      <header className="space-y-2">
                        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#967BB6]">
                          Formulário de Candidatura
                        </span>
                        <h2 className="text-2xl text-[#2C3E50] font-medium tracking-tight">
                          Sua Marca na Vitrine
                        </h2>
                      </header>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="group space-y-1">
                          <label className="text-[9px] uppercase tracking-widest font-bold opacity-40 group-focus-within:text-[#967BB6] transition-colors">
                            Empreendedora
                          </label>
                          <input
                            type="text"
                            value={solEmpreendedora}
                            onChange={(e) =>
                              setSolEmpreendedora(e.target.value)
                            }
                            className="w-full bg-transparent border-b border-black/10 py-2 focus:border-[#967BB6] outline-none transition-colors text-sm"
                          />
                        </div>
                        <div className="group space-y-1">
                          <label className="text-[9px] uppercase tracking-widest font-bold opacity-40 group-focus-within:text-[#967BB6] transition-colors">
                            Nome do Negócio
                          </label>
                          <input
                            type="text"
                            value={solNegocio}
                            onChange={(e) => setSolNegocio(e.target.value)}
                            className="w-full bg-transparent border-b border-black/10 py-2 focus:border-[#967BB6] outline-none transition-colors text-sm"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="group space-y-1">
                          <label className="text-[9px] uppercase tracking-widest font-bold opacity-40 group-focus-within:text-[#967BB6] transition-colors">
                            E-mail
                          </label>
                          <input
                            type="email"
                            value={solEmail}
                            onChange={(e) => setSolEmail(e.target.value)}
                            placeholder="nome@exemplo.com"
                            className="w-full bg-transparent border-b border-black/10 py-2 focus:border-[#967BB6] outline-none transition-colors text-sm"
                          />
                        </div>
                        <div className="group space-y-1">
                          <label className="text-[9px] uppercase tracking-widest font-bold opacity-40 group-focus-within:text-[#967BB6] transition-colors">
                            WhatsApp/Telefone
                          </label>
                          <input
                            type="text"
                            value={solTelefone}
                            onChange={(e) => setSolTelefone(e.target.value)}
                            placeholder="(61) 9xxxx-xxxx"
                            className="w-full bg-transparent border-b border-black/10 py-2 focus:border-[#967BB6] outline-none transition-colors text-sm"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="group space-y-1">
                          <label className="text-[9px] uppercase tracking-widest font-bold opacity-40 group-focus-within:text-[#967BB6] transition-colors">
                            Instagram (@)
                          </label>
                          <input
                            type="text"
                            value={solInstagram}
                            onChange={(e) => setSolInstagram(e.target.value)}
                            placeholder="@seuperfil"
                            className="w-full bg-transparent border-b border-black/10 py-2 focus:border-[#967BB6] outline-none transition-colors text-sm"
                          />
                        </div>
                        <div className="flex items-end">
                          <span className="text-xs text-slate-500 italic">
                            Opcional, mas importante para nossa vitrine.
                          </span>
                        </div>
                      </div>
                      <div className="group space-y-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold opacity-40 group-focus-within:text-[#967BB6] transition-colors">
                          Categoria
                        </label>
                        <select
                          value={solCategoria}
                          onChange={(e) => setSolCategoria(e.target.value)}
                          className="w-full bg-transparent border-b border-black/10 py-2 focus:border-[#967BB6] outline-none text-sm italic"
                        >
                          <option value="">Selecione...</option>
                          {CATEGORIAS.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1 pt-2">
                        <label className="text-[9px] uppercase tracking-widest font-bold opacity-40">
                          A Essência (Frase de impacto)
                        </label>
                        <textarea
                          value={solFrase}
                          onChange={(e) => setSolFrase(e.target.value)}
                          placeholder="Uma frase que define seu trabalho..."
                          maxLength={180}
                          className="w-full bg-transparent border border-black/10 rounded-xl p-3 focus:border-[#967BB6] outline-none transition-colors text-sm italic placeholder:opacity-20 min-h-[70px] max-h-[130px] resize-none"
                        />
                        <p className="text-[10px] text-slate-400">
                          Máx 180 caracteres
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest font-bold opacity-40">
                          O que você cria? (Detalhes)
                        </label>
                        <textarea
                          value={solMensagem}
                          onChange={(e) => setSolMensagem(e.target.value)}
                          className="w-full bg-black/[0.03] rounded-2xl p-4 text-sm focus:ring-1 focus:ring-[#967BB6] outline-none transition-all min-h-[100px]"
                        />
                      </div>
                    </div>
                  )}
                  <div className="sticky bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl py-4 pt-2 border-t border-black/10">
                    <button
                      onClick={enviarSolicitacao}
                      disabled={solEnviando}
                      className="w-full bg-[#967BB6] text-white py-4 rounded-2xl font-bold uppercase text-[10px] tracking-[0.4em] shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50"
                    >
                      {solEnviando
                        ? "Submetendo Proposta..."
                        : "Enviar para Curadoria"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
