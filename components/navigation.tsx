"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, User, Menu, ChevronDown, X } from "lucide-react";

const terracotaDoLivro = "#D96D64"; 
const marromTerra = "#4A3F35";
const begePapel = "#FDFBF9";

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isLogged, setIsLogged] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  
  
  useEffect(() => {
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
      return match ? decodeURIComponent(match[1]) : null;
    };
    const email = getCookie('clube-user-email');
    setIsLogged(!!email);
    const nome = getCookie('clube-user-name');
    setUserName(nome ? nome.split(' ')[0] : null);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setIsLogged(false);
    setIsMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const categorias = [
    {
      id: 'clube',
      label: 'O Clube',
      items: [
        { label: 'Livros do Mês', href: '/livro-do-mes' },
        { label: 'Dicas da Gabi', href: '/dicas' },
        { label: 'Nossas Parcerias', href: '/parcerias' },
        { label: 'Empreendedoras', href: '/empreendedoras' },
        //{ label: 'Escritoras', href: '/escritoras' }
      ]
    },
    {
      id: 'conteudo',
      label: 'Espaço de Leitura',
      items: [
        { label: 'Caderno: Mulheres que Correm com os Lobos', href: '/leitura/lobos' },
         { label: 'Roda On-line', href: '/rodaonline' },
        { label: 'Resenhas Exclusivas', href: '/resenhas' },
        { label: 'Votação do Mês', href: '/votacao' }

      ]
    },
    {
      id: 'agenda',
      label: 'Experiências & Agenda',
      items: [
        { label: 'Podcast', href: '/podcast' },
        { label: 'Cronograma Mensal', href: '/cronograma' },
        { label: 'Galeria de Encontros', href: '/eventos' }
      ]
    }
  ];

  const menuVisible = isLogged 
    ? categorias 
    : categorias.filter(cat => cat.id === 'clube');

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ${
      scrolled || isMenuOpen ? "bg-white/95 backdrop-blur-md py-4 border-b border-[#E8E2DE] shadow-sm" : "bg-transparent py-8"
    }`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        
        
        <Link href="/" className="flex items-center gap-4 group" onClick={() => setIsMenuOpen(false)}>
          <div className="relative w-16 h-16 shrink-0">
            <Image 
              src="/logo-clube-leitoras.png" 
              alt="Logo Clube das Leitoras" 
              fill
              className="object-contain transition-transform group-hover:scale-105" 
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-alice text-2xl leading-none" style={{ color: marromTerra }}>
              Clube das <span className="italic" style={{ color: terracotaDoLivro }}>Leitoras</span>
            </span>
            <span className="font-inter text-[9px] uppercase tracking-[0.4em] mt-1 font-bold" style={{ color: marromTerra, opacity: 0.6 }}>
              Brasília • DF
            </span>
          </div>
        </Link>

        
        <div className="hidden lg:flex items-center gap-8">
          <div className="flex gap-10">
            {menuVisible.map((cat) => (
              <div 
                key={cat.id}
                className="relative group py-2"
                onMouseEnter={() => setOpenDropdown(cat.id)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button 
                  className="flex items-center gap-1 font-inter text-[10px] font-bold uppercase tracking-widest transition-all hover:opacity-60"
                  style={{ color: marromTerra }}
                >
                  {cat.label}
                  <ChevronDown size={10} className={`transition-transform duration-300 ${openDropdown === cat.id ? 'rotate-180' : ''}`} />
                </button>

                <div className={`absolute top-full left-0 w-60 border border-[#E8E2DE] shadow-2xl rounded-sm p-6 transition-all duration-300 origin-top-left ${
                  openDropdown === cat.id ? 'opacity-100 scale-100 visible translate-y-2' : 'opacity-0 scale-95 invisible'
                }`} style={{ backgroundColor: begePapel }}>
                  <div className="space-y-4">
                    {cat.items.map((item) => (
                      <Link 
                        key={item.href} 
                        href={item.href}
                        className="block text-[11px] font-medium transition-all hover:translate-x-2 italic border-b border-transparent hover:border-[#D96D64] pb-1"
                        style={{ color: marromTerra }}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="h-8 w-px bg-[#E8E2DE] mx-2" />
          
          {isLogged ? (
            <div className="flex items-center gap-3">
              {userName && (
                <span className="font-alice italic text-sm" style={{ color: marromTerra }}>
                  Olá, {userName}!
                </span>
              )}
              <button
                onClick={handleLogout}
                className="font-inter flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white px-8 py-3.5 rounded-full shadow-xl hover:brightness-110 active:scale-95 transition-all"
                style={{ backgroundColor: terracotaDoLivro }}
              >
                <LogOut size={14} /> Sair
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="font-inter flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white px-8 py-3.5 rounded-full shadow-xl hover:brightness-110 active:scale-95 transition-all"
              style={{ backgroundColor: terracotaDoLivro }}
            >
              <User size={14} /> Entrar
            </Link>
          )}
        </div>

        
        <div className="lg:hidden">
           <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{ color: marromTerra }}
            className="p-2"
           >
            {isMenuOpen ? <X size={28}/> : <Menu size={28}/>}
           </button>
        </div>
      </div>

      
      {isMenuOpen && (
        <div 
          className="lg:hidden absolute top-full left-0 w-full border-t border-[#E8E2DE] shadow-2xl overflow-y-auto max-h-[80vh]"
          style={{ backgroundColor: begePapel }}
        >
          <div className="p-8 space-y-8">
            {menuVisible.map((cat) => (
              <div key={cat.id} className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50" style={{ color: marromTerra }}>
                  {cat.label}
                </h3>
                <div className="flex flex-col gap-4 pl-2">
                  {cat.items.map((item) => (
                    <Link 
                      key={item.href} 
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="text-lg font-alice italic border-l-2 border-transparent pl-2 hover:border-[#D96D64]"
                      style={{ color: marromTerra }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-4">
              {isLogged ? (
                <div className="space-y-3">
                  {userName && (
                    <p className="text-center font-alice italic text-sm" style={{ color: marromTerra }}>
                      Olá, {userName}!
                    </p>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 font-inter text-[10px] font-bold uppercase tracking-widest text-white py-4 rounded-full shadow-lg"
                    style={{ backgroundColor: terracotaDoLivro }}
                  >
                    <LogOut size={14} /> Sair da Conta
                  </button>
                </div>
              ) : (
                <Link 
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 font-inter text-[10px] font-bold uppercase tracking-widest text-white py-4 rounded-full shadow-lg"
                  style={{ backgroundColor: terracotaDoLivro }}
                >
                  <User size={14} /> Entrar no Clube
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}