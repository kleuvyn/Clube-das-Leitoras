"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Heart, Sparkles, Loader2, Coffee, BookOpen, PenTool, Music, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

const rosaGabi = "#B04D4A"; 
const marromPapel = "#8C7A66"; 
const papelCor = "#FDFCFB";

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
        body: JSON.stringify({ email, password: senha, consentimento: aceitouTermos ? true : false, consentimentoVersao: '1.0', consentimentoFinalidade: 'Acesso e uso de serviços do Clube das Leitoras'}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Credenciais incorretas.');

      const role = data?.user?.role;
      if (data?.user?.mustChangePassword) window.location.href = '/nova-senha';
      else if (role === 'admin' || role === 'colaboradora') window.location.href = '/admin';
      else window.location.href = '/cronograma';
    } catch (err: any) {
      setErro(err.message ?? 'Credenciais incorretas.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4ECE2] font-serif flex items-center justify-center p-4 md:p-10 relative overflow-hidden selection:bg-[#B04D4A20]">
      
      {/* Textura de Fundo Sutil */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />

      <div className="max-w-6xl w-full mx-auto grid lg:grid-cols-[minmax(0,1fr)_minmax(24rem,30rem)] lg:gap-16 xl:gap-24 items-center justify-items-center relative z-10">
        {/* LADO ESQUERDO: TEXTOS E ÍCONES ANIMADOS */}
        <div className="space-y-12 text-center lg:text-left p-4 md:p-8 w-full max-w-xl lg:justify-self-end">
          <header className="space-y-6">
            <div className="flex items-center justify-center lg:justify-start gap-4 opacity-40">
              <Coffee size={18} style={{ color: marromPapel }} className="animate-bounce" />
              <div className="h-[1px] w-12 bg-[#8C7A66]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#8C7A66]">Sintonize o Afeto</span>
            </div>
            
            <h1 className="text-6xl md:text-[90px] text-[#2C3E50] tracking-tighter leading-[0.8] drop-shadow-sm">
              Pausa para <br/> 
              <span style={{ color: rosaGabi }} className="italic font-light">o Amanhã</span>
            </h1>
          </header>

          <div className="space-y-10 max-w-md mx-auto lg:mx-0">
            <p className="text-2xl md:text-3xl font-light italic text-[#8C7A66] leading-relaxed">
              "Um lugar onde o café não esfria e as histórias nunca terminam."
            </p>
            
            {/* Ícones com Efeito Hover Mágico */}
            <div className="flex justify-center lg:justify-start gap-10 text-[#8C7A66]">
                {[
                  { icon: BookOpen, label: 'Leituras' },
                  { icon: Music, label: 'Encontros' },
                  { icon: PenTool, label: 'Memórias' }
                ].map((item, idx) => (
                  <div key={idx} className="group/icon flex flex-col items-center gap-3 cursor-default">
                    <div className="relative">
                      <item.icon size={22} className="opacity-40 group-hover/icon:opacity-100 group-hover/icon:-translate-y-2 group-hover/icon:scale-125 transition-all duration-500 ease-out" />
                      <Sparkles size={10} className="absolute -top-2 -right-2 opacity-0 group-hover/icon:opacity-100 group-hover/icon:animate-pulse transition-opacity" style={{ color: rosaGabi }} />
                    </div>
                    <span className="text-[8px] font-bold uppercase tracking-widest opacity-30 group-hover/icon:opacity-100 transition-opacity">
                      {item.label}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* LADO DIREITO: CARD DE LOGIN (O ENVELOPE) */}
        <main className="w-full max-w-md mx-auto lg:justify-self-start">
          <div className="bg-[#FDFBF9]/90 backdrop-blur-sm p-8 md:p-14 rounded-[4rem] relative border border-black/5 group transition-all duration-700 hover:shadow-[0_30px_60px_rgba(0,0,0,0.1)]">
            
            {/* O Coração que Gira e Pulsa no Hover do Card */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center border-[6px] border-[#FDFBF9] z-20 
                            group-hover:rotate-[360deg] group-hover:scale-110 transition-all duration-1000 ease-in-out" 
                 style={{ background: rosaGabi }}>
               <Heart className="text-white fill-current w-6 h-6 animate-pulse" />
            </div>

            <div className="space-y-10 pt-4">
              <div className="text-center space-y-3">
                <h2 className="text-3xl text-[#2C3E50] italic font-light tracking-tight">Seja bem-vinda</h2>
                <div className="h-[1px] w-12 bg-[#B04D4A] mx-auto opacity-20 group-hover:w-20 transition-all duration-700" />
                <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#8C7A66]/60">A Próxima Página espera</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-8">
                <div className="space-y-1">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-[#F4ECE2]/40 border-b border-black/5 rounded-t-3xl py-6 px-8 outline-none text-sm italic text-[#2C3E50] focus:border-[#B04D4A] focus:bg-white transition-all placeholder:text-[#8C7A66]/30"
                    placeholder="Seu e-mail de leitora"
                  />
                  <input 
                    type="password" 
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    className="w-full bg-[#F4ECE2]/40 border-b border-black/5 rounded-b-3xl py-6 px-8 outline-none text-sm text-[#2C3E50] focus:border-[#B04D4A] focus:bg-white transition-all placeholder:text-[#8C7A66]/30"
                    placeholder="Sua senha secreta"
                  />
                </div>

                {erro && (
                  <p className="text-[10px] text-center italic text-[#B04D4A] animate-pulse font-bold uppercase tracking-wider">
                    {erro}
                  </p>
                )}

                <div 
                  onClick={() => setAceitouTermos(!aceitouTermos)}
                  className="flex items-center gap-4 cursor-pointer group/check px-2"
                >
                  <div className={`w-6 h-6 rounded-full border border-black/10 flex items-center justify-center transition-all duration-500 ${aceitouTermos ? 'scale-110 shadow-lg' : 'group-hover/check:border-[#B04D4A]'}`} 
                       style={{ background: aceitouTermos ? rosaGabi : 'transparent' }}>
                    {aceitouTermos && <Sparkles className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 text-[#8C7A66] select-none italic group-hover/check:opacity-100 transition-opacity">
                    Aceito florescer nesta roda
                  </span>
                </div>

                <Button 
                  type="submit"
                  disabled={carregando}
                  className="w-full rounded-[2.5rem] h-20 text-[10px] font-bold uppercase tracking-[0.4em] transition-all shadow-xl text-white hover:brightness-110 active:scale-95 disabled:opacity-50 relative overflow-hidden group/btn"
                  style={{ backgroundColor: rosaGabi }}
                >
                  {carregando ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-3">
                      Abrir a Próxima Página <ArrowRight size={14} className="group-hover/btn:translate-x-2 transition-transform" />
                    </span>
                  )}
                </Button>

                <div className="text-center space-y-2">
                  <Link href="/recuperar-senha" className="block text-[10px] font-bold uppercase tracking-[0.35em] text-[#8C7A66] hover:text-[#B04D4A] transition-colors">
                    Esqueci minha senha
                  </Link>
                  <p className="text-[8px] font-bold uppercase tracking-[0.5em] opacity-30 text-[#8C7A66]">
                    Brasília • Curadoria de Afeto
                  </p>
                </div>
              </form>
            </div>
          </div>
          
          <div className="mt-10 flex flex-col items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#8C7A66]/60 font-bold">
                Ainda não ler conosco?
              </p>
              <Link 
                href="/cadastro" 
                className="group flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.4em] text-[#B04D4A] transition-all hover:opacity-80"
              >
                Solicitar Cadastro
                <Sparkles size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>

            <div className="h-px w-8 bg-[#8C7A66]/20" />

            <Link 
              href="/" 
              className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8C7A66] hover:text-[#B04D4A] transition-colors"
            >
              Voltar para a Home
            </Link>
          </div>
        </main>
      </div>

      {/* Detalhe de Rodapé */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-20 pointer-events-none">
         <div className="h-px w-12 bg-[#8C7A66]" />
         <p className="text-[8px] font-bold uppercase tracking-[0.8em] text-[#8C7A66]">Espaço Protegido</p>
      </div>
    </div>
  );
}