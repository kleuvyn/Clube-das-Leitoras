"use client";

import type React from "react";
import { Alice, Inter } from "next/font/google"; 
import "./globals.css";
import Image from "next/image";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { Analytics } from '@vercel/analytics/react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};
import { SpeedInsights } from '@vercel/speed-insights/next';

const alice = Alice({ 
  weight: "400",
  subsets: ["latin"],
  variable: '--font-alice' 
});

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();


  
  const isAuthPage = pathname === "/login" || pathname?.startsWith("/admin");

  
  const laranjaFolha = "#B06543";
  
  const routeColors: Record<string, string> = {
    "/admin": "#B04D4A", 
    "/": "#B04D4A", 
    "/cronograma": "#967BB6", 
    "/dicas": "#5B7C99", 
    "/empreendedoras": "#967BB6", 
    "/eventos": "#CC7222", 
    "/livro-do-mes": "#8C7A66", 
    "/login": "#F4F1EE", 
    "/parcerias": "#B04D4A", 
    "/podcast": "#C08081", 
    "/resenhas": "#E9C46A", 
    "/rodaonline": "#4F5E46", 
    "/votacao": "#B06543", 
  };

  
  const pageColor = (() => {
    if (!pathname) return laranjaFolha;
    for (const route of Object.keys(routeColors)) {
      if (route === "/" && pathname === "/") return routeColors[route];
      if (route !== "/" && pathname.startsWith(route)) return routeColors[route];
    }
    return laranjaFolha;
  })();

  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: any) => {
      event.preventDefault();
      setInstallPromptEvent(event);
      setShowInstallButton(true);
    };

    const handleAppInstalled = () => {
      setInstallPromptEvent(null);
      setShowInstallButton(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    // Mecanismo desejado: sair da sessão quando o usuário fecha a aba/janela
    // (potencialmente forçando re-login em nova aba/instância do navegador).
    // É baseado em `beforeunload` e `keepalive`, não garante 100% noéricas em todos browsers.
    const handleBeforeUnload = () => {
      try {
        if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
          navigator.sendBeacon('/api/auth/logout');
        } else {
          // keepalive ajuda a executar a requisição em unload
          fetch('/api/auth/logout', { method: 'POST', keepalive: true });
        }
      } catch {
        // Ignore errors: é apenas tentativa de garantir logout.
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    async function setupAdvancedPWA() {
      if (!('serviceWorker' in navigator)) return;

      try {
        const registration = await navigator.serviceWorker.ready;

        // Periodic Sync (onde suportado)
        if ('periodicSync' in registration) {
          try {
            // 24h interval
            await (registration as any).periodicSync.register('clube-leitoras-periodic-sync', {
              minInterval: 24 * 60 * 60 * 1000,
            });
          } catch (error) {
            console.warn('Periodic sync não disponível:', error);
          }
        }

        // Background Sync (offline que sincroniza quando voltar)
        if ('sync' in registration) {
          try {
            await (registration as any).sync.register('clube-leitoras-background-sync');
          } catch (error) {
            console.warn('Background sync não disponível:', error);
          }
        }

        // Push Notifications (permissão se suportado)
        if ('Notification' in window && Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          if (permission === 'granted' && 'PushManager' in window) {
            try {
              // substitua pela chave VAPID real na produção
              const vapidPublicKey = 'BBOF2...YOUR_PUBLIC_KEY_HERE...';
              const convertedKey = Uint8Array.from(window.atob(vapidPublicKey), (c) => c.charCodeAt(0));
              await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedKey,
              });
            } catch (error) {
              console.warn('Inscrição em Push não foi possível:', error);
            }
          }
        }
      } catch (err) {
        console.error('SW ready failed', err);
      }
    }

    setupAdvancedPWA();
  }, []);


  const onInstallClick = async () => {
    if (!installPromptEvent) return;
    installPromptEvent.prompt();
    const choiceResult = await installPromptEvent.userChoice;
    if (choiceResult.outcome === "accepted") {
      setShowInstallButton(false);
      setInstallPromptEvent(null);
    }
  };

  
  function hexToRgba(hex: string, alpha: number) {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0,2), 16);
    const g = parseInt(h.substring(2,4), 16);
    const b = parseInt(h.substring(4,6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  return (
    <html lang="pt-BR" className={`${alice.variable} ${inter.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content={pageColor} />

        {/* PWA icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-180.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Clube das Leitoras" />

        {/* Social preview (compartilhamento) */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Clube das Leitoras" />
        <meta property="og:description" content="Clube de leitura em Brasília com encontros, dicas e livro do mês." />
        <meta property="og:image" content="https://clubedasleitoras.com.br/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content="https://clubedasleitoras.com.br" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Clube das Leitoras" />
        <meta name="twitter:description" content="Clube de leitura em Brasília com encontros, dicas e livro do mês." />
        <meta name="twitter:image" content="https://clubedasleitoras.com.br/og-image.png" />
      </head>
      <body
        className="font-alice antialiased"
        style={{
          
          ["--accent" as any]: pageColor,
          ["--page-color" as any]: pageColor,
          ["--page-color-05" as any]: hexToRgba(pageColor, 0.05),
          ["--page-color-10" as any]: hexToRgba(pageColor, 0.10),
          ["--page-color-15" as any]: hexToRgba(pageColor, 0.15),
          ["--page-color-20" as any]: hexToRgba(pageColor, 0.20),
          ["--page-color-30" as any]: hexToRgba(pageColor, 0.30),
          ["--page-color-40" as any]: hexToRgba(pageColor, 0.40),
          ["--page-color-60" as any]: hexToRgba(pageColor, 0.60),
          background: 'var(--page-color-05)',
          color: 'var(--page-color-60)'
        }}
      >
        
        <div className="fixed inset-0 z-[-1] opacity-[0.06] pointer-events-none flex items-center justify-center scale-125">
          <Image src="/logo.png" alt="Logo" width={900} height={900} priority className="object-contain max-w-275 opacity-100" />
        </div>

        
        {!isAuthPage && <Navigation />}
        
        <main className="min-h-screen relative z-[1]">
          {children}
        </main>
        
        
        {!isAuthPage && <Footer />}

        {showInstallButton && !isAuthPage && (
          <div className="fixed bottom-5 right-5 z-50">
            <button
              onClick={onInstallClick}
              className="rounded-full bg-red-600 px-5 py-3 text-sm text-white shadow-lg transition hover:bg-red-700"
            >
              Instalar Clube das Leitoras
            </button>
          </div>
        )}
        
        <Toaster richColors position="top-right" />
        <Analytics />
        <SpeedInsights />
        
      </body>
    </html>
  );
}