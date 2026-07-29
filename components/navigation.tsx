"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, User, Menu, ChevronDown, X, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

const terracotaDoLivro = "#D96D64"; 
const marromTerra = "#4A3F35";
const begePapel = "#FDFBF9";

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { count, setIsCartOpen } = useCart();
  const isLojinhaPage = pathname?.startsWith("/lojinha");
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
      label: 'CONEXÕES',
      items: [
        { label: 'Livros do Mês', href: '/livro-do-mes' },
        { label: 'Dicas da Gabi', href: '/dicas' },
        { label: 'Nossas Parcerias', href: '/parcerias' },
        { label: 'Empreendedoras', href: '/empreendedoras' },
        { label: 'Escritoras', href: '/escritoras' }
      ]
    },
    {
      id: 'conteudo',
      label: 'VIVÊNCIAS DE LEITURA',
      items: [
        // { label: 'Caderno: Mulheres que Correm com os Lobos', href: '/leitura/lobos' },
        { label: 'Roda de Vozes', href: '/roda-vozes' },
         { label: 'Roda On-line', href: '/rodaonline' },
        { label: 'Pós-Roda', href: '/resenhas' },
        { label: 'Votação do Mês', href: '/votacao' }

      ]
    },
    {
      id: 'agenda',
      label: 'MOMENTOS DO CLUBE',
      items: [
        { label: 'Sorteios do Clube', href: '/sorteios' },
        // { label: 'Podcast', href: '/podcast' },
        { label: 'Cronograma Mensal', href: '/cronograma' },
        { label: 'Galeria de Encontros', href: '/eventos' },
        { label: 'Carteirinha', href: '/carteirinha' }
      ]
    }
  ];

  const lojinhaCategorias = [
    {
      id: 'lojinha',
      label: 'Lojinha',
      items: [
        { label: 'Produtos', href: '/lojinha#produtos' },
        { label: 'O Clube', href: '/' }
      ]
    }
  ];

  const menuVisible = isLojinhaPage
    ? lojinhaCategorias
    : (isLogged ? categorias : categorias.filter(cat => cat.id === 'clube'));

  return (
    <nav className={`fixed top-0 left-0 right-0 z-100 transition-all duration-700 ${
      scrolled || isMenuOpen ? "bg-white/95 backdrop-blur-md py-4 border-b border-[#E8E2DE] shadow-sm" : "bg-transparent py-8"
    }`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between relative">
        
        {/* LOGO (Esquerda) */}
        <Link href="/" className="flex items-center gap-4 group shrink-0" onClick={() => setIsMenuOpen(false)}>
          <div className="relative w-16 h-16 shrink-0">
            <Image 
              src="/logo-clube-leitoras.png" 
              alt="Logo Clube das Leitoras" 
              width={64}
              height={64}
              style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%' }}
              className="object-contain transition-transform group-hover:scale-105"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-alice text-2xl leading-none whitespace-nowrap" style={{ color: marromTerra }}>
              Clube das <span className="italic" style={{ color: terracotaDoLivro }}>Leitoras</span>
            </span>
            {isLojinhaPage ? (
              <span className="font-inter text-[9px] uppercase tracking-[0.4em] mt-1 font-bold whitespace-nowrap" style={{ color: marromTerra, opacity: 0.6 }}>
                LOJINHA · BRASÍLIA · DF
              </span>
            ) : (
              <span className="font-inter text-[9px] uppercase tracking-[0.4em] mt-1 font-bold whitespace-nowrap" style={{ color: marromTerra, opacity: 0.6 }}>
                BRASÍLIA · DF
              </span>
            )}
          </div>
        </Link>

        {/* NAVEGAÇÃO CENTRALIZADA (Menu Principal) */}
        <div className="hidden lg:flex items-center justify-center flex-1 px-8">
          <div className="flex items-center gap-10">
            {isLojinhaPage ? (
              <div className="flex items-center gap-12">
                <a 
                  href="#produtos" 
                  className="font-inter text-[10px] font-bold uppercase tracking-[0.32em] transition-all hover:opacity-60 whitespace-nowrap"
                  style={{ color: marromTerra }}
                >
                  PRODUTOS
                </a>
                <Link 
                  href="/" 
                  className="font-inter text-[10px] font-bold uppercase tracking-[0.32em] transition-all hover:opacity-60 whitespace-nowrap"
                  style={{ color: marromTerra }}
                >
                  O CLUBE
                </Link>
              </div>
            ) : (
              <div className="flex gap-12">
                {menuVisible.map((cat) => (
                  <div 
                    key={cat.id}
                    className="relative group pt-2 pb-6"
                    onMouseEnter={() => setOpenDropdown(cat.id)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button 
                      className="flex items-center gap-2 font-inter text-[10px] font-bold uppercase tracking-[0.32em] transition-all hover:opacity-60 whitespace-nowrap"
                      style={{ color: marromTerra }}
                    >
                      {cat.label}
                      <ChevronDown size={10} className={`transition-transform duration-300 ${openDropdown === cat.id ? 'rotate-180' : ''}`} />
                    </button>

                    <div className={`absolute top-[calc(100%-1px)] left-0 w-60 border border-[#E8E2DE] shadow-2xl rounded-sm p-6 transition-all duration-300 origin-top-left ${
                      openDropdown === cat.id ? 'opacity-100 scale-100 visible translate-y-0' : 'opacity-0 scale-95 invisible'
                    }`} style={{ backgroundColor: begePapel }}>
                      <div className="space-y-4">
                        {cat.items.map((item) => (
                          <Link 
                            key={item.href} 
                            href={item.href}
                            className="block text-[11px] font-medium transition-all hover:translate-x-2 italic border-b border-transparent hover:border-azul-curadoria pb-1"
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
            )}
          </div>
        </div>

        {/* ELEMENTOS DA DIREITA (SACOLA/USUÁRIO) */}
        {!isMenuOpen && (
          <div className="hidden lg:flex items-center gap-4 shrink-0">
            <div className="h-8 w-px bg-[#E8E2DE] mx-1" />
            
            <div className="flex items-center gap-3">
              {isLojinhaPage && (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="font-inter flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-white px-5 py-2.5 rounded-full shadow-lg hover:brightness-110 active:scale-95 transition-all whitespace-nowrap"
                  style={{ backgroundColor: '#5B7C99' }}
                >
                  <ShoppingBag size={12} /> SACOLA ({count})
                </button>
              )}

              {isLogged ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/usuario"
                    className="font-inter text-[9px] font-bold uppercase tracking-widest text-amber-800 px-3 py-2 rounded-full border border-amber-200 hover:bg-amber-50 whitespace-nowrap"
                  >
                    Meu Perfil
                  </Link>
                  <Link
                    href="/lojinha"
                    className="font-inter text-[9px] font-bold uppercase tracking-widest text-white px-4 py-2 rounded-full shadow-xl hover:brightness-110 active:scale-95 transition-all whitespace-nowrap min-w-max"
                    style={{ backgroundColor: '#5B7C99' }}
                  >
                    Lojinha
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="font-inter flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-white px-4 py-2 rounded-full shadow-xl hover:brightness-110 active:scale-95 transition-all whitespace-nowrap"
                    style={{ backgroundColor: terracotaDoLivro }}
                  >
                    SAIR
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                   <Link
                    href="/lojinha"
                    className="font-inter text-[9px] font-bold uppercase tracking-widest text-white px-5 py-2.5 rounded-full shadow-xl hover:brightness-110 active:scale-95 transition-all whitespace-nowrap min-w-max"
                    style={{ backgroundColor: '#5B7C99' }}
                  >
                    LOJINHA
                  </Link>
                  <Link 
                    href="/login" 
                    className="font-inter flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-white px-6 py-2.5 rounded-full shadow-xl hover:brightness-110 active:scale-95 transition-all whitespace-nowrap min-w-max"
                    style={{ backgroundColor: terracotaDoLivro }}
                  >
                    <User size={12} /> ENTRAR
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* BOTAO MOBILE */}
        <div className="lg:hidden ml-auto">
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

            <div className="pt-4 flex flex-col gap-4">
              {isLogged ? (
                <div className="space-y-3">
                  {userName && (
                    <p className="text-center font-alice italic text-sm" style={{ color: marromTerra }}>
                      Olá, {userName}!
                    </p>
                  )}
                  <Link
                    href="/usuario"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full inline-flex items-center justify-center gap-2 font-inter text-[10px] font-bold uppercase tracking-widest text-amber-700 py-3 rounded-full border border-amber-200 hover:bg-amber-50 whitespace-nowrap min-w-max"
                  >
                    <User size={14} /> Meu Perfil
                  </Link>
                  <Link
                    href="/lojinha"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 font-inter text-[10px] font-bold uppercase tracking-widest text-white py-4 rounded-full shadow-xl hover:brightness-110 active:scale-95 transition-all whitespace-nowrap min-w-max"
                    style={{ backgroundColor: "#5B7C99" }}
                  >
                    <ShoppingBag size={14} /> Lojinha
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 font-inter text-[10px] font-bold uppercase tracking-widest text-white py-4 rounded-full shadow-lg whitespace-nowrap"
                    style={{ backgroundColor: terracotaDoLivro }}
                  >
                    <LogOut size={14} /> Sair da Conta
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link
                    href="/lojinha"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 font-inter text-[10px] font-bold uppercase tracking-widest text-white py-4 rounded-full shadow-xl hover:brightness-110 active:scale-95 transition-all whitespace-nowrap min-w-max"
                    style={{ backgroundColor: "#5B7C99" }}
                  >
                    <ShoppingBag size={14} /> LOJINHA
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 font-inter text-[10px] font-bold uppercase tracking-widest text-white py-4 rounded-full shadow-lg whitespace-nowrap min-w-max"
                    style={{ backgroundColor: terracotaDoLivro }}
                  >
                    <User size={14} /> Entrar no Clube
                  </Link>
                </div>
              )}
            </div>

            {isLojinhaPage && (
              <div className="pt-2 border-t border-[#E8E2DE]">
                 <button
                  onClick={() => { setIsCartOpen(true); setIsMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 font-inter text-[10px] font-bold uppercase tracking-[0.2em] text-white py-4 rounded-full shadow-lg whitespace-nowrap"
                  style={{ backgroundColor: '#5B7C99' }}
                >
                  <ShoppingBag size={14} /> SACOLA ({count})
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}