"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, BookOpen, Heart, Loader2, Minus, Plus, ShoppingBag, Trash2, Users, X } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

const WHATSAPP_NUMBER = "556181038803";
const FREE_SHIPPING_MINIMUM = 199;

type ShippingService = "PAC" | "SEDEX" | "RETIRADA";
type PaymentMethod = "PIX" | "CARTAO" | "BOLETO" | "NA_ENTREGA";
type Category = "livros" | "marcadores" | "ecobags" | "canecas";
type Filter = Category | "todos";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: Category;
  badge?: string;
};

type CartItem = {
  product: Product;
  quantity: number;
};

type ShippingQuote = {
  cep: string;
  uf: string;
  city: string;
  provider: string;
  service: string;
  etaDays: string;
  price: number;
};

const SHIPPING_SERVICES: { id: ShippingService; label: string; description: string }[] = [
  { id: "PAC", label: "PAC", description: "mais econômico" },
  { id: "SEDEX", label: "SEDEX", description: "mais rápido" },
  { id: "RETIRADA", label: "Retirada na roda", description: "sem frete, em Brasília" },
];

const PAYMENT_METHODS: { id: PaymentMethod; label: string; description: string }[] = [
  { id: "PIX", label: "Pix", description: "pagamento instantâneo" },
  { id: "CARTAO", label: "Cartão", description: "crédito ou débito" },
  { id: "BOLETO", label: "Boleto", description: "vencimento posterior" },
  { id: "NA_ENTREGA", label: "Na entrega", description: "retirada local" },
];

const curatedReads = [
  {
    title: "Leitura do mês",
    text: "Livros escolhidos pelas leitoras e outros sugeridos pela curadoria.",
  },
  {
    title: "Comunidade acolhedora",
    text: "Um espaço para trocar ideias, indicações e amizades entre quem ama ler.",
  },
  {
    title: "Mimos com carinho",
    text: "Cada produto da lojinha é escolhido pensando no aconchego das leitoras.",
  },
];

const votingBooks = [
  {
    title: "Entre páginas e café",
    detail: "para votação da próxima leitura compartilhada",
  },
  {
    title: "A casa das leituras",
    detail: "curadoria em aberto para o próximo ciclo",
  },
  {
    title: "O tempo das cartas",
    detail: "candidato à votação da roda do clube",
  },
];

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function normalizeCep(value: string) {
  return value.replace(/\D/g, "").slice(0, 8);
}

function formatCep(value: string) {
  const digits = normalizeCep(value);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function paymentMethodLabel(value: PaymentMethod) {
  switch (value) {
    case "PIX":
      return "Pix";
    case "CARTAO":
      return "Cartão";
    case "BOLETO":
      return "Boleto";
    case "NA_ENTREGA":
      return "Na entrega";
  }
}

function shippingServiceLabel(value: ShippingService) {
  switch (value) {
    case "PAC":
      return "PAC";
    case "SEDEX":
      return "SEDEX";
    case "RETIRADA":
      return "Retirada na roda do clube";
  }
}

export default function LojinhaPage() {
  const [filter, setFilter] = useState<Filter>("todos");
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [emBreve, setEmBreve] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Busca configuração e produtos em paralelo
        const [configRes, prodRes] = await Promise.all([
          fetch('/api/lojinha/config'),
          fetch('/api/produtos?activeOnly=true')
        ]);

        if (configRes.ok) {
          const config = await configRes.json();
          setEmBreve(config.emBreve);
        }

        if (prodRes.ok) {
          const data = await prodRes.json();
          // Converte preço de centavos da API para decimal que o componente usa
          setDbProducts(data.map((p: any) => ({
            ...p,
            price: p.price / 100,
            image: p.imageUrl || "/images/produto-placeholder.png"
          })));
        }
      } catch (e) {
        console.error('Erro ao carregar loja:', e);
      } finally {
        setPageLoading(false);
      }
    }
    load();
  }, []);

  const { items, addItem, removeItem, increment, decrement, clear, count, total, isCartOpen, setIsCartOpen } = useCart();

  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [shippingService, setShippingService] = useState<ShippingService>("PAC");
  const [shippingQuote, setShippingQuote] = useState<ShippingQuote | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX");

  const [cepInput, setCepInput] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [addressComplement, setAddressComplement] = useState("");
  const [addressNeighborhood, setAddressNeighborhood] = useState("");
  const [addressCityState, setAddressCityState] = useState("");
  const [addressReference, setAddressReference] = useState("");

  const filtered = useMemo(
    () => (filter === "todos" ? dbProducts : dbProducts.filter((p) => p.category === filter)),
    [filter, dbProducts],
  );

  const tabs = useMemo(() => {
    const catsInDb = Array.from(new Set(dbProducts.map((p) => p.category))).sort();
    return [
      { id: "todos" as const, label: "Todos" },
      ...catsInDb.map((cat) => ({ 
        id: cat as Filter, 
        label: cat.charAt(0).toUpperCase() + cat.slice(1) 
      })),
    ];
  }, [dbProducts]);

  const shipping = total >= FREE_SHIPPING_MINIMUM || total === 0 ? 0 : shippingQuote?.price ?? 0;
  const finalTotal = total + shipping;
  const shippingLabel = total === 0 ? "Calcule pelo CEP" : shipping === 0 ? "Grátis" : formatPrice(shipping);

  const addressLines = [
    streetAddress && addressNumber ? `${streetAddress}, ${addressNumber}` : streetAddress || addressNumber,
    addressComplement,
    addressNeighborhood,
    addressCityState,
    cepInput ? `CEP: ${cepInput}` : "",
    addressReference ? `Referência: ${addressReference}` : "",
  ].filter(Boolean);

  const calculateShipping = async (service: ShippingService = shippingService) => {
    if (service === "RETIRADA") {
      setShippingError(null);
      setAddressCityState((prev) => prev || "Brasília/DF");
      setShippingQuote({
        cep: "Retirada local",
        uf: "DF",
        city: "Brasília/DF",
        provider: "Clube das Leitoras",
        service: "RETIRADA",
        etaDays: "na hora",
        price: 0,
      });
      return;
    }

    const cep = normalizeCep(cepInput);
    if (cep.length !== 8) {
      setShippingError("Digite um CEP válido com 8 números.");
      setShippingQuote(null);
      return;
    }

    setShippingLoading(true);
    setShippingError(null);

    try {
      const response = await fetch(`/api/frete?cep=${cep}&service=${service}`);
      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error ?? "CEP não encontrado.");
      }

      setShippingQuote({
        cep: String(data.cep || formatCep(cep)),
        uf: String(data.uf || ""),
        city: String(data.city || ""),
        provider: String(data.provider || "Correios"),
        service: String(data.service || service),
        etaDays: String(data.etaDays || "3 a 6"),
        price: Number(data.price ?? 0),
      });

      if (String(data.city || "").trim()) {
        setAddressCityState(String(data.city));
      }
    } catch {
      setShippingQuote(null);
      setShippingError("Não foi possível calcular este CEP agora. Tente novamente.");
    } finally {
      setShippingLoading(false);
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) return;

    const lines = items.map(
      (item) => `- ${item.quantity}x ${item.product.name} - ${formatPrice(item.product.price * item.quantity)}`,
    );

    const message = [
      "Olá! Gostaria de fazer um pedido na lojinha do Clube das Leitoras:",
      "",
      customerName ? `Nome: ${customerName}` : "Nome: não informado",
      customerPhone ? `Telefone/WhatsApp: ${customerPhone}` : "Telefone/WhatsApp: não informado",
      `Forma de pagamento: ${paymentMethodLabel(paymentMethod)}`,
      `Entrega: ${shippingServiceLabel(shippingService)}`,
      addressLines.length > 0 ? "Endereço:" : "",
      ...addressLines,
      shippingQuote ? `CEP: ${shippingQuote.cep} (${shippingQuote.city})` : "CEP: não informado",
      shippingQuote
        ? `Frete: ${shippingQuote.provider} · ${shippingQuote.service} · prazo ${shippingQuote.etaDays} dias`
        : "",
      "",
      ...lines,
      "",
      `Subtotal: ${formatPrice(total)}`,
      `Frete estimado: ${shippingLabel}`,
      `Total: ${formatPrice(finalTotal)}`,
    ].join("\n");

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <main
        id="inicio"
        className="min-h-screen font-alice relative overflow-hidden pb-24 pt-32 text-[#4A443F]"
        style={{
          background: `#FDFCFB url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')`,
        }}
      >
        <section className="mx-auto w-full max-w-6xl px-4 pt-2 md:px-6 md:pt-4 lg:pt-6">
          <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
            <div className="max-w-xl space-y-8">
              <p className="text-[11px] uppercase tracking-[0.28em] text-azul-curadoria">Feito por leitoras, para leitoras</p>
              <h1 className="max-w-lg font-alice text-5xl leading-[1.05] text-[#3F5B74] md:text-6xl lg:text-7xl">
                <span className="text-[#2C3E50]">Mimos para</span>
                <br />
                <span className="italic text-azul-curadoria">quem ama ler.</span>
              </h1>
              <div className="h-px w-full max-w-md bg-[#DDD4C9]" />
              <p className="max-w-md text-[15px] leading-8 text-[#6C5E52] md:text-lg">
                Uma curadoria especial de itens selecionados com carinho para deixar seus momentos de leitura
                ainda mais aconchegantes.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <a
                  href="#produtos"
                  className="inline-flex items-center rounded-full bg-azul-curadoria px-7 py-3 text-[11px] uppercase tracking-[0.22em] text-white transition hover:brightness-95"
                >
                  Ver produtos
                </a>
                <a
                  href="/"
                  className="inline-flex items-center rounded-full border border-[#DDD4C9] bg-white px-7 py-3 text-[11px] uppercase tracking-[0.22em] text-[#3F5B74] transition hover:border-azul-curadoria hover:text-azul-curadoria"
                >
                  Conhecer o clube
                </a>
              </div>
            </div>

            <figure className="relative">
              <div className="overflow-hidden rounded-[1.8rem] border border-[#D9CCBB] bg-[#F7F1E6] p-2 shadow-[0_14px_50px_-24px_rgba(108,94,82,0.4)]">
                <Image
                  src="/logo.png"
                  alt="Logo do Clube das Leitoras"
                  width={720}
                  height={720}
                  className="h-auto w-full rounded-3xl object-cover"
                  priority
                />
              </div>
              <figcaption className="mt-4 text-center font-alice text-lg italic text-azul-curadoria">
                Cada capítulo merece um cantinho aconchegante.
              </figcaption>
            </figure>
          </div>
        </section>

        <section id="produtos" className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-20">
          {emBreve ? (
            <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-[3rem] border border-[#DDD4C9]/50 shadow-sm px-6">
              <div className="space-y-6 max-w-lg">
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-[#8C7B6E] font-bold">Lojinha do Clube</p>
                  <h2 className="font-alice text-5xl md:text-6xl text-[#3F5B74]">
                    Em <span className="italic text-azul-curadoria">breve.</span>
                  </h2>
                </div>
                
                <div className="h-px w-16 bg-[#DDD4C9] mx-auto" />
                
                <p className="font-serif italic text-lg text-[#6C5E52] leading-relaxed">
                  Estamos preparando cada detalhe da nossa estante virtual. 
                  Logo mais, você poderá levar um pedacinho do clube para casa.
                </p>

                <div className="mt-8 relative w-32 h-32 mx-auto opacity-20 grayscale">
                   <ShoppingBag className="w-full h-full text-[#3F5B74]" />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 grid gap-4 rounded-2xl border border-[#DDD4C9] bg-white px-5 py-4 text-sm text-[#4A443F]/80 md:grid-cols-4 md:items-center md:px-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-azul-curadoria">Frete</p>
              <p className="mt-1">Envio para todo o Brasil</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-azul-curadoria">Prazo</p>
              <p className="mt-1">Postagem em até 48h úteis</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-azul-curadoria">Pagamento</p>
              <p className="mt-1">Pix, cartão e boleto</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-azul-curadoria">Disponibilidade</p>
              <p className="mt-1">Peças selecionadas e estoque limitado</p>
            </div>
          </div>

          <div className="space-y-4 text-center">
            <p className="text-[11px] uppercase tracking-[0.26em] text-azul-curadoria">A lojinha · Vitrine</p>
            <h2 className="font-alice text-4xl text-[#4A443F] md:text-5xl">
              Nossos <span className="italic text-azul-curadoria">mimos</span>
            </h2>
            <p className="mx-auto max-w-2xl text-base leading-8 text-[#4A443F]/80">
              Uma seleção de produtos para acompanhar cada capítulo. Adicione à sacola o que o seu coração leitor
              pedir.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.16em] transition-colors ${
                  filter === tab.id
                    ? "border-azul-curadoria bg-azul-curadoria text-white"
                    : "border-[#DDD4C9] bg-white text-[#4A443F] hover:border-azul-curadoria hover:text-azul-curadoria"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-12">
            {pageLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-azul-curadoria" />
                <p className="mt-4 font-alice italic text-slate-400">Arrumando a estante...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <BookOpen className="h-10 w-10 text-slate-200" />
                <p className="mt-4 font-alice italic text-slate-400">Nenhum produto encontrado nesta categoria.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {filtered.map((product) => (
                  <article
                    key={product.id}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#DDD4C9] bg-white transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-square overflow-hidden bg-[#F4F1EC]">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {product.badge && (
                    <span className="absolute left-3 top-3 rounded-full bg-azul-curadoria px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-white">
                      {product.badge}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <h3 className="font-alice text-xl text-[#4A443F]">{product.name}</h3>
                  <p className="flex-1 text-sm leading-7 text-[#4A443F]/75">{product.description}</p>
                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#EEE5DA] pt-3">
                    <span className="font-alice text-2xl text-azul-curadoria">{formatPrice(product.price)}</span>
                    <button
                      type="button"
                      onClick={() => addItem(product)}
                      className="inline-flex items-center gap-1 rounded-full border border-[#DDD4C9] bg-[#FAF8F4] px-3 py-2 text-xs uppercase tracking-[0.14em] text-[#4A443F] transition-colors hover:border-azul-curadoria hover:bg-azul-curadoria hover:text-white"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      Adicionar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  )}
</section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-20 md:px-6 md:pb-28">
          <div className="grid gap-10 border-t border-[#E7DDD0] pt-10 md:grid-cols-[1.05fr_0.95fr] md:items-center">
            <div className="overflow-hidden rounded-4xl border border-[#E1D7C9] bg-[#F8F2E8] p-2 shadow-[0_14px_50px_-24px_rgba(108,94,82,0.35)]">
              <div className="relative aspect-4/5 overflow-hidden rounded-3xl bg-[#F4EBDD]">
                <Image
                  src="/13.jpeg"
                  alt="Pilha de livros coloridos na mão"
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover object-center"
                />
              </div>
            </div>

            <div className="px-1 md:px-4">
              <p className="text-[10px] uppercase tracking-[0.34em] text-azul-curadoria">Manifesto · O clube</p>
              <h2 className="mt-4 font-alice text-4xl leading-[1.02] text-[#3F5B74] md:text-5xl lg:text-6xl">
                <span className="text-[#2C3E50]">Onde a última página é o</span> <span className="italic text-azul-curadoria">começo.</span>
              </h2>
              <div className="mt-6 h-px bg-[#E4D8CB]" />
              <p className="mt-5 max-w-xl text-sm leading-8 text-[#4A443F]/78 md:text-base">
                Somos um clube de leitura feito de encontros, cafés e boas histórias. A lojinha nasceu para reunir os
                produtos que deixam nossos momentos com os livros ainda mais especiais.
              </p>

              <div className="mt-8 space-y-6">
                {curatedReads.map((item, index) => {
                  const Icon = [BookOpen, Users, Heart][index] ?? BookOpen;

                  return (
                    <div key={item.title} className="flex gap-4">
                      <div className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#E5D7CC] bg-[#FAF8F4] text-azul-curadoria">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-alice text-xl text-[#4A443F]">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 text-[#7A736D]">{item.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>

      <div
        aria-hidden={!isCartOpen}
        onClick={() => setIsCartOpen(false)}
        className={`fixed inset-0 z-110 bg-black/35 transition-opacity ${
          isCartOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-label="Sacola de compras"
        aria-modal="true"
        className={`fixed right-0 top-0 z-120 flex h-full w-full max-w-md flex-col bg-bege-papel shadow-xl transition-transform duration-300 ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#DDD4C9] px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-azul-curadoria" aria-hidden="true" />
            <h2 className="font-alice text-2xl text-[#4A443F]">Sua sacola</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            aria-label="Fechar sacola"
            className="rounded-full p-2 text-[#817971] transition-colors hover:bg-[#F7E7E4] hover:text-azul-curadoria"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingBag className="h-10 w-10 text-azul-curadoria" aria-hidden="true" />
            <p className="font-alice text-xl text-[#4A443F]">Sua sacola está vazia</p>
            <p className="text-sm text-[#7A736D]">Adicione alguns mimos e eles aparecerão aqui.</p>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-[#DDD4C9] overflow-y-auto px-5">
              {items.map((item) => (
                <li key={item.product.id} className="flex gap-3 py-4">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    width={72}
                    height={72}
                    className="h-18 w-18 rounded-lg object-cover"
                  />
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-alice text-lg text-[#4A443F]">{item.product.name}</h3>
                      <button
                        type="button"
                        onClick={() => removeItem(item.product.id)}
                        aria-label={`Remover ${item.product.name}`}
                        className="text-[#8E877F] transition-colors hover:text-azul-curadoria"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                    <span className="text-sm text-[#7A736D]">{formatPrice(item.product.price)}</span>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-full border border-[#DDD4C9]">
                        <button
                          type="button"
                          onClick={() => decrement(item.product.id)}
                          aria-label="Diminuir quantidade"
                          className="rounded-full p-1.5 text-[#4A443F] transition-colors hover:text-azul-curadoria"
                        >
                          <Minus className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <span className="min-w-6 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => increment(item.product.id)}
                          aria-label="Aumentar quantidade"
                          className="rounded-full p-1.5 text-[#4A443F] transition-colors hover:text-azul-curadoria"
                        >
                          <Plus className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                      <span className="text-base text-azul-curadoria">{formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-[#DDD4C9] px-5 py-4">
              {!showCheckoutForm ? (
                <>
                  <div className="mb-4 space-y-2 rounded-2xl border border-[#DDD4C9] bg-white p-4">
                    <div className="flex items-center justify-between text-sm text-[#4A443F]/80">
                      <span>Subtotal</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-[#4A443F]/80">
                      <span>{shippingQuote?.service === "RETIRADA" ? "Retirada" : "Frete estimado"}</span>
                      <span>{shippingQuote ? `${shippingQuote.provider} · ${shippingLabel}` : shippingLabel}</span>
                    </div>
                    <div className="h-px bg-[#EEE5DA]" />
                    <div className="flex items-center justify-between text-base font-semibold text-[#4A443F]">
                      <span>Total</span>
                      <span>{formatPrice(finalTotal)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCheckoutForm(true)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-azul-curadoria px-5 py-4 text-[12px] font-semibold uppercase tracking-[0.22em] text-white shadow-md transition hover:brightness-95"
                  >
                    Confirmar pedido e preencher dados
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="grid gap-2 md:grid-cols-2">
                    <input
                      type="text"
                      placeholder="Seu nome"
                      value={customerName}
                      onChange={(event) => setCustomerName(event.target.value)}
                      className="w-full rounded-full border border-[#DDD4C9] bg-[#FAF8F4] px-4 py-3 text-sm text-[#4A443F] outline-none transition focus:border-azul-curadoria"
                    />
                    <input
                      type="tel"
                      placeholder="Telefone / WhatsApp"
                      value={customerPhone}
                      onChange={(event) => setCustomerPhone(event.target.value)}
                      className="w-full rounded-full border border-[#DDD4C9] bg-[#FAF8F4] px-4 py-3 text-sm text-[#4A443F] outline-none transition focus:border-azul-curadoria"
                    />
                  </div>

                  <div className="grid gap-2 md:grid-cols-2">
                    {PAYMENT_METHODS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setPaymentMethod(option.id)}
                        className={`rounded-xl border px-3 py-2.5 text-left transition ${
                          paymentMethod === option.id
                            ? "border-azul-curadoria bg-[#F7E7E4]"
                            : "border-[#DDD4C9] bg-[#FAF8F4] hover:border-azul-curadoria"
                        }`}
                      >
                        <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#4A443F]">{option.label}</span>
                        <span className="mt-1 block text-[10px] text-[#7A736D]">{option.description}</span>
                      </button>
                    ))}
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-azul-curadoria">Calcular frete</p>
                    <p className="mt-1 text-sm text-[#4A443F]/75">
                      Informe seu CEP para calcular o valor de envio do pedido e preencher a cidade automaticamente.
                    </p>
                  </div>

                  <div className="grid gap-2 md:grid-cols-3">
                    {SHIPPING_SERVICES.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setShippingService(option.id);
                          if (normalizeCep(cepInput).length === 8) {
                            void calculateShipping(option.id);
                          }
                        }}
                        className={`rounded-xl border px-3 py-2.5 text-left transition ${
                          shippingService === option.id
                            ? "border-azul-curadoria bg-[#F7E7E4]"
                            : "border-[#DDD4C9] bg-[#FAF8F4] hover:border-azul-curadoria"
                        }`}
                      >
                        <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#4A443F]">{option.label}</span>
                        <span className="mt-1 block text-[10px] text-[#7A736D]">{option.description}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex w-full gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="00000-000"
                      value={cepInput}
                      disabled={shippingService === "RETIRADA"}
                      onChange={(event) => {
                        setCepInput(formatCep(event.target.value));
                        setShippingError(null);
                      }}
                      className={`w-full rounded-full border border-[#DDD4C9] bg-[#FAF8F4] px-4 py-3 text-sm text-[#4A443F] outline-none transition focus:border-azul-curadoria ${
                        shippingService === "RETIRADA" ? "cursor-not-allowed opacity-60" : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => void calculateShipping()}
                      disabled={shippingLoading}
                      className="rounded-full bg-azul-curadoria px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {shippingLoading ? "Calculando..." : shippingService === "RETIRADA" ? "Selecionar" : "Calcular"}
                    </button>
                  </div>

                  {shippingService === "RETIRADA" && (
                    <p className="text-xs text-[#7A736D]">Você pode retirar na roda do clube em Brasília. Não precisa informar CEP.</p>
                  )}
                  {shippingError && <p className="text-sm text-azul-curadoria">{shippingError}</p>}

                  <div className="grid gap-2 md:grid-cols-2">
                    <input
                      type="text"
                      placeholder="Rua / avenida"
                      value={streetAddress}
                      onChange={(event) => setStreetAddress(event.target.value)}
                      className="w-full rounded-full border border-[#DDD4C9] bg-[#FAF8F4] px-4 py-3 text-sm text-[#4A443F] outline-none transition focus:border-azul-curadoria"
                    />
                    <input
                      type="text"
                      placeholder="Número"
                      value={addressNumber}
                      onChange={(event) => setAddressNumber(event.target.value)}
                      className="w-full rounded-full border border-[#DDD4C9] bg-[#FAF8F4] px-4 py-3 text-sm text-[#4A443F] outline-none transition focus:border-azul-curadoria"
                    />
                    <input
                      type="text"
                      placeholder="Bairro"
                      value={addressNeighborhood}
                      onChange={(event) => setAddressNeighborhood(event.target.value)}
                      className="w-full rounded-full border border-[#DDD4C9] bg-[#FAF8F4] px-4 py-3 text-sm text-[#4A443F] outline-none transition focus:border-azul-curadoria"
                    />
                    <input
                      type="text"
                      placeholder="Cidade / UF"
                      value={addressCityState}
                      onChange={(event) => setAddressCityState(event.target.value)}
                      className="w-full rounded-full border border-[#DDD4C9] bg-[#FAF8F4] px-4 py-3 text-sm text-[#4A443F] outline-none transition focus:border-azul-curadoria"
                    />
                    <input
                      type="text"
                      placeholder="Complemento"
                      value={addressComplement}
                      onChange={(event) => setAddressComplement(event.target.value)}
                      className="w-full rounded-full border border-[#DDD4C9] bg-[#FAF8F4] px-4 py-3 text-sm text-[#4A443F] outline-none transition focus:border-azul-curadoria"
                    />
                    <input
                      type="text"
                      placeholder="Ponto de referência"
                      value={addressReference}
                      onChange={(event) => setAddressReference(event.target.value)}
                      className="w-full rounded-full border border-[#DDD4C9] bg-[#FAF8F4] px-4 py-3 text-sm text-[#4A443F] outline-none transition focus:border-azul-curadoria"
                    />
                  </div>

                  <div className="mb-4 space-y-2 rounded-2xl border border-[#DDD4C9] bg-white p-4">
                    <div className="flex items-center justify-between text-sm text-[#4A443F]/80">
                      <span>Subtotal</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-[#4A443F]/80">
                      <span>{shippingQuote?.service === "RETIRADA" ? "Retirada" : "Frete estimado"}</span>
                      <span>{shippingQuote ? `${shippingQuote.provider} · ${shippingLabel}` : shippingLabel}</span>
                    </div>
                    <div className="h-px bg-[#EEE5DA]" />
                    <div className="flex items-center justify-between text-base font-semibold text-[#4A443F]">
                      <span>Total</span>
                      <span>{formatPrice(finalTotal)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-azul-curadoria px-5 py-4 text-[12px] font-semibold uppercase tracking-[0.22em] text-white shadow-md transition hover:brightness-95"
                  >
                    Finalizar no WhatsApp <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCheckoutForm(false)}
                    className="mt-2 w-full text-center text-sm text-[#7A736D] transition-colors hover:text-azul-curadoria"
                  >
                    Voltar ao resumo
                  </button>
                </div>
              )}

              <div className="mb-3 mt-4 flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.16em] text-[#7A736D]">
                  Total ({count} {count === 1 ? "item" : "itens"})
                </span>
                <span className="font-alice text-2xl text-azul-curadoria">{formatPrice(finalTotal)}</span>
              </div>

              {total < FREE_SHIPPING_MINIMUM && (
                <p className="mb-3 text-xs text-[#7A736D]">
                  Frete grátis acima de {formatPrice(FREE_SHIPPING_MINIMUM)}.
                </p>
              )}

              <button
                type="button"
                onClick={clear}
                className="mt-2 w-full text-center text-sm text-[#7A736D] transition-colors hover:text-azul-curadoria"
              >
                Esvaziar sacola
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
