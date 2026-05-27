"use client";

import React, { useEffect, useRef, useState } from 'react';
import { uploadFile } from '@/lib/upload-client';
import { Button } from '@/components/ui/button';
import { Camera, Phone, User, Loader2, CheckCircle2 } from 'lucide-react';

export default function CarteirinhaPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isLogged, setIsLogged] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
      return match ? decodeURIComponent(match[1]) : null;
    };
    const loggedEmail = getCookie('clube-user-email');
    setIsLogged(!!loggedEmail);
    if (loggedEmail) {
      setEmail(loggedEmail);
    }
  }, []);

  const handleFotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const url = await uploadFile(file);
      setFotoUrl(url);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Erro ao enviar a foto.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!nome.trim() || !email.trim() || !whatsapp.trim() || !fotoUrl.trim()) {
      setError('Por favor preencha nome completo, e-mail, WhatsApp e envie uma foto.');
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/solicitacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'carteirinha',
          nome: nome.trim(),
          email: email.trim(),
          whatsapp: whatsapp.trim(),
          fotoUrl: fotoUrl.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Erro ao enviar a solicitação.');
      }
      setSuccess('Solicitação de carteirinha enviada com sucesso! Em breve a curadoria entrará em contato.');
      setNome('');
      setWhatsapp('');
      setFotoUrl('');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Erro ao enviar a solicitação.');
    } finally {
      setSending(false);
    }
  };

  const handleDownloadPhoto = async () => {
    if (!fotoUrl) return;

    try {
      const response = await fetch(fotoUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const fileExtension = blob.type?.split('/')[1] || 'jpg';
      const fileName = `${nome.trim().replace(/\s+/g, '_') || 'carteirinha'}_foto.${fileExtension}`;
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.open(fotoUrl, '_blank');
    }
  };

  return (
    <div
      className="min-h-screen text-[#4A443F] font-alice pb-32 relative overflow-hidden"
      style={{ background: `#FDFCFB url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')` }}
    >
      <main className="max-w-5xl mx-auto px-6">
        <header className="max-w-5xl mx-auto pt-32 pb-24 px-6 text-center border-b border-black/5">
          <div className="flex items-center justify-center gap-4 mb-8 opacity-40">
            <div className="h-px w-10 bg-black" />
            <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-black italic">Carteirinha oficial</span>
            <div className="h-px w-10 bg-black" />
          </div>
          <h1 className="text-7xl md:text-[100px] text-[#2C3E50] tracking-tighter leading-[0.8] mb-10 drop-shadow-sm">
            Carteirinha<br />
            <span className="italic text-[#B04D4A] font-light">Clube das Leitoras</span>
          </h1>
          <div className="max-w-3xl mx-auto text-left border-t border-black/10 pt-10">
            <div className="grid gap-8 md:grid-cols-2">
              <p className="text-base leading-relaxed opacity-60 text-black italic">
                A carteirinha oficial é a sua chave de acesso aos debates literários. Mais do que um documento de identificação, ela é o símbolo da sua presença na nossa comunidade.
              </p>
              <p className="text-base leading-relaxed opacity-60 text-black italic">
                Apresente-a para ter acesso à sala da biblioteca e garantir o seu lugar nas rodas de leitura e encontros especiais do Clube das Leitoras.
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-10 lg:grid-cols-[1.6fr_0.9fr] items-start">
          <section className="space-y-8">
            <div className="rounded-[3rem] border border-black/5 bg-white p-10 shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="rounded-3xl bg-[#F7E8E6] p-4 shadow-sm">
                  <Camera size={24} className="text-[#B04D4A]" />
                </div>
                <div>
                  <h2 className="text-3xl font-semibold text-slate-900">O que precisamos receber</h2>
                  <p className="mt-3 text-sm italic opacity-60 text-slate-600 leading-relaxed">
                    Para produzir a sua carteirinha com cuidado, precisamos de algumas informações simples.
                  </p>
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <ul className="space-y-3 text-sm text-slate-600">
                  <li>• Foto para identificação na carteirinha</li>
                  <li>• Nome completo</li>
                </ul>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li>• E-mail para contato e confirmação</li>
                  <li>• WhatsApp — o mesmo número que consta no grupo</li>
                </ul>
              </div>
              <div className="mt-8 border-t border-black/5 pt-6">
                <h3 className="text-base font-semibold text-slate-900 uppercase tracking-[0.3em]">Dados solicitados</h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  <li>• Nome completo</li>
                  <li>• E-mail</li>
                  <li>• WhatsApp</li>
                  <li>• Foto</li>
                </ul>
              </div>
            </div>

            {!isLogged ? (
              <div className="rounded-[3rem] border border-amber-200 bg-amber-50 p-10 shadow-sm">
                <h2 className="text-2xl font-semibold text-slate-900">Acesso reservado</h2>
                <p className="mt-4 text-sm leading-7 text-slate-700">
                  Este pedido só pode ser feito por quem já tem cadastro no Clube das Leitoras.
                </p>
                <a
                  href="/login"
                  className="mt-8 inline-flex items-center justify-center rounded-full bg-[#B04D4A] px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white hover:bg-[#8C3A3F] transition-all"
                >
                  Entrar no Clube
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 rounded-[3rem] border border-black/5 bg-white p-10 shadow-sm">
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Nome completo</label>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <User size={18} className="text-slate-400" />
                      <input
                        value={nome}
                        onChange={(event) => setNome(event.target.value)}
                        placeholder="Seu nome completo"
                        className="w-full bg-transparent text-sm outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-[0.3em] text-slate-500">E-mail</label>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <User size={18} className="text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="seu@email.com"
                        className="w-full bg-transparent text-sm outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-[0.3em] text-slate-500">WhatsApp</label>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Phone size={18} className="text-slate-400" />
                      <input
                        value={whatsapp}
                        onChange={(event) => setWhatsapp(event.target.value)}
                        placeholder="(61) 9 9999-9999"
                        className="w-full bg-transparent text-sm outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Foto</label>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Camera size={18} className="text-slate-400" />
                      <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFotoChange}
                        className="w-full text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-[#F7E8E6] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#8C4C4A]"
                      />
                    </div>
                  </div>
                  {uploading && (
                    <div className="text-sm text-slate-500 flex items-center gap-2">
                      <Loader2 className="animate-spin" size={16} /> Enviando foto...
                    </div>
                  )}
                  {fotoUrl && (
                    <div className="rounded-3xl overflow-hidden border border-slate-200">
                      <img src={fotoUrl} alt="Prévia da foto" className="w-full h-auto object-cover" />
                    </div>
                  )}
                  {fotoUrl && (
                    <div className="mt-3">
                      <Button
                        type="button"
                        onClick={handleDownloadPhoto}
                        className="w-full justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white hover:bg-slate-700"
                      >
                        Baixar foto da carteirinha
                      </Button>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {success}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={sending || uploading}
                  className="w-full justify-center rounded-full bg-[#B04D4A] px-6 py-4 text-sm font-bold uppercase tracking-[0.25em] text-white hover:bg-[#8C3A3F] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sending ? 'Enviando...' : 'Enviar solicitação'}
                </Button>
              </form>
            )}
          </section>

          <aside className="space-y-6 rounded-[3rem] border border-black/5 bg-white p-10 shadow-sm">
            <div>
              <div className="flex items-center gap-3 text-[#B04D4A]">
                <CheckCircle2 size={24} />
                <h2 className="text-xl font-semibold">Por que solicitamos essas informações?</h2>
              </div>
              <p className="mt-4 text-sm italic opacity-60 leading-7 text-slate-600">
                Essas informações ajudam a curadoria a produzir, confirmar e entregar sua carteirinha com mais cuidado.
              </p>
            </div>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>• A carteirinha é obrigatória para participação nas rodas de leitura.</li>
              <li>• Somente participantes cadastradas poderão acessar a sala da biblioteca durante os encontros.</li>
              <li>• A carteirinha é personalizada e serve como identificação no clube.</li>
              <li>• O contato e a confirmação do envio serão feitos por e-mail.</li>
            </ul>
          </aside>
        </div>
      </main>
    </div>
  );
}
