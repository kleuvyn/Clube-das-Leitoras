"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Loader2, Mail, User, MapPin, CalendarDays, 
  CheckCircle2, Heart, ArrowLeft, Sparkles, Phone
} from 'lucide-react';
import { toast } from 'sonner';

// Cores da Identidade do Clube
const rosaPrincipal = "#C47E8A";
const marromTerra = "#4A3F35";
const papelCor = "#FDFCFB";
const bgStyle = { 
  backgroundColor: papelCor,
  backgroundImage: `url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')` 
};

export default function CadastroLeitoraPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [manualBirthdate, setManualBirthdate] = useState(false);
  const [tempoClube, setTempoClube] = useState('Desde a primeira roda 2/2025');
  const [enderecoCompleto, setEnderecoCompleto] = useState('');
  const [cartaMimo, setCartaMimo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name || !phone || !birthdate) {
      toast.error('Por favor preencha todos os campos obrigatórios.');
      return;
    }

    if (manualBirthdate) {
      const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/([0-9]{4})$/;
      if (!regex.test(birthdate)) {
        toast.error('Data de nascimento inválida. Use o formato DD/MM/AAAA.');
        setSubmitting(false);
        return;
      }
    }
    setSubmitting(true);

    try {
      const res = await fetch('/api/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, phone, birthdate, tempoClube, enderecoCompleto, cartaMimo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao cadastrar.');

      if (data?.emailStatus?.user === false) {
        toast.error('Cadastro recebido, mas falha ao enviar e-mail de confirmação. Verifique seu e-mail e tente novamente.');
      } else {
        toast.success('Inscrição enviada com carinho! Verifique seu e-mail para confirmação.');
      }

      if (data?.emailStatus?.hasKey === false) {
        toast.error('A API de e-mail não está configurada. Contate a equipe técnica.');
      }

      setSubmitted(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch (err: any) {
      toast.error(err.message ?? 'Não foi possível enviar o cadastro.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-20 px-6 flex items-center justify-center font-serif" style={bgStyle}>
      <main className="max-w-2xl w-full bg-white/70 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[3rem] p-8 md:p-12 border border-black/5 relative overflow-hidden">
        
        {/* Detalhe Decorativo Superior */}
        <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: rosaPrincipal }} />

        <header className="text-center mb-12 space-y-4">
          <div className="flex justify-center mb-4">
             <div className="p-3 rounded-full bg-[#FDFCFB] shadow-inner border border-black/5">
                <Heart size={28} style={{ color: rosaPrincipal }} fill={rosaPrincipal} className="opacity-20" />
             </div>
          </div>
          <h1 className="text-4xl md:text-5xl text-slate-800 font-light tracking-tight">
            Seja bem-vinda <br />
            <span className="italic" style={{ color: rosaPrincipal }}>ao nosso clube.</span>
          </h1>
          <p className="text-slate-500 italic text-sm max-w-md mx-auto leading-relaxed">
            "Um espaço restrito para quem cultiva o hábito da leitura e o afeto entre mulheres."
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Dados Pessoais */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 opacity-30">
              <div className="h-[1px] w-6 bg-black" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Identificação</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest font-bold opacity-40">Seu Nome Completo *</label>
                <div className="relative group">
                  <User className="absolute left-0 top-2 opacity-20 group-focus-within:opacity-100 transition-opacity" size={16} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-transparent border-b border-black/10 py-2 pl-7 focus:border-[#C47E8A] outline-none transition-colors text-sm font-sans"
                    placeholder="Como devemos te chamar?"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest font-bold opacity-40">E-mail para Acesso *</label>
                <div className="relative group">
                  <Mail className="absolute left-0 top-2 opacity-20 group-focus-within:opacity-100 transition-opacity" size={16} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-transparent border-b border-black/10 py-2 pl-7 focus:border-[#C47E8A] outline-none transition-colors text-sm font-sans"
                    placeholder="exemplo@clube.com"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest font-bold opacity-40">WhatsApp *</label>
                <div className="relative group">
                  <Phone className="absolute left-0 top-2 opacity-20 group-focus-within:opacity-100 transition-opacity" size={16} />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full bg-transparent border-b border-black/10 py-2 pl-7 focus:border-[#C47E8A] outline-none transition-colors text-sm font-sans"
                    placeholder="(61) 98888-7777"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest font-bold opacity-40">Data de Nascimento *</label>
                <div className="flex items-center gap-2 text-[10px] mb-1">
                  <span className="text-slate-500">Modo:</span>
                  <button
                    type="button"
                    onClick={() => setManualBirthdate(false)}
                    className={`px-2 py-1 rounded-xl ${!manualBirthdate ? 'bg-[#C47E8A] text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    Calendário
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualBirthdate(true)}
                    className={`px-2 py-1 rounded-xl ${manualBirthdate ? 'bg-[#C47E8A] text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    Digitar
                  </button>
                </div>

                <div className="relative group">
                  <CalendarDays className="absolute left-0 top-2 opacity-20 group-focus-within:opacity-100 transition-opacity" size={16} />
                  <input
                    type={manualBirthdate ? 'text' : 'date'}
                    inputMode={manualBirthdate ? 'numeric' : undefined}
                    pattern={manualBirthdate ? "^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[012])/([0-9]{4})$" : undefined}
                    placeholder={manualBirthdate ? 'DD/MM/AAAA' : 'Selecione a data'}
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                    required
                    className="w-full bg-transparent border-b border-black/10 py-2 pl-7 focus:border-[#C47E8A] outline-none transition-colors text-sm font-sans"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Seção Clube */}
          <div className="space-y-6 pt-4">
             <div className="flex items-center gap-3 opacity-30">
              <div className="h-[1px] w-6 bg-black" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Sua Jornada Conosco</span>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest font-bold opacity-40">Há quanto tempo você está no clube?</label>
              <select
                value={tempoClube}
                onChange={(e) => setTempoClube(e.target.value)}
                className="w-full bg-black/[0.03] border-none rounded-xl py-4 px-4 text-sm font-sans appearance-none focus:ring-1 focus:ring-[#C47E8A] outline-none cursor-pointer transition-all"
              >
                <option>1 a 3 meses</option>
                <option>3 a 6 meses</option>
                <option>6 meses a 1 ano</option>
                <option>1 ano ou mais</option>
                <option>Desde a primeira roda 2/2025</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest font-bold opacity-40">Endereço para Mimos (Opcional)</label>
              <textarea
                value={enderecoCompleto}
                onChange={(e) => setEnderecoCompleto(e.target.value)}
                className="w-full bg-black/[0.03] border-none rounded-2xl py-4 px-4 text-sm font-sans focus:ring-1 focus:ring-[#C47E8A] outline-none transition-all"
                rows={3}
                placeholder="Rua, quadra, bairro, CEP, cidade, complemento..."
              />
              <div className="mt-4 p-5 bg-[#C47E8A]/5 border border-[#C47E8A]/10 rounded-2xl">
                <div className="flex items-start gap-3">
                  <Sparkles size={16} className="mt-1 shrink-0" style={{ color: rosaPrincipal }} />
                  <div>
                    <p className="text-[11px] text-slate-700 font-bold uppercase tracking-wider leading-relaxed">Seção Carta e Mimo</p>
                    <p className="text-[10px] text-slate-500 italic mt-1 leading-relaxed">
                      Você prestigia o clube e quer receber de surpresa uma carta com um mimo? 
                      As cartas serão enviadas conforme a participação ou em datas especiais sem aviso prévio.
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center gap-3 bg-white/50 p-3 rounded-xl">
                  <input
                    type="checkbox"
                    checked={cartaMimo}
                    onChange={(e) => setCartaMimo(e.target.checked)}
                    id="cartaMimo"
                    className="h-4 w-4 rounded-full border-black/10 text-[#C47E8A] focus:ring-[#C47E8A] cursor-pointer"
                  />
                  <label htmlFor="cartaMimo" className="text-[11px] font-bold text-slate-600 cursor-pointer uppercase tracking-tight">
                    Sim, adoraria receber surpresas do clube!
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 space-y-4">
            <Button 
              type="submit" 
              disabled={submitting || submitted} 
              className="w-full h-16 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] transition-all hover:scale-[1.01] shadow-xl"
              style={{ backgroundColor: submitted ? '#6B9E78' : marromTerra }}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={16} /> Enviando...</span>
              ) : submitted ? (
                <span className="flex items-center justify-center gap-2"><CheckCircle2 size={16} /> Inscrição enviada!</span>
              ) : (
                <span className="flex items-center justify-center gap-2"><CheckCircle2 size={16} /> Enviar minha inscrição</span>
              )}
            </Button>

            <button 
              type="button"
              onClick={() => router.push('/login')}
              className="w-full flex items-center justify-center gap-2 text-[9px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity font-bold"
            >
              <ArrowLeft size={12} /> Já tenho cadastro, ir para login
            </button>
          </div>
        </form>

        <footer className="mt-12 text-center">
           <p className="text-[9px] text-slate-400 uppercase tracking-widest leading-relaxed">
             Sua inscrição será analisada com carinho. <br />
             Você receberá o acesso e senha provisória por e-mail.
           </p>
        </footer>
      </main>
    </div>
  );
}