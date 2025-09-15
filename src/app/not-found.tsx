'use client';

import { Button } from '@/components/ui/button';
import { useThemeHook } from '@/hooks/use-theme';
import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  const { theme, mounted } = useThemeHook();

  return (
    <div className="from-primary to-secondary text-primary-foreground flex h-full w-full flex-col items-center justify-center gap-15 bg-gradient-to-br p-10">
      <Image
        src={mounted && theme === 'dark' ? '/logo-d.webp' : '/logo-l.webp'}
        alt="Procontal Treinamentos"
        width={160}
        height={40}
        className="h-auto w-100"
        priority={true}
      />
      <div className="text-center">
        <h1 className="text-quaternary mb-4 text-3xl font-bold">Página Não Encontrada</h1>
        <p>Desculpe, a página que você está procurando não existe.</p>
      </div>
      <Button className="bg-quaternary text-quaternary-foreground hover:bg-tertiary/90 dark:bg-tertiary dark:hover:bg-quaternary/90 dark:text-tertiary-foreground transition-colors duration-300">
        <Link href="/" className="text-md p-6 font-bold">
          Voltar para a página inicial
        </Link>
      </Button>
    </div>
  );
}
