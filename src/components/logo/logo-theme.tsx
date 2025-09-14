'use client';

import { useThemeHook } from '@/hooks/use-theme';
import Image from 'next/image';

export const LogoTheme = () => {
  const { theme } = useThemeHook();

  return (
    <Image
      src={`${theme === 'light' ? '/logo-1.webp' : '/logo-3.webp'}`}
      alt="Logo Procontal Treinamentos"
      width={150}
      height={50}
      className="mx-auto my-4"
    />
  );
};
