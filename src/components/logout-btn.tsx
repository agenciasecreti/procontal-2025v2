'use client';

import { useAuth } from '@/hooks/use-auth';
import { DoorClosed, DoorOpen } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from './ui/button';

export default function LogoutBtn({ text, className }: { text?: boolean; className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    // Só redireciona para login se estiver em uma rota protegida (admin)
    const isProtectedRoute = pathname?.startsWith('/admin');

    if (!isLoading && !isAuthenticated && isProtectedRoute) {
      // Se não estiver autenticado e estiver em rota protegida, redireciona para login
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logoutAll: true }),
      })
        .then(async (response) => {
          if (!response.ok)
            throw new Error((await response.json()).error.message || 'Erro ao fazer logout.');

          // Limpa os cookies de autenticação
          document.cookie = 'accessToken=; Max-Age=0; path=/';
          document.cookie = 'refreshToken=; Max-Age=0; path=/';

          // Limpa o estado de auth
          logout();

          // Redireciona para a página inicial ou de login
          // window.location.href = '/';

          router.push('/login');
        })
        .catch((error) => {
          console.error('Erro ao fazer logout:', error);
        });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return isLoading ? (
    <></>
  ) : isAuthenticated ? (
    <Button
      onClick={handleLogout}
      variant={'ghost'}
      size={text ? 'default' : 'icon'}
      aria-label="Sair"
      className={`hover:text-primary ${className}`}
    >
      <DoorOpen className="hover:text-primary mr-2 h-4 w-4" /> {text && 'Sair'}
    </Button>
  ) : (
    <Button
      variant={'ghost'}
      size={text ? 'default' : 'icon'}
      aria-label="Entrar"
      className={`hover:text-primary ${className}`}
    >
      <Link href="/login" className="flex items-center">
        <DoorClosed className="hover:text-primary mr-2 h-4 w-4" /> {text && 'Entrar'}
      </Link>
    </Button>
  );
}
