import { NextResponse } from "next/server";

const SHIPPING_BY_REGION = {
  sameState: 12.9,
  southeast: 18.9,
  south: 21.9,
  centerWest: 24.9,
  northeast: 27.9,
  north: 32.9,
};

const SHIPPING_SERVICES = {
  PAC: { multiplier: 1, etaDays: "3 a 8" },
  SEDEX: { multiplier: 1.55, etaDays: "1 a 3" },
  RETIRADA: { multiplier: 0, etaDays: "na hora" },
};

function normalizeCep(value: string) {
  return value.replace(/\D/g, "").slice(0, 8);
}

function shippingPriceByUf(uf?: string | null) {
  const regionMap: Record<string, number> = {
    SP: SHIPPING_BY_REGION.sameState,
    RJ: SHIPPING_BY_REGION.southeast,
    MG: SHIPPING_BY_REGION.southeast,
    ES: SHIPPING_BY_REGION.southeast,
    PR: SHIPPING_BY_REGION.south,
    SC: SHIPPING_BY_REGION.south,
    RS: SHIPPING_BY_REGION.south,
    DF: SHIPPING_BY_REGION.centerWest,
    GO: SHIPPING_BY_REGION.centerWest,
    MT: SHIPPING_BY_REGION.centerWest,
    MS: SHIPPING_BY_REGION.centerWest,
    AL: SHIPPING_BY_REGION.northeast,
    BA: SHIPPING_BY_REGION.northeast,
    CE: SHIPPING_BY_REGION.northeast,
    MA: SHIPPING_BY_REGION.northeast,
    PB: SHIPPING_BY_REGION.northeast,
    PE: SHIPPING_BY_REGION.northeast,
    PI: SHIPPING_BY_REGION.northeast,
    RN: SHIPPING_BY_REGION.northeast,
    SE: SHIPPING_BY_REGION.northeast,
    AC: SHIPPING_BY_REGION.north,
    AM: SHIPPING_BY_REGION.north,
    AP: SHIPPING_BY_REGION.north,
    PA: SHIPPING_BY_REGION.north,
    RO: SHIPPING_BY_REGION.north,
    RR: SHIPPING_BY_REGION.north,
    TO: SHIPPING_BY_REGION.north,
  };

  return uf ? regionMap[uf.toUpperCase()] ?? SHIPPING_BY_REGION.centerWest : SHIPPING_BY_REGION.centerWest;
}

function formatCep(value: string) {
  return `${value.slice(0, 5)}-${value.slice(5)}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cep = normalizeCep(searchParams.get("cep") ?? "");
    const requestedService = String(searchParams.get("service") ?? "PAC").toUpperCase();
    const selectedService = requestedService === "SEDEX" ? "SEDEX" : requestedService === "RETIRADA" ? "RETIRADA" : "PAC";

    if (cep.length !== 8) {
      return NextResponse.json({ error: "Digite um CEP válido com 8 números." }, { status: 400 });
    }

    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      cache: "no-store",
    });
    const data = await response.json();

    if (!response.ok || data.erro) {
      return NextResponse.json({ error: "CEP não encontrado." }, { status: 404 });
    }

    const serviceConfig = SHIPPING_SERVICES[selectedService as keyof typeof SHIPPING_SERVICES];
    const basePrice = shippingPriceByUf(data.uf);
    const price = Number((basePrice * serviceConfig.multiplier).toFixed(2));
    const provider = String(process.env.SHIPPING_PROVIDER_NAME ?? "Correios");

    if (selectedService === "RETIRADA") {
      return NextResponse.json(
        {
          cep: formatCep(cep),
          city: "Brasília/DF",
          uf: "DF",
          provider: "Clube das Leitoras",
          service: selectedService,
          etaDays: serviceConfig.etaDays,
          price: 0,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        cep: formatCep(cep),
        city: `${String(data.localidade || "")}/${String(data.uf || "")}`,
        uf: String(data.uf || ""),
        provider,
        service: selectedService,
        etaDays: serviceConfig.etaDays,
        price,
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "Erro ao calcular frete" }, { status: 500 });
  }
}