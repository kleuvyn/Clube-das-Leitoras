"use client";

import React, { useState } from 'react';
import { Heart, Loader2, Coffee, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const rosaGabi = "#B04D4A";
const marromPapel = "#8C7A66";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!email.trim()) {
      setError('Informe seu e-mail para que possamos enviar a senha temporária.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/request-temp-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Não foi possível processar sua solicitação.');
        return;
      }
      setMessage('Se o e-mail estiver registrado e ativo, você receberá uma nova senha temporária em até alguns minutos.');
    } catch (err) {
      setError('Erro de conexão. Tente novamente em instantes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4ECE2] font-serif flex items-center justify-center p-6 relative overflow-hidden selection:bg-[#B04D4A20]">
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />
      <div className="max-w-6xl w-full mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="space-y-12 text-center lg:text-left p-8 animate-in fade-in slide-in-from-left-8 duration-1000">
          <header className="space-y-6">
            <div className="flex items-center justify-center lg:justify-start gap-4 opacity-40">
              <Coffee size={18} style={{ color: marromPapel }} />
              <div className="h-[1px] w-12 bg-[#8C7A66]" />
              <span className="text-[12px] font-mono font-bold uppercase tracking-[0.5em] text-[#8C7A66]">Senha Temporária</span>
            </div>
            <h1 className="text-7xl md:text-[100px] text-[#2C3E50] tracking-tighter leading-[0.8] drop-shadow-sm">
              Reúna<br/>
              <span style={{ color: rosaGabi }} className="italic font-light">Seu acesso</span>
            </h1>
          </header>
          <div className="space-y-8 max-w-md mx-auto lg:mx-0">
            <p className="text-2xl md:text-3xl font-light italic text-[#8C7A66] leading-relaxed">
              "Se você já tem acesso aprovado, enviaremos uma nova senha temporária com validade de 24 horas."
            </p>
            <div className="flex justify-center lg:justify-start gap-8 opacity-40 text-[#8C7A66]">
              <div className="flex flex-col items-center gap-2 hover:scale-110 transition-transform">
                <Mail size={20} />
                <span className="text-[8px] font-mono uppercase tracking-widest font-bold">E-mail</span>
              </div>
              <div className="flex flex-col items-center gap-2 hover:scale-110 transition-transform">
                <Heart size={20} />
                <span className="text-[8px] font-mono uppercase tracking-widest font-bold">Protegido</span>
              </div>
            </div>
          </div>
        </div>
        <main className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <div className="bg-[#FDFBF9] p-10 md:p-14 rounded-[4rem] relative border border-black/5 group transition-all duration-700">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center border-[6px] border-[#FDFBF9] z-20"
                 style={{ background: rosaGabi }}>
              <Heart className="text-white fill-current w-6 h-6" />
            </div>
            <div className="space-y-10 pt-4">
              <div className="text-center space-y-3">
                <h2 className="text-3xl text-[#2C3E50] italic font-light tracking-tight">Recuperar acesso</h2>
                <div className="h-[1px] w-12 bg-[#B04D4A] mx-auto opacity-20" />
                <p className="text-[9px] font-mono font-bold uppercase tracking-[0.4em] text-[#8C7A66]/60">Gere nova senha temporária</p>
              </div>
              <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="space-y-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#F4ECE2]/40 border-b border-black/5 rounded-t-3xl py-6 px-8 outline-none text-sm italic text-[#2C3E50] focus:border-[#B04D4A] focus:bg-white transition-all placeholder:text-[#8C7A66]/30"
                    placeholder="Seu e-mail cadastrado"
                    required
                    disabled={loading}
                  />
                </div>
                {error && (
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl px-6 py-4 text-[12px] italic text-rose-600 text-center">
                    {error}
                  </div>
                )}
                {message && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-6 py-4 text-[12px] italic text-emerald-700 text-center">
                    {message}
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-[2.5rem] h-24 text-[10px] font-mono font-bold uppercase tracking-[0.4em] transition-all shadow-2xl text-white hover:brightness-110 active:scale-95 disabled:opacity-50"
                  style={{ backgroundColor: rosaGabi }}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-3">
                      Enviar nova senha <ArrowRight size={14} />
                    </span>
                  )}
                </Button>
              </form>
            </div>
            <div className="mt-10 text-center text-[9px] uppercase tracking-[0.35em] opacity-40 text-[#8C7A66]">
              <a href="/login" className="underline hover:text-[#B04D4A]">Voltar ao login</a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
