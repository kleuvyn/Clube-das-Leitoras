"use client";

import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Heart, Loader2, Coffee, BookOpen, PenTool, Music, ArrowRight, ShieldCheck, Eye, EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";

const rosaGabi = "#B04D4A";
const marromPapel = "#8C7A66";

function NovaSenhaForm() {
  const router = useRouter();
  const [senha, setSenha] = useState('');
  const [confirma, setConfirma] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  const [verConfirma, setVerConfirma] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const handleSalvar = async () => {
    setErro('');

    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (senha !== confirma) {
      setErro('As senhas não coincidem. Verifique e tente novamente.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: senha }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || 'Erro ao salvar a senha. Tente novamente.');
        return;
      }

      setSucesso(true);
      setTimeout(() => router.push('/cronograma'), 2000);
    } catch {
      setErro('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4ECE2] font-alice flex items-center justify-center p-6 relative overflow-hidden selection:bg-[#B04D4A20]">
      
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />

      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center relative z-10">
        
        <div className="space-y-12 text-center lg:text-left p-8 animate-in fade-in slide-in-from-left-8 duration-1000">
          <header className="space-y-6">
            <div className="flex items-center justify-center lg:justify-start gap-4 opacity-40">
              <Coffee size={18} style={{ color: marromPapel }} />
              <div className="h-[1px] w-12 bg-[#8C7A66]" />
              <span className="text-[12px] font-mono font-bold uppercase tracking-[0.5em] text-[#8C7A66]">Novo Capítulo</span>
            </div>
            
            <h1 className="text-7xl md:text-[100px] text-[#2C3E50] tracking-tighter leading-[0.8] drop-shadow-sm">
              Sua <br/>
              <span style={{ color: rosaGabi }} className="italic font-light">Senha</span>
            </h1>
          </header>

          <div className="space-y-8 max-w-md mx-auto lg:mx-0">
            <p className="text-2xl md:text-3xl font-light italic text-[#8C7A66] leading-relaxed">
              "Escolha uma senha que guarde seus momentos mais preciosos."
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

        <main className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <div className="bg-[#FDFBF9] p-10 md:p-14 rounded-[4rem] relative border border-black/5 group transition-all duration-700">
            
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center border-[6px] border-[#FDFBF9] z-20 group-hover:rotate-12 transition-all duration-700"
                 style={{ background: rosaGabi }}>
              <Heart className="text-white fill-current w-6 h-6" />
            </div>

            <div className="space-y-10 pt-4">
              <div className="text-center space-y-3">
                <h2 className="text-3xl text-[#2C3E50] italic font-light tracking-tight">Bem-vinda ao Clube!</h2>
                <div className="h-[1px] w-12 bg-[#B04D4A] mx-auto opacity-20" />
                <p className="text-[9px] font-mono font-bold uppercase tracking-[0.4em] text-[#8C7A66]/60">Crie sua senha definitiva</p>
              </div>

              {sucesso ? (
                <div className="text-center space-y-4 py-8">
                  <ShieldCheck className="w-12 h-12 mx-auto" style={{ color: rosaGabi }} />
                  <p className="text-base italic" style={{ color: rosaGabi }}>Senha criada! Entrando no clube...</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="space-y-1">
                    <div className="relative">
                      <input
                        type={verSenha ? 'text' : 'password'}
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        className="w-full bg-[#F4ECE2]/40 border-b border-black/5 rounded-t-3xl py-6 pl-8 pr-14 outline-none text-sm italic text-[#2C3E50] focus:border-[#B04D4A] transition-all placeholder:text-[#8C7A66]/30"
                        placeholder="Nova senha (mín. 6 caracteres)"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setVerSenha(v => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8C7A66]/40 hover:text-[#8C7A66] transition-colors"
                        tabIndex={-1}
                      >
                        {verSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={verConfirma ? 'text' : 'password'}
                        value={confirma}
                        onChange={(e) => setConfirma(e.target.value)}
                        className="w-full bg-[#F4ECE2]/40 border-b border-black/5 rounded-b-3xl py-6 pl-8 pr-14 outline-none text-sm text-[#2C3E50] focus:border-[#B04D4A] transition-all placeholder:text-[#8C7A66]/30"
                        placeholder="Confirme a senha"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setVerConfirma(v => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8C7A66]/40 hover:text-[#8C7A66] transition-colors"
                        tabIndex={-1}
                      >
                        {verConfirma ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {erro && (
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl px-6 py-4 text-[12px] italic text-rose-600 text-center">
                      {erro}
                    </div>
                  )}

                  <Button
                    type="button"
                    onClick={handleSalvar}
                    disabled={loading}
                    className="w-full rounded-[2.5rem] h-24 text-[10px] font-mono font-bold uppercase tracking-[0.4em] transition-all shadow-2xl text-white hover:brightness-110 active:scale-95 disabled:opacity-50"
                    style={{ backgroundColor: rosaGabi }}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-3">
                        Entrar no Clube <ArrowRight size={14} />
                      </span>
                    )}
                  </Button>

                  <p className="text-center text-[8px] font-mono uppercase tracking-[0.5em] opacity-30 text-[#8C7A66]">
                    Brasília • Curadoria de Afeto
                  </p>
                </div>
              )}
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

export default function NovaSenhaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FDFBF9] flex items-center justify-center text-[#967BB6] italic text-[10px] tracking-[0.5em] font-alice">
          PREPARANDO...
        </div>
      }
    >
      <NovaSenhaForm />
    </Suspense>
  );
}
