import { db } from '@/lib/db';
import { 
  livros, 
  encontros, 
  colaboradoras, 
  livroDoMes,
  empreendedoras,
  escritoras,
  resenhas,
} from '@/lib/db/schema';
import React from 'react';
import Link from 'next/link';
import { count, eq } from 'drizzle-orm';
import { 
  Book, 
  Users, 
  Calendar, 
  ArrowRight, 
  Coffee, 
  PenTool, 
  BookOpen,
  Sparkles,
  Briefcase
} from 'lucide-react';

const rosaGabi = "#B04D4A"; 

export default async function DashboardPage() {
  const [livrosRes, encontrosRes, colabsRes, empreendedorasRes, livroDoMesRes, escritorasRes, resenhasRes] = await Promise.all([
    db.select({ value: count() }).from(livros),
    db.select({ value: count() }).from(encontros),
    db.select({ value: count() }).from(colaboradoras),
    db.select({ value: count() }).from(empreendedoras),
    db.select({ value: count() }).from(livroDoMes),
    db.select({ value: count() }).from(escritoras),
    db.select({ value: count() }).from(resenhas),
  ]);

  const stats = {
    livros: Number(livrosRes[0]?.value || 0),
    eventos: Number(encontrosRes[0]?.value || 0),
    comunidade: Number(colabsRes[0]?.value || 0),
    empreendedoras: Number(empreendedorasRes[0]?.value || 0),
    livroDoMes: Number(livroDoMesRes[0]?.value || 0),
    escritoras: Number(escritorasRes[0]?.value || 0),
    resenhas: Number(resenhasRes[0]?.value || 0),
  };

  const cards = [
    { label: 'Livros do Mês', value: stats.livroDoMes, color: 'border-l-[#B04D4A]', icon: Book, href: '/admin/livro-do-mes', desc: 'Acervo curado' },
    { label: 'Eventos', value: stats.eventos, color: 'border-l-[#4F5E46]', icon: Calendar, href: '/admin/cronograma/eventos', desc: 'Cronograma ativo' },
    { label: 'Comunidade', value: stats.comunidade, color: 'border-l-[#967BB6]', icon: Users, href: '/admin/colaboradores', desc: 'Membros ativos' },
    { label: 'Empreendedoras', value: stats.empreendedoras, color: 'border-l-[#D4A373]', icon: Briefcase, href: '/admin/empreendedoras', desc: 'Feminino & Negócios' },
    { label: 'Escritoras', value: stats.escritoras, color: 'border-l-[#6B705C]', icon: PenTool, href: '/admin/escritoras', desc: 'Autoras catalogadas' },
    { label: 'Resenhas', value: stats.resenhas, color: 'border-l-[#A5A5A5]', icon: BookOpen, href: '/admin/livro-do-mes', desc: 'Registros literários' },
  ];

  return (
    <div className="min-h-screen p-6 md:p-12 font-alice bg-[#FDFCFB] text-[#1A1A1A]">
      <div className="p-6 md:p-12 font-alice bg-white text-[#1A1A1A]">
        <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-[#E5E1DA] pb-12">
          <div>
            <div className="flex items-center gap-3 mb-4 text-[#B04D4A]">
              <Coffee size={14} />
              <span className="text-[9px] font-mono font-bold uppercase tracking-[0.5em]">Painel Clube das Leitoras</span>
            </div>
            <h1 className="text-5xl md:text-7xl italic tracking-tighter leading-none text-[#1A1A1A] font-light">
              Olá, <span style={{ color: rosaGabi }} className="not-italic font-medium">Gabi.</span>
            </h1>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((c) => (
            <Link key={c.label} href={c.href} className="group">
              <div className={`h-full bg-white rounded-[2rem] p-8 border border-[#E5E1DA] border-l-4 ${c.color} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                    <p className="text-[9px] font-mono font-bold text-[#1A1A1A] uppercase tracking-[0.3em]">{c.label}</p>
                    <p className="text-[10px] italic text-[#B04D4A]">{c.desc}</p>
                  </div>
                  <c.icon size={18} className="text-[#B04D4A] group-hover:text-[#1A1A1A] transition-all" />
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-5xl font-light tracking-tighter text-[#1A1A1A]">{c.value}</span>
                  <ArrowRight size={14} style={{ color: rosaGabi }} className="opacity-0 group-hover:opacity-100 transition-all" />
                </div>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}