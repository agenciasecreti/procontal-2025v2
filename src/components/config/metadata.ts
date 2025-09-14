import type { Metadata, Viewport } from 'next';

const metaConfig: Metadata = {
  title: 'Procontal Treinamentos - Eleve Seu Potencial',
  description:
    'Procontal Treinamentos oferece cursos presenciais nas áreas contábil, fiscal, financeira e de gestão com foco prático e qualificação profissional.',
  keywords: [
    'cursos contábeis',
    'cursos fiscais',
    'curso analista fiscal',
    'curso analista contábil',
    'curso gestão financeira',
    'curso presencial contabilidade',
    'cursos para empresas',
    'qualificação profissional',
    'treinamento fiscal',
    'capacitação contábil',
    'Procontal Treinamentos',
  ],
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Procontal Treinamentos - Eleve Seu Potencial',
    description:
      'Procontal Treinamentos oferece cursos presenciais nas áreas contábil, fiscal, financeira e de gestão com foco prático e qualificação profissional.',
    url: 'https://procontaltreinamentos.com.br',
    siteName: 'Procontal Treinamentos',
    images: [
      {
        url: 'https://procontaltreinamentos.com.br/og-image.webp',
        width: 1200,
        height: 630,
        alt: 'Procontal Treinamentos',
      },
    ],
    locale: 'pt-BR',
    type: 'website',
  },
};

// Viewport deve ser exportado separadamente no Next.js 14+
export const viewportConfig: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default metaConfig;
