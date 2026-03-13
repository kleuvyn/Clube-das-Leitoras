"use client";

import type React from "react";
import { Alice, Inter } from "next/font/google"; 
import "./globals.css";
import Image from "next/image";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Toaster } from "sonner";

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

  useEffect(() => {
    try {
      const hasSession = localStorage.getItem('clube-sessao');
      if (!hasSession) {
        localStorage.setItem('clube-sessao', 'public');
      }
    } catch {}
  }, []);

  
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
        <link rel="manifest" href="/manifest.webmanifest" />
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
        
        <div className="fixed inset-0 z-0 opacity-[0.06] pointer-events-none flex items-center justify-center scale-125">
          <Image src="/logo.png" alt="Logo" width={900} height={900} priority className="object-contain max-w-275 opacity-100" />
        </div>

        
        {!isAuthPage && <Navigation />}
        
        <main className="min-h-screen">
          {children}
        </main>
        
        
        {!isAuthPage && <Footer />}
        
        <Toaster richColors position="top-right" />
        
      </body>
    </html>
  );
}