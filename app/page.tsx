"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  MapPin, Instagram, ArrowRight, BookOpen, ArrowUpRight, Quote, MessageCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";

interface LivroAtual {
  titulo: string;
  autor: string;
  mes: string;
  capa: string;
  descricao_curta: string;
}

const ANO_FUNDACAO = 2025;
const ROMANOS = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV'];

export default function HomeJornalClubeLeitoras() {
  const [indiceAtivo, setIndiceAtivo] = useState(0);
  const [livroDoMes, setLivroDoMes] = useState<LivroAtual | null>(null);
  const [loading, setLoading] = useState(true);
  const [curadoriaMemoria, setCuradoriaMemoria] = useState<{ mes: string; livro: string; autor: string }[]>([]);

  const anoAtual = new Date().getFullYear();
  const anoRomano = ROMANOS[anoAtual - ANO_FUNDACAO] ?? `${anoAtual - ANO_FUNDACAO + 1}`;

  const fotosEncontros = ["/0.jpeg", "/1.jpeg", "/2.jpeg", "/3.jpeg", "/3.1.jpeg", "/4.jpeg", "/5.jpeg", "/6.jpeg", "/7.jpeg", "/8.jpeg", "/9.jpeg", "/10.jpeg", "/11.jpeg"];

  const anoCuradoria = anoAtual - 1;

  useEffect(() => {
    async function buscarMemoria() {
      try {
        const res = await fetch(`/api/livro-do-mes?ano=${anoAtual - 1}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCuradoriaMemoria(data.map((l: any) => ({
            mes: l.mes || '',
            livro: l.livro || '',
            autor: l.autora || '',
          })));
        }
      } catch (err) {
        console.error("Erro ao carregar memória:", err);
      }
    }
    buscarMemoria();
  }, []);

  const MESES_PT = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  useEffect(() => {
    async function buscarLivroAtual() {
      try {
        const res = await fetch(`/api/livro-do-mes?ano=${new Date().getFullYear()}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mesAtual = new Date().getMonth() + 1;
          const mesAtualNome = MESES_PT[mesAtual - 1];

          // Prioriza o livro cujo número do mês corresponde ao mês atual.
          // Se não houver, tenta casar pelo nome do mês. Se ainda não, pega o primeiro registrado.
          const match = data.find((item: any) => {
            const num = typeof item.num === 'number' ? item.num : Number(item.num);
            const mes = String(item.mes || '').toLowerCase();
            return num === mesAtual || mes === mesAtualNome.toLowerCase();
          }) ?? data[0];

          setLivroDoMes({
            titulo: match.livro || '',
            autor: match.autora || '',
            mes: match.mes || '',
            capa: match.foto || '',
            descricao_curta: match.sinopse || '',
          });
        }
      } catch (err) {
        console.error("Erro ao carregar livro:", err);
      } finally {
        setLoading(false);
      }
    }
    buscarLivroAtual();

    const intervalo = setInterval(() => {
      setIndiceAtivo((prev) => (prev + 1) % fotosEncontros.length);
    }, 4500);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="min-h-screen font-alice pb-20 pt-32 lg:pt-40 relative overflow-hidden"
         style={{ background: `#FDFCFB url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')` }}>
      
      {/* HEADER */}
      <header className="max-w-7xl mx-auto px-6 md:px-12 pb-12 mb-16 relative z-10 border-b-4 border-[#B04D4A]">
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.4em] mb-8 opacity-60 text-black">
          <span>Brasília • DF</span>
          <span className="hidden md:block">Informativo Mensal de Afeto</span>
          <span>Ano {anoRomano} • {anoAtual}</span>
        </div>
        
        <h1 className="text-center text-6xl md:text-[110px] leading-none tracking-tighter mb-12">
          <span className="text-[#2C3E50]">Clube das</span> <br className="md:hidden" />
          <span className="italic font-light text-[#B04D4A]"> Leitoras</span>
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto pt-8 border-t border-black/10">
          <div className="relative">
            <Quote className="absolute -left-6 -top-2 w-8 h-8 opacity-20 text-[#B04D4A]" />
            <p className="italic text-sm md:text-base leading-relaxed pl-4 text-black">
              "Um clube que nasceu do desejo de não ler sozinha. Aqui, a última página é apenas o convite para um café e uma boa conversa."
            </p>
          </div>
          <div className="flex flex-col justify-end">
            <p className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-sans font-bold opacity-70 text-black">
              Desde 2025, transformando leituras solitárias em laços reais. Um espaço para quem busca refúgio nas palavras e conexão em Brasília.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-12 space-y-24 relative z-10">
        
        {/* SEÇÃO 1: LIVRO DO MÊS */}
        <section className="pb-20 group border-b-2 border-black/5">
          {!loading && livroDoMes && livroDoMes.titulo ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
               <div className="aspect-3/4 relative shadow-2xl overflow-hidden rounded-sm mx-auto w-full max-w-sm border-2 border-black/5">
                  <Image 
                    src={livroDoMes.capa || "/baixoparaiso.png"} 
                    alt={livroDoMes.titulo} 
                    fill 
                    className="object-cover" 
                  />
               </div>
               <div className="space-y-8">
                  <span className="font-bold text-[10px] uppercase tracking-[0.4em] px-4 py-1.5 border border-[#B04D4A] rounded-full inline-block text-[#B04D4A]">
                      Leitura em Foco • {livroDoMes.mes}
                  </span>
                  
                  <h2 className="text-7xl md:text-9xl tracking-tighter leading-none">
                      <span className="text-[#2C3E50]">{livroDoMes.titulo?.split(' ')[0]}</span> <br/>
                      <span className="italic font-light text-[#B04D4A]">
                        {livroDoMes.titulo?.split(' ').slice(1).join(' ')}
                      </span>
                  </h2>
                  
                  <p className="text-2xl italic leading-relaxed opacity-70 text-black">
                    De {livroDoMes.autor}. {livroDoMes.descricao_curta}
                  </p>
                  <a href="/livro-do-mes" className="flex items-center gap-6 font-bold text-xs uppercase tracking-widest text-[#B04D4A] hover:gap-8 transition-all">
                    Guia de Leitura <ArrowRight />
                  </a>
               </div>
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center italic opacity-20 text-black">
              {loading ? "Sintonizando a próxima história..." : "Aguardando o livro do mês..."}
            </div>
          )}
        </section>

        {/* SEÇÃO 2: MANIFESTO COMPLETO */}
        <div className="relative overflow-hidden">
          <aside className="hidden lg:block float-right w-80 ml-10 mb-8 space-y-6">
            <div className="relative bg-white p-4 pb-12 shadow-xl rotate-1 border border-black/5">
              <div className="aspect-4/5 overflow-hidden relative bg-slate-50">
                  {fotosEncontros.map((url, index) => (
                    <img key={url} src={url} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === indiceAtivo ? 'opacity-100' : 'opacity-0'}`} alt="Encontro" />
                  ))}
               </div>
              <p className="mt-6 text-center italic text-lg text-[#B04D4A]">Nossa história em fotos.</p>
            </div>
            <a href="https://instagram.com/elaeasviagens" target="_blank" rel="noopener noreferrer" className="block w-full">
              <Button className="w-full rounded-full text-white py-8 h-auto text-[10px] font-bold uppercase tracking-[0.4em] bg-[#B04D4A] hover:bg-[#B04D4A]/90 transition-all shadow-lg">
                Quero Participar <ArrowUpRight className="ml-2 w-4 h-4" />
              </Button>
            </a>
          </aside>

          <article className="space-y-8 text-justify">
            <h3 className="text-[10px] font-bold uppercase tracking-widest inline-block px-3 py-1 bg-[#B04D4A]/10 text-[#B04D4A]">Manifesto</h3>
            <h2 className="text-5xl md:text-6xl leading-[0.9] tracking-tighter mb-8 text-[#2C3E50]">
              Onde a última página é o <span className="italic text-[#B04D4A]">começo.</span>
            </h2>
            
            <div className="text-lg md:text-xl leading-relaxed space-y-6 text-black">
              <p className="first-letter:text-7xl first-letter:font-bold first-letter:mr-3 first-letter:float-left first-letter:leading-none text-[#B04D4A]">
                O Clube nasceu de um gesto simples: terminar um livro e perceber que o silêncio não bastava.
              </p>
              
              <p>Fechar a última página e seguir sozinha já não fazia sentido. Porque um livro não termina quando acaba — ele começa quando é partilhado.</p>
              
              <p>Foi assim que tudo começou. No dia 1º de janeiro de 2025, com a vontade de dividir leituras, ideias e inquietações. Comecei falando de livros nos stories, quase como quem lança perguntas ao vento.</p>

              <p>E o vento respondeu. Vieram mensagens, convites, incentivos:</p>

              {/* CAIXINHA DE COMENTÁRIO */}
              <div className="relative my-10 max-w-sm">
                <div className="bg-white border-2 border-[#B04D4A]/20 p-6 rounded-2xl rounded-bl-none shadow-sm italic text-[#B04D4A] font-bold text-2xl relative z-10 flex items-start gap-3">
                  <MessageCircle className="w-6 h-6 mt-1 opacity-40 shrink-0" />
                  “Cria um clube, Gabi.”
                </div>
                <div className="absolute -bottom-4 left-0 w-8 h-8 bg-white border-l-2 border-b-2 border-[#B04D4A]/20 transform -skew-x-45 z-0"></div>
              </div>

              <p>Mas um clube não nasce pronto. Ele precisa ser imaginado, sonhado, pensado. Foram cinco meses refletindo sobre como seria esse espaço. E quando finalmente nasceu, nasceu do jeito mais bonito possível: organicamente.</p>

              <p>Mês após mês, fomos construindo algo maior do que a soma das páginas que lemos. Houve partilhas. Risadas. Histórias que nos acolheram. Outras que nos inquietaram. Criamos rodas temáticas, rodas de conversa simples, com objetivos igualmente simples — resgatar a leitura e criar laços.</p>

              <div className="py-8 my-12 border-y border-black/10 italic text-2xl md:text-3xl text-[#2C3E50] text-center px-4 leading-snug">
                “Porque existe uma pergunta silenciosa na vida adulta: <br className="hidden md:block"/> como fazer novas amizades?”
              </div>

              <p>Não é tão fácil quanto chegar numa cafeteria e perguntar: “Quer ser minha amiga?”. As amizades surgem de encontros improváveis, de interesses comuns, de caminhos que se cruzam. E os livros têm um poder raro: eles criam esses caminhos.</p>

              <p className="font-medium text-[#2C3E50]">Cada leitura abre uma conversa. Cada conversa abre uma conexão. Cada conexão abre um vínculo.</p>

              <p>Em 2025, aprendemos algo essencial: unir é sempre melhor do que caminhar só. Agora seguimos para 2026, o segundo ano deste clube. Um novo ciclo.</p>

              <p>Mais leituras. Mais encontros. Mais pensamentos. Alguns livros irão nos acolher. Outros irão nos desafiar. Como sempre acontece com as histórias que realmente importam.</p>

              <p>Mas cada página virada traz algo que cresce dentro de nós:</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] uppercase font-bold tracking-widest text-[#B04D4A] py-6 border-b border-black/5">
                <div className="flex items-center gap-2"><ArrowRight size={12}/> Senso Crítico</div>
                <div className="flex items-center gap-2"><ArrowRight size={12}/> Conexões</div>
                <div className="flex items-center gap-2"><ArrowRight size={12}/> Imaginação</div>
                <div className="flex items-center gap-2"><ArrowRight size={12}/> Consciência</div>
              </div>

              <p className="pt-6">Porque quem lê não apenas acumula histórias — expande a forma de ver o mundo.</p>

              <p className="font-bold italic text-2xl md:text-3xl mt-10 pt-8 border-t border-black/10 text-[#B04D4A]">
                Então pode vir, 2026. O livro deste mês já está escolhido. Novas parcerias estão chegando. E novas histórias também.
              </p>
            </div>
          </article>
        </div>

        {/* SEÇÃO 3: BIBLIOTECA & CURADORIA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 border-t border-black/10 pt-24">
            <div className="lg:col-span-5 space-y-8">
              <div className="flex items-center gap-3 border-b border-black/10 pb-2">
                <MapPin size={16} className="text-[#B04D4A]" />
                <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-60 text-black">Local dos Encontros</h4>
              </div>
              <div className="space-y-4">
                <div className="relative h-64 grayscale hover:grayscale-0 transition-all shadow-md rounded-sm overflow-hidden border border-black/10">
                  <Image src="/biblioteca-nacional-de.jpg" alt="BNB" fill className="object-cover" />
                </div>
                <h5 className="text-3xl italic text-black">Biblioteca Nacional de Brasília</h5>
                <p className="text-sm opacity-60 text-black">Nosso refúgio oficial onde as conversas ganham vida.</p>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-8">
              <div className="flex items-center gap-3 border-b border-black/10 pb-2">
                <BookOpen size={16} className="text-[#B04D4A]" />
                <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-60 text-black">Memória {anoAtual - 1}</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {curadoriaMemoria.length > 0 ? curadoriaMemoria.map((item, idx) => (
                  <div key={idx} className="group pb-3 border-b border-black/5">
                    <span className="text-[9px] font-bold uppercase text-[#B04D4A]">{item.mes}</span>
                    <p className="text-base md:text-lg leading-tight group-hover:italic transition-all text-black">{item.livro}</p>
                    <p className="text-[10px] uppercase opacity-40 text-black font-bold">{item.autor}</p>
                  </div>
                )) : (
                  <p className="text-sm italic opacity-40 text-black col-span-2">Os livros de {anoAtual - 1} ainda serão registrados aqui.</p>
                )}
              </div>
            </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto mt-32 px-6 md:px-12 py-10 border-t-4 border-[#B04D4A] flex flex-col md:flex-row justify-between items-center gap-8">
          <a href="https://instagram.com/elaeasviagens" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-[#B04D4A] hover:opacity-70 transition-opacity">
            <Instagram size={24} />
            <h4 className="text-2xl italic">@elaeasviagens</h4>
          </a>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40 italic text-black">A roda continua aberta.</p>
      </footer>
    </div>
  );
}