"use client";

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Lock, Sparkles, Loader2, Heart, BookOpen, ShieldCheck, Save
} from "lucide-react";
import { Button } from "@/components/ui/button";

function NovaSenhaForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (password !== confirmPassword) {
      setErro('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
        setLoading(false);
        
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF9] text-[#4A3F35] relative overflow-hidden font-alice selection:bg-[#F3E5E5] flex flex-col items-center justify-center">
      
      
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#F2D7D5]/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#E8D9C6]/20 rounded-full blur-[120px] pointer-events-none" />

      

      <main className="w-full max-w-md mx-auto px-6 relative z-10">
        <div className="bg-white/70 backdrop-blur-xl p-10 md:p-14 shadow-[0_30px_100px_-20px_rgba(217,181,178,0.3)] border border-white/50 rounded-[2.5rem] relative group">
          
          
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-[#D9B5B2] rounded-full shadow-lg flex items-center justify-center border-4 border-white z-20">
             <Lock className="text-white w-6 h-6" />
          </div>

          <div className="space-y-10 pt-4">
            <div className="text-center space-y-2">
              <h2 className="text-3xl italic text-[#3E362E] tracking-tight">Recomeçar Caminho</h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D9B5B2]">Defina sua nova senha</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              
              <div className="space-y-2 group">
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D9B5B2]/60" />
                  <input 
                    type="password" 
                    required
                    className="w-full bg-white/50 border border-[#D9B5B2]/20 rounded-2xl py-5 pl-14 pr-4 outline-none focus:ring-4 focus:ring-[#F2D7D5]/50 transition-all text-sm placeholder:opacity-40"
                    placeholder="Nova Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <div className="relative">
                  <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D9B5B2]/60" />
                  <input 
                    type="password" 
                    required
                    className="w-full bg-white/50 border border-[#D9B5B2]/20 rounded-2xl py-5 pl-14 pr-4 outline-none focus:ring-4 focus:ring-[#F2D7D5]/50 transition-all text-sm placeholder:opacity-40"
                    placeholder="Confirme a Senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {erro && (
                <div className="bg-rose-50/80 border border-rose-100 rounded-xl px-5 py-4 text-[11px] italic text-rose-500 animate-in fade-in zoom-in duration-300">
                  {erro}
                </div>
              )}

              <Button 
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl h-20 text-[11px] font-bold uppercase tracking-[0.5em] transition-all bg-[#3E362E] text-white hover:bg-[#D9B5B2] relative overflow-hidden group/btn"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span className="flex items-center gap-3 relative z-10">
                    Salvar Senha <Save className="w-4 h-4" />
                  </span>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
              </Button>
              
              {!token && (
                <p className="text-center text-[8px] text-rose-400 font-bold uppercase tracking-[0.2em]">
                  Token de segurança ausente ou expirado.
                </p>
              )}
            </form>
          </div>
        </div>

        
        <div className="mt-8 flex flex-col items-center gap-2 opacity-30">
          <div className="w-px h-8 bg-gradient-to-b from-[#D9B5B2] to-transparent" />
          <BookOpen className="w-4 h-4 text-[#D9B5B2]" />
          <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-[#3E362E]">Sua jornada continua</p>
        </div>
      </main>

      <footer className="absolute bottom-10 w-full text-center px-6">
        <p className="text-[9px] font-bold uppercase tracking-[0.8em] text-[#D9B5B2]/50">Brasília • 2026</p>
      </footer>

      <style jsx global>{`
        @keyframes shimmer { 100% { transform: translateX(100%); } }
        .animate-shimmer { animation: shimmer 2s infinite; }
      `}</style>
    </div>
  );
}

export default function NovaSenhaPage() {
  return (
    <Suspense fallback={
        <div className="min-h-screen bg-[#FDFBF9] flex items-center justify-center text-[#D9B5B2] italic text-[10px] tracking-[0.5em] font-alice">
          PREPARANDO AMBIENTE...
        </div>
    }>
      <NovaSenhaForm />
    </Suspense>
  );
}