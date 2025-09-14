'use client';

import Link from 'next/link';
import { Geist, Geist_Mono } from 'next/font/google';
import { Button } from '@/components/ui/button';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function NotFound() {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className={`antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        ></ThemeProvider>
        <div className="bg-background flex min-h-screen flex-col items-center justify-center">
          {process.env.NEXT_PUBLIC_SITE_TITLE}
          <div className="text-center">
            <h1 className="text-quaternary mb-4 text-3xl font-bold">Página Não Encontrada</h1>
            <p>Desculpe, a página que você está procurando não existe.</p>
          </div>
          <Link href="/" className="text-md p-6 font-bold">
            <Button variant="secondary" className="mt-6">
              Voltar para o início
            </Button>
          </Link>
        </div>
      </body>
    </html>
  );
}
