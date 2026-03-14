'use client';

import { useState } from 'react';
import { useAdmin } from '@/lib/admin-context';
import { Button } from '@/components/ui/button';
import { Lock, Mail, ArrowRight } from 'lucide-react';

export function AdminLogin() {
  const { login } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      
      await login(email, password);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'E-mail ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 flex-col relative overflow-hidden" style={{ background: 'var(--page-color-60)' }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        .animate-float { animation: float 10s ease-in-out infinite; }
      `}</style>

      
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-125 h-125 bg-purple-600/20 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-[-10%] left-[-5%] w-125 h-125 bg-indigo-600/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: '3s' }} />
      </div>

      <div className="w-full max-w-md z-10 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="font-serif text-5xl italic text-white tracking-tight">
            O <span className="text-purple-400">Clube</span>
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.4em]">
            Espaço das Leitoras
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/3 backdrop-blur-2xl border border-white/10 rounded-4xl p-10 shadow-2xl space-y-6"
        >
          <div className="space-y-4">
            
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-slate-300 text-[10px] font-bold uppercase tracking-widest ml-1">
                <Mail size={14} className="text-purple-400" /> E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                disabled={loading}
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all"
              />
            </div>

            
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-slate-300 text-[10px] font-bold uppercase tracking-widest ml-1">
                <Lock size={14} className="text-purple-400" /> Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs text-center animate-shake">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-linear-to-r from-purple-600 to-indigo-600 hover:scale-[1.02] active:scale-[0.98] text-white font-bold uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2"
          >
            {loading ? 'Validando...' : (
              <>
                Entrar no Painel <ArrowRight size={18} />
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-slate-500 text-[11px] font-medium tracking-wide">
          Ambiente restrito às participantes do Clube das Leitoras
        </p>
      </div>
    </div>
  );
}