'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const LogoutPage = () => {
  const { isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      if (isAuthenticated) {
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
      } else {
        // Se não estiver autenticado, redireciona para login
        router.push('/login');
      }
    };

    performLogout();
  }, [logout, router, isAuthenticated]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <div className="overflow-hidden p-0">
        <div className="grid p-0">
          <div className="p-6 text-center md:p-8">
            <p className="text-muted-foreground">{isLoading ? 'Aguarde...' : 'Saindo...'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutPage;
