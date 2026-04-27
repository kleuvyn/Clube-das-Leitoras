"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Quote, Star, BookOpen, ChevronDown, Loader2 } from "lucide-react";
import ResenhaComments from '@/components/ResenhaComments';
import { normalizeDateValue, parseDateValue, formatMonthYear } from '@/lib/utils';

const papelEditorial = "#FDFCFB";
const amareloVintage = "#E9C46A"; 
const azulPetroleo = "#2C3E50";

interface Resenha {
  id: string;
  title: string;
  book: string | null;
  author: string | null;
  content: string | null;
  rating: number | null;
  imageUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
}

interface Comentario {
  id: string;
  autoraNome: string;
  texto: string;
  createdAt: string;
}

const MESES_PT: Record<string, number> = {
  janeiro: 1, fevereiro: 2, março: 3, abril: 4, maio: 5, junho: 6,
  julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
};

function normalizeMonthName(monthName: string): number | null {
  const cleaned = monthName
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase();

  for (const [num, name] of Object.entries(MESES_PT)) {
    const normalizedName = name
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase();
    if (normalizedName === cleaned || normalizedName.startsWith(cleaned) || cleaned.startsWith(normalizedName)) {
      return Number(num);
    }
  }

  const numeric = Number(cleaned);
  return Number.isInteger(numeric) && numeric >= 1 && numeric <= 12 ? numeric : null;
}

function extrairAnoMes(r: Resenha): { ano: number; mes: number } {
  const d = parseDateValue(r.publishedAt ?? null) ?? normalizeDateValue(r.createdAt)
  return { ano: d.getFullYear(), mes: d.getMonth() + 1 }
}

function labelMes(r: Resenha): string {
  const d = parseDateValue(r.publishedAt ?? null) ?? normalizeDateValue(r.createdAt)
  return formatMonthYear(d)
}

// use extracted ResenhaComments component instead

export default function ResenhasPage() {
  const [resenhas, setResenhas] = useState<Resenha[]>([]);
  const [loading, setLoading] = useState(true);
  const [abertas, setAbertas] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0, hasMore: false });
  const limit = 12;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/resenhas?page=${page}&limit=${limit}`)
      .then(r => r.json())
      .then(data => {
        setResenhas(Array.isArray(data.data) ? data.data : []);
        setPagination(data.pagination || { total: 0, pages: 0, hasMore: false });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  // Add BreadcrumbList JSON-LD to head after resenhas load (client-side)
  useEffect(() => {
    if (!resenhas || resenhas.length === 0) return;
    try {
      const siteUrl = (window as any).NEXT_PUBLIC_SITE_URL || window.location.origin;
      const items = resenhas.slice(0, 20).map((r, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: r.title,
        item: `${siteUrl}/resenhas/${r.id}`
      }));

      const json = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': items
      };

      const scriptId = 'breadcrumb-jsonld';
      let existing = document.getElementById(scriptId);
      if (existing) existing.remove();
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.id = scriptId;
      s.text = JSON.stringify(json);
      document.head.appendChild(s);
    } catch (err) {
      console.error('Erro ao adicionar Breadcrumb JSON-LD', err);
    }
  }, [resenhas]);

  const toggleAberta = (id: string) =>
    setAbertas(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  
  const agrupado = resenhas.reduce<Record<number, Resenha[]>>((acc, r) => {
    const { ano } = extrairAnoMes(r);
    if (!acc[ano]) acc[ano] = [];
    acc[ano].push(r);
    return acc;
  }, {});

  const anos = Object.keys(agrupado)
    .map(Number)
    .sort((a, b) => b - a); 

  
  for (const ano of anos) {
    agrupado[ano].sort((a, b) => extrairAnoMes(b).mes - extrairAnoMes(a).mes);
    // Remover duplicatas por título
    agrupado[ano] = agrupado[ano].filter((resenha, idx, arr) => {
      const key = String(resenha.book ?? '').toLowerCase();
      return arr.findIndex(r => String(r.book ?? '').toLowerCase() === key) === idx;
    });
  }

  return (
    <div
      className="min-h-screen pb-32 relative overflow-hidden font-alice selection:bg-[#FDE68A]"
      style={{ background: `${papelEditorial} url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')` }}
    >
      
      <header className="max-w-5xl mx-auto pt-32 pb-24 px-6 relative z-10 text-center border-b border-black/5">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px w-12 bg-[#2C3E50]/20" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.7em] text-[#2C3E50] opacity-60">
            Crônicas de um Ano Literário
          </span>
          <div className="h-px w-12 bg-[#2C3E50]/20" />
        </div>

        <h1 className="text-7xl md:text-[100px] text-[#2C3E50] tracking-tighter leading-[0.8] mb-10">
          Diário de <span style={{ color: amareloVintage }} className="italic font-light">Leituras</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-3xl mx-auto border-t border-black/10 pt-10">
          <p className="text-base leading-relaxed opacity-60 text-black italic">
            &ldquo;Este é o nosso espaço de registro. Onde as palavras lidas encontram nossas vozes e se transformam em memórias de papel.&rdquo;
          </p>
          <div className="flex flex-col justify-end items-start md:items-end">
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-sans font-bold" style={{ color: amareloVintage }}>
              <Quote size={14} /> Crônicas de um Ano Literário
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 relative z-10 mt-24 space-y-32">

        {loading ? (
          <div className="text-center italic opacity-30 text-[#2C3E50] py-20">
            Abrindo os arquivos do diário...
          </div>
        ) : resenhas.length === 0 ? (
          <div className="text-center py-24 space-y-4 opacity-40">
            <BookOpen size={40} className="mx-auto" style={{ color: azulPetroleo }} />
            <p className="italic text-[#2C3E50]">Ainda não há resenhas publicadas.</p>
          </div>
        ) : (
          anos.map(ano => (
            <section key={ano}>
              
              <div className="flex items-end gap-6 mb-20 select-none">
                <span
                  className="text-[100px] md:text-[140px] font-light tracking-tighter leading-none"
                  style={{ color: `${azulPetroleo}10` }}
                >
                  {ano}
                </span>
                <div className="flex-1 mb-6">
                  <div className="h-px w-full bg-black/10" />
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.5em] opacity-30 text-[#2C3E50]">
                    {agrupado[ano].length} leitura{agrupado[ano].length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              
              <div className="space-y-0">
                {agrupado[ano].map(r => (
                  <ResenhaCard
                    key={r.id}
                    resenha={r}
                    periodo={labelMes(r)}
                    aberta={abertas.has(r.id)}
                    onToggle={() => toggleAberta(r.id)}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {/* Paginação */}
      {!loading && resenhas.length > 0 && pagination.pages > 1 && (
        <div className="max-w-4xl mx-auto px-6 mt-24 pb-12 flex items-center justify-center gap-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-6 py-3 rounded-2xl font-bold uppercase text-[10px] tracking-widest transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            style={{
              backgroundColor: page === 1 ? '#ddd' : azulPetroleo,
              color: page === 1 ? '#999' : 'white',
            }}
          >
            ← Anterior
          </button>
          
          <span className="text-sm text-[#2C3E50] opacity-60 italic">
            Página {page} de {pagination.pages}
          </span>
          
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={!pagination.hasMore}
            className="px-6 py-3 rounded-2xl font-bold uppercase text-[10px] tracking-widest transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            style={{
              backgroundColor: !pagination.hasMore ? '#ddd' : azulPetroleo,
              color: !pagination.hasMore ? '#999' : 'white',
            }}
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
}

function ResenhaCard({ resenha: r, periodo, aberta, onToggle }: {
  resenha: Resenha; periodo: string; aberta: boolean; onToggle: () => void;
}) {
  const preview = r.content ? r.content.slice(0, 300) + (r.content.length > 300 ? '...' : '') : '';

  return (
    <article className="group grid grid-cols-1 md:grid-cols-12 gap-12 items-start border-b border-black/5 pb-20">

      
      <div className="md:col-span-8 space-y-6">

        
        <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: amareloVintage }}>
          <span>{periodo}</span>
          {r.rating && (
            <>
              <span className="opacity-20 text-black">|</span>
              <span className="flex gap-0.5 items-center">
                {[1,2,3,4,5].map(n => (
                  <Star key={n} size={11} fill={n <= r.rating! ? amareloVintage : 'none'} stroke={amareloVintage} strokeWidth={1.5} />
                ))}
              </span>
            </>
          )}
        </div>

        
        <div className="space-y-4">
          <h2 className="text-4xl md:text-5xl text-[#2C3E50] tracking-tight group-hover:italic transition-all duration-500">
            <Link href={`/resenhas/${r.id}#comentarios`} className="hover:underline">{r.title}</Link>
          </h2>
          {(r.book || r.author) && (
            <p className="text-lg italic opacity-50 text-black leading-relaxed">
              {r.book && (
                <Link href={`/livro-do-mes?q=${encodeURIComponent(String(r.book))}`} className="underline">
                  {r.book}
                </Link>
              )}
              {r.book && r.author && <span> · </span>}
              {r.author && <span>por {r.author}</span>}
            </p>
          )}
        </div>

        
        {r.content && (
          <div className="relative pl-5 border-l-2" style={{ borderColor: `${amareloVintage}60` }}>
            <p className="text-base italic leading-relaxed text-[#2C3E50]/70 font-light text-justify" style={{ textAlign: 'justify' }}>
              &ldquo;{aberta ? r.content : preview}&rdquo;
            </p>
          </div>
        )}

        {r.content && r.content.length > 300 && (
          <button
            onClick={onToggle}
            className="flex items-center gap-2 text-[9px] font-mono font-bold uppercase tracking-[0.3em] opacity-40 hover:opacity-80 transition-opacity text-[#2C3E50]"
          >
            <ChevronDown size={14} className={`transition-transform duration-500 ${aberta ? 'rotate-180' : ''}`} />
            {aberta ? 'Fechar' : 'Ler Resenha Completa'}
          </button>
        )}

        <ResenhaComments resenhaId={r.id} tituloResenha={r.title} aberto={aberta} />
      </div>

      
      <div className="md:col-span-4 flex justify-end">
        {r.imageUrl ? (
          <div className="p-3 bg-white shadow-xl -rotate-2 group-hover:rotate-0 transition-all duration-700 border border-black/3 w-full max-w-70">
              <div className="aspect-4/5 overflow-hidden relative transition-all duration-1000">
                <Link href={`/resenhas/${r.id}#comentarios`} className="w-full h-full p-0 m-0 block">
                  <img
                    src={r.imageUrl}
                    alt={r.book ?? r.title}
                    className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000"
                  />
                </Link>
            </div>
            <div className="mt-3 py-2 border-t border-black/5">
              <span className="text-[8px] font-bold uppercase tracking-[0.3em] opacity-30 block text-center italic">
                <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-black block text-center italic">
                  <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#222] block text-center italic">
                    {r.author ?? ''}
                  </span>
                </span>
              </span>
            </div>
          </div>
        ) : null}
      </div>

    </article>
  );
}

function ResenhaCardCompacto({ resenha: r, periodo }: { resenha: Resenha; periodo: string }) {
  return (
    <div className="group grid grid-cols-1 md:grid-cols-12 gap-8 items-start border-b border-black/5 pb-12">

      
      <div className="md:col-span-8 space-y-4">
        <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: amareloVintage }}>
          <span>{periodo}</span>
          {r.rating && (
            <>
              <span className="opacity-20 text-black">|</span>
              <span className="flex gap-0.5 items-center">
                {[1,2,3,4,5].map(n => (
                  <Star key={n} size={10} fill={n <= r.rating! ? amareloVintage : 'none'} stroke={amareloVintage} strokeWidth={1.5} />
                ))}
              </span>
            </>
          )}
        </div>
        <h4 className="text-3xl text-[#2C3E50] tracking-tight group-hover:italic transition-all duration-500">{r.title}</h4>
        <div className="mt-1">
          <Link href={`/resenhas/${r.id}#comentarios`} className="text-sm underline opacity-60">Abrir na página de comentários</Link>
        </div>
        {(r.book || r.author) && (
          <p className="text-base italic opacity-40 text-black">{r.book}{r.author ? ` · por ${r.author}` : ''}</p>
        )}
        {r.content && (
          <div className="relative pl-4 border-l-2" style={{ borderColor: `${amareloVintage}60` }}>
            <p className="text-sm italic leading-relaxed text-[#2C3E50]/60 text-justify" style={{ textAlign: 'justify' }}>
              &ldquo;{r.content.slice(0, 220)}{r.content.length > 220 ? '...' : ''}&rdquo;
            </p>
          </div>
        )}
        <ResenhaComments resenhaId={r.id} tituloResenha={r.title} aberto={false} />
      </div>

      
      <div className="md:col-span-4 flex justify-end">
        {r.imageUrl ? (
          <div className="p-2 bg-white shadow-lg -rotate-1 group-hover:rotate-0 transition-all duration-700 border border-black/3 w-full max-w-50">
            <div className="aspect-4/5 overflow-hidden transition-all duration-700">
              <img src={r.imageUrl} alt={r.book ?? r.title} className="w-full h-full object-cover" />
            </div>
            <div className="mt-2 py-1 border-t border-black/5">
              <span className="text-[7px] font-bold uppercase tracking-[0.3em] opacity-20 block text-center italic">{r.author ?? ''}</span>
            </div>
          </div>
        ) : null}
      </div>

    </div>
  );
}
