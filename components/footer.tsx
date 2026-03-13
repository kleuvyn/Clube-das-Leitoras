"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Instagram, MapPin, Sparkles, Star, ArrowUpRight, Mail, Coffee } from "lucide-react";

const rosaGabi = "#B04A5A";
const pretoJornal = "#000000";
const cinzaSeda = "#F4F1EE";

const ANO_FUNDACAO = 2025;
const ROMANOS = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV'];

export function Footer() {
  const anoAtual = new Date().getFullYear();
  const anoRomano = ROMANOS[anoAtual - ANO_FUNDACAO] ?? `${anoAtual - ANO_FUNDACAO + 1}`;

  return (
    <footer className="py-24 relative overflow-hidden font-alice bg-[#F4F1EE] border-t border-black/10">
      
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-12">
          
          
          <div className="md:col-span-1 space-y-6">
            <div className="flex items-center space-x-4 group">
               <div className="relative w-16 h-16">
                  <Image
                    src="/logo-clube-leitoras.png" 
                    alt="Logo Clube das Leitoras"
                    fill
                    className="object-contain drop-shadow-sm group-hover:rotate-12 transition-transform duration-500"
                  />
               </div>
               <div className="flex flex-col">
                 <span className="text-2xl leading-none text-black">
                    Clube das <span className="italic" style={{ color: rosaGabi }}>Leitoras</span>
                 </span>
               </div>
            </div>
            <p className="text-sm italic leading-relaxed max-w-xs text-black/60">
              "Uma comunidade feminina em Brasília, ocupando espaços e cafés com o poder das páginas."
            </p>
          </div>

          
          <div className="md:col-span-1">
            <h3 className="font-bold text-[10px] uppercase tracking-[0.3em] mb-8 flex items-center gap-2 text-black/40">
              <MapPin className="w-3 h-3" style={{ color: rosaGabi }} /> Nossa Sede
            </h3>
            <div className="text-sm space-y-2 font-medium italic text-black/70">
              <p className="not-italic font-bold text-black">Biblioteca Nacional de Brasília</p>
              <p>Setor Cultural Sul, Lote 2</p>
              <p>Brasília - DF</p>
            </div>
          </div>

          
          <div className="md:col-span-1">
            <h3 className="font-bold text-[10px] uppercase tracking-[0.3em] mb-8 text-black/40">Explorar</h3>
            <div className="flex flex-col space-y-3">
              <Link href="/livro-do-mes" className="text-sm hover:translate-x-1 transition-all flex items-center group font-medium italic text-black">
                Livros do Mês <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 ml-1 transition-all" />
              </Link>
              <Link href="/dicas" className="text-sm hover:translate-x-1 transition-all font-medium italic text-black">
                Dicas da Gabi
              </Link>
              <Link href="/parcerias" className="text-sm hover:translate-x-1 transition-all font-medium italic text-black">
                Nossas Parcerias
              </Link>
              <Link href="/empreendedoras" className="text-sm font-bold hover:opacity-70 transition-all flex items-center gap-2 uppercase tracking-widest text-[10px] pt-2" style={{ color: rosaGabi }}>
                <Sparkles className="w-3 h-3" /> Empreendedoras
              </Link>
            </div>
          </div>

          
          <div className="md:col-span-1">
            <h3 className="font-bold text-[10px] uppercase tracking-[0.3em] mb-8 text-black/40">Social Club</h3>
            <div className="flex space-x-3 mb-8">
              <a href="https://instagram.com/elaeasviagens" target="_blank" className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-sm border border-black/5" style={{ color: rosaGabi }}>
                <Instagram className="h-5 w-5" />
              </a>
              <a href="mailto:clubedasleitorasbsb@gmail.com" className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-sm border border-black/5" style={{ color: rosaGabi }}>
                <Mail className="h-5 w-5" />
              </a>
            </div>
            <div className="flex items-center gap-2">
               <Coffee size={12} style={{ color: rosaGabi }} />
               <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">
                 Brasília, {anoAtual} • Ano {anoRomano}
               </p>
            </div>
          </div>
        </div>

        
        <div className="mt-20 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-black/10">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-3 text-black/30">
            © {anoAtual} Clube das Leitoras <Star className="w-3 h-3" style={{ color: rosaGabi }} /> Brasília • DF
          </p>
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em] text-black/30">
            Feito com <Heart className="h-3 w-3 mx-1" style={{ color: rosaGabi, fill: rosaGabi }} /> para leitoras apaixonadas
          </div>
        </div>
      </div>
    </footer>
  );
}