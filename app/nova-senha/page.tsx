"use client";

import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ShieldCheck, Loader2, BookOpen, Save, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

function NovaSenhaForm() {
  const router = useRouter();
  const [senha, setSenha] = useState('');
  const [confirma, setConfirma] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (senha !== confirma) {
      setErro('As senhas não coincidem.');
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
        setErro(data.error || 'Erro ao salvar a senha.');
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
    <div className="min-h-screen bg-[#FDFBF9] text-[#4A3F35] font-alice flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#F2D7D5]/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#E8D9C6]/20 rounded-full blur-[120px] pointer-events-none" />

      <main className="w-full max-w-md mx-auto px-6 relative z-10">
        <div className="bg-white/70 backdrop-blur-xl p-10 md:p-14 shadow-[0_30px_100px_-20px_rgba(217,181,178,0.3)] border border-white/50 rounded-[2.5rem] relative">
          {/* ícone topo */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-[#967BB6] rounded-full shadow-lg flex items-center justify-center border-4 border-white z-20">
            <Heart className="text-white w-6 h-6 fill-current" />
          </div>

          <div className="space-y-10 pt-4">
            <div className="text-center space-y-2">
              <h2 className="text-3xl italic text-[#3E362E] tracking-tight">Bem-vinda ao Clube!</h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#967BB6]">
                Crie sua senha de acesso
              </p>
            </div>

            {sucesso ? (
              <div className="text-center space-y-4 py-6">
                <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto" />
                <p className="text-sm italic text-emerald-600">
                  Senha criada com sucesso! Redirecionando...
                </p>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#967BB6]/60" />
                  <input
                    type="password"
                    required
                    className="w-full bg-white/50 border border-[#D9B5B2]/20 rounded-2xl py-5 pl-14 pr-4 outline-none focus:ring-4 focus:ring-[#967BB6]/20 transition-all text-sm placeholder:opacity-40"
                    placeholder="Nova senha (mín. 6 caracteres)"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="relative">
                  <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#967BB6]/60" />
                  <input
                    type="password"
                    required
                    className="w-full bg-white/50 border border-[#D9B5B2]/20 rounded-2xl py-5 pl-14 pr-4 outline-none focus:ring-4 focus:ring-[#967BB6]/20 transition-all text-sm placeholder:opacity-40"
                    placeholder="Confirme a senha"
                    value={confirma}
                    onChange={(e) => setConfirma(e.target.value)}
                    disabled={loading}
                  />
                </div>

                {erro && (
                  <div className="bg-rose-50/80 border border-rose-100 rounded-xl px-5 py-4 text-[11px] italic text-rose-500">
                    {erro}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl h-16 text-[11px] font-bold uppercase tracking-[0.4em] bg-[#967BB6] hover:bg-[#7C5EA0] text-white transition-all"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-3">
                      Salvar Senha <Save className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2 opacity-30">
          <div className="w-px h-8 bg-linear-to-b from-[#967BB6] to-transparent" />
          <BookOpen className="w-4 h-4 text-[#967BB6]" />
          <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-[#3E362E]">
            Sua jornada começa aqui
          </p>
        </div>
      </main>

      <footer className="absolute bottom-10 w-full text-center">
        <p className="text-[9px] font-bold uppercase tracking-[0.8em] text-[#967BB6]/40">
          Brasília • Clube das Leitoras
        </p>
      </footer>
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
