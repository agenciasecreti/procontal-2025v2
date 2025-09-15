'use client';

import { useTheme as useNextTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function useThemeHook() {
  const { theme, setTheme, systemTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Evita problemas de hidratação retornando um valor padrão até o componente ser montado
  if (!mounted) {
    return {
      theme: 'light',
      setTheme,
      systemTheme: 'light',
      mounted: false,
    };
  }

  const currentTheme = theme === 'system' ? systemTheme : theme;

  return {
    theme: currentTheme,
    setTheme,
    systemTheme,
    mounted: true,
  };
}
