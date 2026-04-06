"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

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

function getPageColor(pathname?: string | null) {
  if (!pathname) return laranjaFolha;
  for (const route of Object.keys(routeColors)) {
    if (route === "/" && pathname === "/") return routeColors[route];
    if (route !== "/" && pathname.startsWith(route)) return routeColors[route];
  }
  return laranjaFolha;
}

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function RootClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/nova-senha" || pathname?.startsWith("/admin");
  const [pageColor, setPageColor] = useState(laranjaFolha);
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    setPageColor(getPageColor(pathname));
  }, [pathname]);

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
    if (!('serviceWorker' in navigator)) return;

    async function setupAdvancedPWA() {
      try {
        const registration = await navigator.serviceWorker.ready;

        if ('periodicSync' in registration) {
          try {
            await (registration as any).periodicSync.register('clube-leitoras-periodic-sync', {
              minInterval: 24 * 60 * 60 * 1000,
            });
          } catch (error) {
            console.warn('Periodic sync não disponível:', error);
          }
        }

        if ('sync' in registration) {
          try {
            await (registration as any).sync.register('clube-leitoras-background-sync');
          } catch (error) {
            console.warn('Background sync não disponível:', error);
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

  return (
    <div
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
        background: '#F7F2EE',
        color: '#3D2B1F',
      }}
    >
      <div className="fixed inset-0 z-[-1] opacity-[0.06] pointer-events-none flex items-center justify-center scale-125">
        <Image src="/logo.png" alt="Logo" width={900} height={900} className="object-contain max-w-275 opacity-100" />
      </div>

      {!isAuthPage && <Navigation />}

      <main className="min-h-screen relative z-1 w-full">
        {children}
      </main>

      {!isAuthPage && <Footer />}

      {showInstallButton && !isAuthPage && (
        <div className="fixed bottom-5 right-5 z-50">
          <button
            onClick={onInstallClick}
            style={{ backgroundColor: pageColor }}
            className="rounded-full px-6 py-3 text-sm text-white shadow-lg transition hover:brightness-110 font-bold font-inter uppercase tracking-widest"
          >
            Instalar Clube das Leitoras
          </button>
        </div>
      )}

      <Toaster richColors position="top-right" />
      <Analytics />
      <SpeedInsights />
    </div>
  );
}
