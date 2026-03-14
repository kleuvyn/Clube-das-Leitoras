"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Heart, Sparkles, Loader2, Coffee, BookOpen, PenTool, Music, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

const rosaGabi = "#B04D4A"; 
const rosaRetro = "#C08081"; 
const marromPapel = "#8C7A66"; 
const begeCafe = "#F4ECE2"; 

export default function LoginCafeFuncional() {
  const router = useRouter();
  
  
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    
    if (!aceitouTermos) {
      setErro('Por favor, aceite florescer conosco para entrar.');
      return;
    }

    setCarregando(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: senha }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Credenciais incorretas.');
      }

      const role = data?.user?.role;
      if (data?.user?.mustChangePassword) {
        window.location.href = '/nova-senha';
      } else if (role === 'admin' || role === 'colaboradora') {
        window.location.href = '/admin';
      } else if (role === 'convidada' || !role) {
        window.location.href = '/cronograma';
      } else {
        throw new Error('Acesso não autorizado.');
      }

    } catch (err: any) {
      setErro(err.message ?? 'Credenciais incorretas ou acesso não permitido.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4ECE2] font-alice flex items-center justify-center p-6 relative overflow-hidden selection:bg-[#B04D4A20]">
      
      
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />

      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center relative z-10">
        
        
        <div className="space-y-12 text-center lg:text-left p-8">
          <header className="space-y-6">
            <div className="flex items-center justify-center lg:justify-start gap-4 opacity-40">
              <Coffee size={18} style={{ color: marromPapel }} />
              <div className="h-[1px] w-12 bg-[#8C7A66]" />
              <span className="text-[12px] font-mono font-bold uppercase tracking-[0.5em] text-[#8C7A66]">Sintonize o Afeto</span>
            </div>
            
            <h1 className="text-7xl md:text-[100px] text-[#2C3E50] tracking-tighter leading-[0.8] drop-shadow-sm">
              Pausa para <br/> 
              <span style={{ color: rosaGabi }} className="italic font-light">o Amanhã</span>
            </h1>
          </header>

          <div className="space-y-8 max-w-md mx-auto lg:mx-0">
            <p className="text-2xl md:text-3xl font-light italic text-[#8C7A66] leading-relaxed">
              "Um lugar onde o café não esfria e as histórias nunca terminam."
            </p>
            
            <div className="flex justify-center lg:justify-start gap-8 opacity-40 text-[#8C7A66]">
                <div className="flex flex-col items-center gap-2 hover:scale-110 transition-transform">
                  <BookOpen size={20} />
                  <span className="text-[8px] font-mono uppercase tracking-widest font-bold">Leituras</span>
                </div>
                <div className="flex flex-col items-center gap-2 hover:scale-110 transition-transform">
                  <Music size={20} />
                  <span className="text-[8px] font-mono uppercase tracking-widest font-bold">Encontros</span>
                </div>
                <div className="flex flex-col items-center gap-2 hover:scale-110 transition-transform">
                  <PenTool size={20} />
                  <span className="text-[8px] font-mono uppercase tracking-widest font-bold">Memórias</span>
                </div>
            </div>
          </div>
        </div>

        
        <main className="w-full max-w-md mx-auto">
          <div className="bg-[#FDFBF9] p-10 md:p-14 rounded-[4rem] relative border border-black/5 group transition-all duration-700">
            
            
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center border-[6px] border-[#FDFBF9] z-20 group-hover:rotate-12 transition-all duration-700" 
                 style={{ background: rosaGabi }}>
               <Heart className="text-white fill-current w-6 h-6" />
            </div>

            <div className="space-y-10 pt-4">
              <div className="text-center space-y-3">
                <h2 className="text-3xl text-[#2C3E50] italic font-light tracking-tight">Seja bem-vinda</h2>
                <div className="h-[1px] w-12 bg-[#B04D4A] mx-auto opacity-20" />
                <p className="text-[9px] font-mono font-bold uppercase tracking-[0.4em] text-[#8C7A66]/60">A Próxima Página espera</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-8">
                <div className="space-y-1">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-[#F4ECE2]/40 border-b border-black/5 rounded-t-3xl py-6 px-8 outline-none text-sm italic text-[#2C3E50] focus:border-[#B04D4A] transition-all placeholder:text-[#8C7A66]/30"
                    placeholder="Seu e-mail de leitora"
                  />
                  <input 
                    type="password" 
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    className="w-full bg-[#F4ECE2]/40 border-b border-black/5 rounded-b-3xl py-6 px-8 outline-none text-sm text-[#2C3E50] focus:border-[#B04D4A] transition-all placeholder:text-[#8C7A66]/30"
                    placeholder="Sua senha secreta"
                  />
                </div>

                {erro && (
                  <p className="text-[10px] text-center italic text-[#B04D4A] animate-pulse">
                    {erro}
                  </p>
                )}

                
                <div 
                  onClick={() => setAceitouTermos(!aceitouTermos)}
                  className="flex items-center gap-4 cursor-pointer group px-2"
                >
                  <div className={`w-6 h-6 rounded-full border border-black/10 flex items-center justify-center transition-all duration-500 ${aceitouTermos ? 'scale-110 shadow-lg' : ''}`} 
                       style={{ background: aceitouTermos ? rosaGabi : 'transparent' }}>
                    {aceitouTermos && <Sparkles className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-50 text-[#8C7A66] select-none italic group-hover:opacity-100 transition-opacity">
                    Aceito florescer nesta roda
                  </span>
                </div>

                <Button 
                  type="submit"
                  disabled={carregando}
                  className="w-full rounded-[2.5rem] h-24 text-[10px] font-mono font-bold uppercase tracking-[0.4em] transition-all shadow-2xl text-white hover:brightness-110 active:scale-95 disabled:opacity-50"
                  style={{ backgroundColor: rosaGabi }}
                >
                  {carregando ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-3">
                      Abrir a Próxima Página <ArrowRight size={14} />
                    </span>
                  )}
                </Button>
                
                <p className="text-center text-[8px] font-mono uppercase tracking-[0.5em] opacity-30 text-[#8C7A66]">
                  Brasília • Curadoria de Afeto
                </p>
              </form>
            </div>
          </div>
          
          <div className="mt-12 flex flex-col items-center gap-3 opacity-20">
             <div className="h-px w-12 bg-[#8C7A66]" />
             <p className="text-[8px] font-mono font-bold uppercase tracking-[0.8em] text-[#8C7A66]">Espaço Protegido</p>
          </div>
        </main>
      </div>
    </div>
  );
}