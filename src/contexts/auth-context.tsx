// src/contexts/auth-context.tsx
'use client';

import { loginGuard } from '@/lib/login-guard';
import { useRouter } from 'next/navigation';
import React, { createContext, useEffect, useState } from 'react';

type User = {
  id: string;
  name: string;
  email: string;
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false); // Nova proteção
  const router = useRouter();

  const login = async (email: string, password: string) => {
    // Proteção contra double submission
    if (isLoggingIn) {
      return;
    }

    if (!loginGuard.canAttemptLogin(email)) {
      return;
    }

    setIsLoggingIn(true);
    loginGuard.startLoginAttempt(email);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Nossa API não retorna dados do usuário no login, sempre buscar via /me
      // Aguardar um pouco para os cookies serem definidos
      setTimeout(async () => {
        try {
          const response = await fetch('/api/auth/me', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          const userData = await response.json();

          if (response.ok && userData.success) {
            setUser(userData.data);
            setIsAuthenticated(true);

            // Redirecionar após confirmar que o estado foi atualizado
            setTimeout(() => {
              router.push('/area-do-aluno');
            }, 100);
          } else {
            // Se falhou, tentar novamente
            setTimeout(() => {
              fetchUserData();
            }, 500);
          }
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
          // Tentar novamente após mais um tempo
          setTimeout(() => {
            fetchUserData();
          }, 500);
        }
      }, 200); // Delay para garantir que os cookies foram definidos
    } catch (error) {
      console.error('[AUTH] Login error:', error);
      throw error;
    } finally {
      setIsLoggingIn(false);
      loginGuard.endLoginAttempt(email);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('[AUTH] Logout error:', error);
    } finally {
      // Limpar estado local
      setUser(null);
      setIsAuthenticated(false);
      router.push('/login');
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.data);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('[AUTH] Fetch user error:', error);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        await fetchUserData();
      } catch (error) {
        console.error('[AUTH] Init error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
