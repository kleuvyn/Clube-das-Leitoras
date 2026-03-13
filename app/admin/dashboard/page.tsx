import { db } from '@/lib/db';
import { livros, encontros, colaboradoras, votacoes, livroDoMes, votacoesHistorico } from '@/lib/db/schema';
import React from 'react';
import Link from 'next/link';
import { count, desc, eq } from 'drizzle-orm';
import { Book, Users, Calendar, ArrowRight, Sparkles, Coffee, Trophy, Vote, CheckCircle2, Clock } from 'lucide-react';

const rosaGabi = "#B04D4A"; 
const azulPetroleo = "#2C3E50";

export default async function DashboardPage() {
  
  
  const [livrosRes, encontrosRes, colabsRes] = await Promise.all([
    db.select({ value: count() }).from(livros),
    db.select({ value: count() }).from(encontros),
    db.select({ value: count() }).from(colaboradoras),
  ]);

  // Votação atual: busca candidatos e seus votos
  const candidatos = await db.select().from(livros).where(eq(livros.tipo, 'candidato'));
  const todosVotos = await db.select().from(votacoes);
  const votosPorLivro = new Map<string, number>();
  todosVotos.forEach(v => votosPorLivro.set(v.livro_id, (votosPorLivro.get(v.livro_id) || 0) + 1));
  const candidatosComVotos = candidatos
    .map(l => ({ ...l, votos: votosPorLivro.get(l.id) || 0 }))
    .sort((a, b) => b.votos - a.votos);
  const totalVotosAtual = todosVotos.length;

  // Últimos 6 livros do mês
  const ultimosLivros = await db.select().from(livroDoMes).orderBy(desc(livroDoMes.updatedAt)).limit(6);

  // Histórico de votações
  const historico = await db.select().from(votacoesHistorico).orderBy(desc(votacoesHistorico.encerradoEm)).limit(4);

  const stats = {
    livros: Number(livrosRes[0]?.value || 0),
    encontros: Number(encontrosRes[0]?.value || 0),
    leitoras: Number(colabsRes[0]?.value || 0),
  };

  const cards = [
    { label: 'Obras do Mês', value: stats.livros, color: 'border-l-[#B04D4A]', icon: Book, href: '/admin/livro-do-mes' },
    { label: 'Rodas Digitais', value: stats.encontros, color: 'border-l-[#4F5E46]', icon: Calendar, href: '/admin/rodaonline' },
    { label: 'Comunidade', value: stats.leitoras, color: 'border-l-[#967BB6]', icon: Users, href: '/admin/colaboradores' },
  ];

  return (
    <div className="min-h-screen p-8 font-alice selection:bg-[#B04D4A10]" 
         style={{ background: '#FDFCFB url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}>
      
      <div className="max-w-6xl mx-auto animate-in fade-in duration-1000">
        
        
        <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-black/5 pb-10">
          <div>
            <div className="flex items-center gap-3 mb-4 opacity-40 text-[#2C3E50]">
              <Coffee size={16} />
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em]">Painel de Curadoria</span>
            </div>
            <h1 className="text-6xl italic text-[#2C3E50] tracking-tighter leading-tight">
              Olá, <span style={{ color: rosaGabi }} className="not-italic font-normal">Gabi!</span>
            </h1>
            <p className="text-[#8C7A66] mt-2 text-xl italic font-light opacity-60">Aqui está o pulso do Clube hoje.</p>
          </div>
          
          <div className="text-left md:text-right">
            <p className="text-[10px] font-mono font-bold text-[#2C3E50] opacity-30 uppercase tracking-[0.4em]">Brasília • Março 2026</p>
            <div className="flex items-center md:justify-end gap-2 mt-1 text-[#B04D4A]">
               <Sparkles size={14} className="animate-pulse" />
               <span className="text-xs font-bold italic">Temporada de Afeto</span>
            </div>
          </div>
        </header>

        
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((c) => (
            <Link key={c.label} href={c.href} className="group">
              <div className={`bg-white/50 backdrop-blur-sm rounded-[3rem] p-10 shadow-sm border border-black/5 border-l-8 ${c.color} hover:shadow-2xl hover:bg-white transition-all duration-500 hover:-translate-y-2 cursor-pointer`}>
                <div className="flex justify-between items-start mb-8">
                  <p className="text-[10px] font-mono font-bold text-[#2C3E50] opacity-30 uppercase tracking-[0.3em]">{c.label}</p>
                  <c.icon size={20} className="text-[#2C3E50] opacity-10 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-6xl font-light tracking-tighter text-[#2C3E50]">{c.value}</span>
                  <ArrowRight size={20} style={{ color: rosaGabi }} className="opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-3" />
                </div>
              </div>
            </Link>
          ))}
        </section>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          
          <section className="lg:col-span-2 space-y-8">
            <h2 className="text-[10px] font-mono font-bold uppercase tracking-[0.5em] text-[#2C3E50] opacity-20 ml-4">Ações Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/admin/livro-do-mes">
                <button className="w-full h-20 flex items-center justify-center text-white rounded-[2rem] font-bold uppercase text-[10px] tracking-[0.4em] shadow-xl hover:brightness-110 transition-all active:scale-95"
                        style={{ backgroundColor: rosaGabi }}>
                  + Nova Obra do Mês
                </button>
              </Link>
              <Link href="/admin/rodaonline">
                <button className="w-full h-20 flex items-center justify-center bg-white border border-black/10 text-[#2C3E50] rounded-[2rem] font-bold uppercase text-[10px] tracking-[0.4em] hover:bg-black/5 transition-all active:scale-95">
                  Agendar Próxima Roda
                </button>
              </Link>
            </div>

            {/* Gráfico de Votação Atual */}
            <div className="bg-white/60 rounded-[3rem] p-8 border border-black/5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${rosaGabi}15` }}>
                    <Vote size={14} style={{ color: rosaGabi }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-[#2C3E50] opacity-40">Urna Literária</p>
                    <p className="text-xs italic text-[#8C7A66] opacity-60">{totalVotosAtual} voto{totalVotosAtual !== 1 ? 's' : ''} registrados</p>
                  </div>
                </div>
                <Link href="/admin/votacao" className="text-[9px] font-mono font-bold uppercase tracking-widest opacity-30 hover:opacity-70 transition-opacity flex items-center gap-1" style={{ color: rosaGabi }}>
                  Gerenciar <ArrowRight size={10}/>
                </Link>
              </div>

              {candidatosComVotos.length === 0 ? (
                <p className="text-center italic text-sm text-[#8C7A66] opacity-40 py-8">Nenhum livro candidato ainda.</p>
              ) : (
                <div className="space-y-3">
                  {candidatosComVotos.map((livro, idx) => {
                    const pct = totalVotosAtual > 0 ? Math.round((livro.votos / totalVotosAtual) * 100) : 0;
                    return (
                      <div key={livro.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            {idx === 0 && totalVotosAtual > 0 && <Trophy size={11} style={{ color: rosaGabi }} className="shrink-0"/>}
                            <span className="text-sm italic text-[#2C3E50] truncate">{livro.titulo}</span>
                            <span className="text-[10px] text-[#8C7A66] opacity-50 shrink-0 hidden md:block">— {livro.autor}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            <span className="text-xs font-bold" style={{ color: idx === 0 && totalVotosAtual > 0 ? rosaGabi : '#8C7A66' }}>{pct}%</span>
                            <span className="text-[10px] opacity-30 text-[#2C3E50]">{livro.votos}v</span>
                          </div>
                        </div>
                        <div className="h-2 w-full rounded-full bg-black/5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: idx === 0 ? rosaGabi : `${rosaGabi}60`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Histórico de Votações */}
            {historico.length > 0 && (
              <div className="bg-white/60 rounded-[3rem] p-8 border border-black/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#4F5E4615]">
                    <Trophy size={14} className="text-[#4F5E46]"/>
                  </div>
                  <p className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-[#2C3E50] opacity-40">Vencedoras Anteriores</p>
                </div>
                <div className="space-y-3">
                  {historico.map(h => (
                    <div key={h.id} className="flex items-center gap-4">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: rosaGabi, opacity: 0.4 }}/>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm italic text-[#2C3E50] truncate block">{h.vencedorTitulo}</span>
                        <span className="text-[10px] text-[#8C7A66] opacity-40">{h.periodo} · {h.porcentagem}% dos votos</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Últimos Livros do Mês */}
          <section className="rounded-[3rem] p-8 h-fit relative overflow-hidden border border-black/5"
                   style={{ background: '#FAF8F5' }}>
            <div className="absolute -top-8 -right-8 opacity-[0.04] rotate-12 text-[#B04D4A]">
               <Book size={180} />
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${rosaGabi}15` }}>
                <Book size={14} style={{ color: rosaGabi }}/>
              </div>
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-[#2C3E50] opacity-40">Estante do Clube</p>
                <p className="text-[9px] italic text-[#8C7A66] opacity-50">últimas obras selecionadas</p>
              </div>
            </div>

            {ultimosLivros.length === 0 ? (
              <p className="italic text-sm text-[#8C7A66] opacity-40 py-6 text-center">Nenhum livro do mês cadastrado ainda.</p>
            ) : (
              <div className="space-y-4">
                {ultimosLivros.map((l, idx) => (
                  <div key={l.id} className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      {l.confirmado ? (
                        <CheckCircle2 size={14} style={{ color: '#4F8C6A' }} className="opacity-70"/>
                      ) : (
                        <Clock size={14} className="text-[#8C7A66] opacity-30"/>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm italic text-[#2C3E50] truncate leading-snug">{l.livro}</p>
                      <p className="text-[10px] text-[#8C7A66] opacity-50 truncate">{l.autora} · {l.mes}{l.ano ? `/${l.ano}` : ''}</p>
                    </div>
                    {idx === 0 && (
                      <span className="shrink-0 text-[8px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ backgroundColor: `${rosaGabi}15`, color: rosaGabi }}>
                        atual
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <Link href="/admin/livro-do-mes" className="mt-6 flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-widest opacity-25 hover:opacity-60 transition-opacity" style={{ color: rosaGabi }}>
              Ver todos <ArrowRight size={9}/>
            </Link>
          </section>

        </div>
      </div>
      
      <footer className="mt-32 text-center opacity-20 py-10">
         <p className="text-[9px] font-mono font-bold uppercase tracking-[1em] text-[#2C3E50]">Editoria Central • Controle de Voo • 2026</p>
      </footer>
    </div>
  );
}