import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cadastro | Clube das Leitoras',
  description: 'Faça parte do nosso clube de leitura. Preencha seus dados para receber o acesso com carinho e começar a sua jornada literária conosco.',
  openGraph: {
    title: 'Cadastro | Clube das Leitoras',
    description: 'Faça parte do nosso clube de leitura. Preencha seus dados para receber o acesso com carinho e começar a sua jornada literária conosco.',
    url: '/cadastro',
    siteName: 'Clube das Leitoras',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Cadastro no Clube das Leitoras',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function CadastroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}