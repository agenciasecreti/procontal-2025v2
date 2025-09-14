'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export default function ModeToggle() {
  const { setTheme } = useTheme();
  const [atualTheme, setAtualTheme] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    setAtualTheme(localStorage.getItem('theme') || 'light');
  }, [atualTheme]);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {
        const newTheme = atualTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        setAtualTheme(newTheme);
      }}
      className="relative overflow-hidden"
    >
      <span
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${atualTheme === 'light' ? 'opacity-100' : 'opacity-0'} `}
      >
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      </span>
      <span
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${atualTheme === 'dark' ? 'opacity-100' : 'opacity-0'} `}
      >
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      </span>
      <span className="sr-only">Tema</span>
    </Button>
  );
}
