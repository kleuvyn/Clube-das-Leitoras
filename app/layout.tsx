import type { Metadata } from "next";
import { Alice, Inter } from "next/font/google";
import "./globals.css";
import RootClient from "./RootClient";

const alice = Alice({
  weight: "400",
  subsets: ["latin"],
  variable: '--font-alice',
});

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://clubedasleitoras.com.br";

export const metadataBase = new URL(siteUrl);

export const metadata: Metadata = {
  title: {
    default: "Clube das Leitoras",
    template: "%s | Clube das Leitoras",
  },
  description:
    "Clube das Leitoras: leituras compartilhadas, encontros em Brasília, resenhas e atividades culturais.",
  metadataBase: new URL(siteUrl),
  applicationName: "Clube das Leitoras",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: [
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/icon-180.png", sizes: "180x180" }],
    other: [{ rel: "manifest", url: "/manifest.webmanifest" }],
  },
  openGraph: {
    title: "Clube das Leitoras",
    description:
      "Clube de leitura em Brasília com encontros, dicas e livro do mês.",
    url: siteUrl,
    siteName: "Clube das Leitoras",
    type: "website",
    locale: "pt_BR",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Clube das Leitoras",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Clube das Leitoras",
    description:
      "Clube de leitura em Brasília com encontros, dicas e livro do mês.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${alice.variable} ${inter.variable}`}>
      <body>
        <RootClient>{children}</RootClient>
      </body>
    </html>
  );
}
