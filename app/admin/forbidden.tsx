"use client";

import React from 'react';
import Image from 'next/image';
import { ShieldAlert, ArrowLeft, Mail, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminForbidden() {
  return (
    <div className="min-h-screen bg-[#FDFBF9] text-[#4A3F35] relative overflow-hidden font-alice flex flex-col items-center justify-center px-6">
      
      
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#F2D7D5]/20 rounded-full blur-[120px] pointer-events-none" />
      
      

      <main className="max-w-md w-full relative z-10 text-center space-y-8">
        <div className="bg-white/60 backdrop-blur-xl p-12 rounded-[3rem] border border-[#D9B5B2]/20 shadow-[0_20px_50px_-10px_rgba(217,181,178,0.2)]">
          
          
          <div className="w-16 h-16 bg-[#F7F2F1] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#D9B5B2]/30">
            <ShieldAlert className="text-[#D9B5B2] w-7 h-7" />
          </div>

          <h1 className="text-5xl italic text-[#3E362E] mb-4 tracking-tighter">Capítulo Restrito</h1>
          
          <div className="space-y-4 mb-10">
            <p className="text-sm text-[#8C7A66] leading-relaxed italic">
              "Nem todas as páginas estão prontas para serem lidas por todos os olhos."
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D9B5B2]">
              Seu perfil não possui permissão para esta ala.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full bg-[#3E362E] text-white h-14 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#D9B5B2] transition-all"
            >
              <ArrowLeft className="mr-2 w-4 h-4" /> Voltar ao Início
            </Button>
            
            <a href="mailto:clubedasleitorasbsb@gmail.com" className="group p-4 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-[#8C7A66] hover:text-[#D9B5B2] transition-colors">
              <Mail size={14} /> Solicitar Acesso à Curadora
            </a>
          </div>
        </div>

        
        <div className="flex flex-col items-center gap-4 opacity-40">
            <div className="w-px h-10 bg-gradient-to-b from-[#D9B5B2] to-transparent" />
            <Heart className="w-4 h-4 text-[#D9B5B2] fill-current" />
        </div>
      </main>

      <footer className="absolute bottom-10 text-[8px] font-bold uppercase tracking-[0.5em] text-[#D9B5B2]/60">
        Clube de Leitoras de Brasília • 403 Protocol
      </footer>
    </div>
  );
}