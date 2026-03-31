import { db } from '@/lib/db';
import { resenhas } from '@/lib/db/schema';
import { eq, desc, not } from 'drizzle-orm';
import Image from 'next/image';
import ResenhaComments from '@/components/ResenhaComments';

export const dynamic = 'force-dynamic';
import SidebarCronologica from '@/components/SidebarCronologica';
import { notFound } from 'next/navigation';
import { Quote, PenTool, BookOpen, Calendar, MapPin } from 'lucide-react';
import { normalizeDateValue, parseDateValue, formatMonthYear } from '@/lib/utils';

const marromPapel = '#8C7A66';
const azulPetroleo = '#2C3E50';

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const [row] = await db.select().from(resenhas).where(eq(resenhas.id, id));
    if (!row) return { title: 'Resenha não encontrada' };
    return { title: `${row.title} — Clube das Leitoras` };
  } catch (err) {
    return { title: 'Resenha' };
  }
}



export default async function ResenhaByIdPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  if (!id) notFound();

  const [r] = await db.select().from(resenhas).where(eq(resenhas.id, id));
  if (!r) notFound();

  const todas = await db.select().from(resenhas).orderBy(desc(resenhas.createdAt));

  const imageSrc = r.imageUrl
    ? r.imageUrl.startsWith('http') ? r.imageUrl : `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}${r.imageUrl}`
    : '/og-image.png';

  return (
    <div className="min-h-screen font-alice pb-40 relative overflow-hidden" style={{ background: `#FDFCFB url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')` }}>
      <header className="max-w-5xl mx-auto pt-32 pb-16 px-6 text-center border-b border-black/5">
        <div className="flex items-center justify-center gap-4 mb-8 opacity-40">
          <div className="h-px w-10 bg-black" />
          <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-black italic">Crítica & Memória • Clube das Leitoras</span>
          <div className="h-px w-10 bg-black" />
        </div>
        <h1 className="text-6xl md:text-8xl text-[#2C3E50] tracking-tighter leading-[0.8] mb-10">{r.title}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-3xl mx-auto border-t border-black/10 pt-10">
          <p className="text-base leading-relaxed opacity-60 text-black italic">&ldquo;Uma análise profunda sobre {r.book ?? 'a obra'}, tecendo diálogos entre a literatura.&rdquo;</p>
          <div className="flex flex-col justify-end items-start md:items-end">
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-sans font-bold" style={{ color: marromPapel }}>
              <PenTool size={14} /> Publicado em {formatMonthYear(parseDateValue(r.publishedAt ?? null) ?? normalizeDateValue(r.createdAt))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-24">
        <div className="flex items-center justify-start gap-3 mb-8">
          <a href="/resenhas" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-black/10 bg-white text-sm font-bold text-[#2C3E50] hover:bg-[#FDFCFB] transition">
            ← Voltar ao Arquivo
          </a>
        </div>

        <div className="grid lg:grid-cols-12 gap-16 items-start">
          <aside className="lg:col-span-3 border-r border-black/5 pr-8">
            <SidebarCronologica todas={todas ?? []} idAtivo={r.id} />
          </aside>

          <article className="lg:col-span-6 space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="relative group max-w-sm mx-auto md:mx-0">
              <div className="aspect-3/4 bg-white p-6 shadow-xl relative z-10 border border-black/5 -rotate-1 transition-transform group-hover:rotate-0 duration-700">
                {r.imageUrl ? (
                  <div className="relative w-full h-full">
                    <Image src={r.imageUrl} alt={r.title} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#FDFCFB] border border-dashed border-black/10 text-black/20">
                    <BookOpen size={40} />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-8 pt-4 border-t border-black/5">
              <Quote style={{ color: marromPapel }} size={32} className="opacity-20" />
              <div className="prose prose-lg max-w-none text-lg leading-relaxed opacity-90 text-black font-alice text-justify" style={{ textAlign: 'justify' }} dangerouslySetInnerHTML={{ __html: (r.content ?? '').replace(/\n/g, '<br/>') }} />
            </div>

            <div id="comentarios" className="mt-24 pt-12 border-t border-black/10">
              <ResenhaComments resenhaId={r.id} tituloResenha={r.title} isStandalone={true} aberto={true} />
            </div>
          </article>

          <aside className="lg:col-span-3 space-y-12">
            <section className="bg-white p-10 border border-black/5 shadow-sm rounded-2xl">
              <h4 className="text-[9px] font-bold uppercase tracking-widest mb-8 opacity-30 text-black">Detalhes da Obra</h4>
              <div className="space-y-8 text-sm italic opacity-60 text-black">
                <div className="flex items-center gap-4"><BookOpen size={16} style={{ color: marromPapel }} className="opacity-40" /><span>{r.book ?? 'Título Indisponível'}</span></div>
                <div className="flex items-center gap-4"><PenTool size={16} style={{ color: marromPapel }} className="opacity-40" /><span>{r.author ?? 'Autoria não informada'}</span></div>
                <div className="flex items-center gap-4"><MapPin size={16} style={{ color: marromPapel }} className="opacity-40" /><span>Clube das Leitoras</span></div>
              </div>
            </section>
            <div className="p-6 border border-black/10 rounded-xl italic text-xs leading-relaxed" style={{ color: '#2C3E50' }}>Esta resenha faz parte do acervo digital do Clube das Leitoras, um projeto dedicado a amplificar vozes femininas na literatura.</div>
          </aside>
        </div>
      </main>
    </div>
  );
}
