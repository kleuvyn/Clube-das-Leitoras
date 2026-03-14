'use client';

import { useAdmin } from '@/lib/admin-context';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, Users, LayoutDashboard, BookOpen, Vote, Sparkles, ShoppingBag, ExternalLink, Calendar, Mic, ImageIcon, Handshake, Feather } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const laranjaFolha = "var(--page-color)";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { logout, currentUser, isAdmin } = useAdmin();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document.getElementById('admin-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  const handleLogout = () => {
    logout();
    window.location.replace('/');
  };

  const menuSections = [
    {
      category: 'O Clube',
      items: [
        { href: '/admin/livro-do-mes', label: 'Livros do Mês', icon: BookOpen },
        { href: '/admin/dicas', label: 'Dicas da Gabi', icon: Sparkles },
        { href: '/admin/parcerias', label: 'Parcerias', icon: Handshake },
        { href: '/admin/empreendedoras', label: 'Empreendedoras', icon: ShoppingBag },
        { href: '/admin/escritoras', label: 'Escritoras', icon: Feather },
      ]
    },
    {
      category: 'Espaço de Leitura',
      items: [
        { href: '/admin/leitura', label: 'Caderno de Leitura', icon: BookOpen },
        { href: '/admin/rodaonline', label: 'Roda On-line', icon: Users },
        { href: '/admin/resenhas', label: 'Resenhas', icon: Sparkles },
        { href: '/admin/votacao', label: 'Votação', icon: Vote },
      ]
    },
    {
      category: 'Experiências & Agenda',
      items: [
        { href: '/admin/podcast', label: 'Podcast', icon: Mic },
        { href: '/admin/cronograma', label: 'Cronograma', icon: Calendar },
        { href: '/admin/cronograma/eventos', label: 'Encontros', icon: ImageIcon },
      ]
    },
    {
      category: 'Gestão',
      items: [
        { href: '/admin/colaboradores', label: 'Leitoras / Acessos', icon: Users },
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-alice" style={{ background: '#FDFCFB', color: 'var(--page-color-60)' }}>
      
      {menuOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-70 md:hidden" onClick={() => setMenuOpen(false)} />
      )}

      
      <aside className={`
        fixed md:static inset-y-0 left-0 z-80 md:z-0 md:w-72 bg-white border-r border-rose-50 flex flex-col
        transition-transform duration-300 transform ${menuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${menuOpen ? 'block' : 'hidden md:block'}
      `}>
        <div className="p-8 border-b border-rose-50">
          <Link href="/admin">
            <div className="flex items-center gap-3 mb-2 cursor-pointer">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: laranjaFolha }}>
                <LayoutDashboard size={18} />
              </div>
              <h1 className="font-serif text-xl italic text-slate-800">Clube Admin</h1>
            </div>
          </Link>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{currentUser?.name || 'Gerenciamento Editorial'}</p>
        </div>

        <nav className="flex-1 p-6 overflow-y-auto space-y-8">
          {menuSections.filter(s => isAdmin || s.category !== 'Gestão').map((section) => (
            <div key={section.category}>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 ml-4 opacity-30 text-slate-800">
                {section.category}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center gap-3 ${isActive ? 'font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                        style={{ color: isActive ? laranjaFolha : '' }}
                        onClick={() => setMenuOpen(false)}
                      >
                        <Icon size={16} opacity={isActive ? 1 : 0.4} />
                        {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-6 border-t border-orange-50">
          <Button onClick={handleLogout} variant="ghost" className="w-full justify-start gap-3 text-rose-400 hover:bg-rose-50 hover:text-rose-500 font-bold uppercase text-[10px] tracking-widest">
            <LogOut className="w-4 h-4" /> Sair
          </Button>
        </div>
      </aside>

      
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md border-b border-rose-50 p-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <h2 className="font-serif text-2xl italic text-slate-900">Painel de Curadoria</h2>
          </div>
          
          <Link href="/" target="_blank">
            <Button variant="outline" className="text-[10px] font-bold uppercase tracking-widest gap-2 border-rose-100 transition-all hover:bg-rose-50" style={{ color: laranjaFolha }}>
              Ver Site <ExternalLink size={14} />
            </Button>
          </Link>
        </header>

        <div id="admin-scroll" className="flex-1 animate-in fade-in slide-in-from-bottom-2 duration-500 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}