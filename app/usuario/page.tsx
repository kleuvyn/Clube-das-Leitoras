'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  carteirinhaUrl?: string | null;
};

export default function UsuarioPage() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [showCard, setShowCard] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/usuario', { cache: 'no-store' });
        if (!res.ok) throw new Error((await res.json()).error || 'Falha ao carregar');
        const data = await res.json();
        setUser(data.user);
        setName(data.user.name || '');
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar perfil');
      }
    };
    load();
  }, []);

  const saveName = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/usuario', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Falha ao salvar nome');
      setMessage('Nome atualizado com sucesso.');
      setUser({ ...user, name });
      // Recarrega a página para garantir que todas as partes do app reflitam o nome atualizado
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar nome');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (!user) return;
    if (!oldPassword || !newPassword) {
      setError('Preencha senha atual e nova senha');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('A nova senha e a confirmação não conferem');
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, oldPass: oldPassword, newPass: newPassword }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Falha ao trocar senha');
      setMessage('Senha alterada com sucesso.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (!confirm('Tem certeza que deseja excluir sua conta? Esta ação desativa e anonimiza seus dados.')) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/usuario', { method: 'DELETE' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Falha ao excluir conta');
      setMessage('Conta excluída (desativada/anonimizada).');
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen font-alice pb-20 pt-28 relative overflow-hidden" style={{ background: `#FDFCFB url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')` }}>
      <div className="max-w-3xl mx-auto prose prose-slate prose-quoteless">
        <header className="border-b border-amber-200 pb-8 mb-12">
          <h1 className="text-4xl font-serif text-amber-950 mb-2">Perfil da Usuária</h1>
          <p className="text-sm font-medium text-amber-800/70 italic">Aqui você pode editar seu nome, trocar senha e excluir sua conta.</p>
        </header>

        {!user && !error && <p>Carregando dados do usuário...</p>}
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        {message && <p className="text-sm text-green-600 mb-4">{message}</p>}

        {user && (
          <section className="space-y-8">
            <div className="bg-white/85 p-6 rounded-2xl border border-amber-100 shadow-sm">
              <h2 className="text-2xl font-semibold text-amber-900 mb-4">Dados do Perfil</h2>
              <label className="block text-sm font-medium text-slate-700">E-mail</label>
              <p className="mb-4 text-slate-600">{user.email}</p>

              {user.carteirinhaUrl && (
                <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <p className="font-semibold">Sua carteirinha está pronta e disponível</p>
                  <p className="text-xs text-amber-700 mb-3">A carteirinha enviada pela curadoria fica guardada no seu perfil para você apresentar quando precisar.</p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-amber-800">Mostrar no site</p>
                      <p className="text-[11px] text-amber-700">Clique para abrir e apresentar.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCard(true)}
                      className="inline-flex items-center gap-2 rounded-full bg-amber-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-amber-800"
                    >
                      Apresentar carteirinha
                    </button>
                  </div>
                </div>
              )}

              <label className="block text-sm font-medium text-slate-700">Nome</label>
              <input
                className="w-full p-3 mt-2 mb-4 border rounded-xl outline-none border-amber-200"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <button
                disabled={loading}
                onClick={saveName}
                className="px-5 py-2.5 bg-amber-800 text-white rounded-xl hover:bg-amber-900 disabled:opacity-50"
              >
                Salvar nome
              </button>
            </div>

            <div className="bg-white/85 p-6 rounded-2xl border border-amber-100 shadow-sm">
              <h2 className="text-2xl font-semibold text-amber-900 mb-4">Trocar senha</h2>
              <label className="block text-sm font-medium text-slate-700">Senha atual</label>
              <input
                type="password"
                className="w-full p-3 mt-2 mb-4 border rounded-xl outline-none border-amber-200"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <label className="block text-sm font-medium text-slate-700">Nova senha</label>
              <input
                type="password"
                className="w-full p-3 mt-2 mb-4 border rounded-xl outline-none border-amber-200"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <label className="block text-sm font-medium text-slate-700">Confirmar nova senha</label>
              <input
                type="password"
                className="w-full p-3 mt-2 mb-4 border rounded-xl outline-none border-amber-200"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                disabled={loading}
                onClick={changePassword}
                className="px-5 py-2.5 bg-amber-800 text-white rounded-xl hover:bg-amber-900 disabled:opacity-50"
              >
                Alterar senha
              </button>
            </div>

            <div className="bg-white/85 p-6 rounded-2xl border border-amber-100 shadow-sm">
              <h2 className="text-2xl font-semibold text-amber-900 mb-4">Excluir conta</h2>
              <p className="text-sm text-slate-700 mb-4">Essa ação desativa a conta e anonimizada seus dados pessoais no banco.</p>
              <button
                disabled={loading}
                onClick={deleteAccount}
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
              >
                Excluir conta
              </button>
            </div>
          </section>
        )}

        {showCard && user?.carteirinhaUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="relative w-full max-w-3xl overflow-hidden rounded-4xl bg-white shadow-2xl">
              <button
                onClick={() => setShowCard(false)}
                className="absolute right-4 top-4 rounded-full bg-slate-100 p-3 text-slate-600 hover:bg-slate-200"
                aria-label="Fechar carteirinha"
              >
                ✕
              </button>
              <div className="p-6">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Sua carteirinha</h2>
                {user.carteirinhaUrl.endsWith('.pdf') ? (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600">A carteirinha está disponível como PDF. Abra em uma nova aba para apresentar.</p>
                    <a href={user.carteirinhaUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-amber-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white hover:bg-amber-800">
                      Abrir PDF
                    </a>
                  </div>
                ) : (
                  <img src={user.carteirinhaUrl} alt="Carteirinha da leitora" className="w-full rounded-3xl border border-slate-200 object-contain" />
                )}
              </div>
            </div>
          </div>
        )}
        <footer className="pt-8 text-center">
          <p className="text-xs text-slate-500">Acesso apenas para usuários logadas.</p>
        </footer>
      </div>
    </main>
  );
}
