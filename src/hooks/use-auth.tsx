'use client';

import { AuthUserType } from '@/types/auth';
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';

interface AuthContextType {
  user: AuthUserType | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  checkAuth: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isCheckingAuth = useRef(false);

  const checkAuth = async () => {
    // Previne múltiplas chamadas simultâneas
    if (isCheckingAuth.current) return;
    isCheckingAuth.current = true;
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });

      if (res.ok) {
        const response = await res.json();
        setUser(response.data);
        setError(null);
      } else {
        // Token expirado ou inválido - limpa o estado
        setUser(null);
        setError(null);
      }
    } catch (err) {
      setUser(null);
      setError('Erro de rede');
      console.error('Erro ao verificar autenticação:', err);
    } finally {
      setIsLoading(false);
      isCheckingAuth.current = false;
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
    setIsLoading(false);
  };

  // Verifica auth na inicialização
  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    checkAuth,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook para gerenciar autenticação do usuário.
 * Agora usa React Context para estado global sem cache persistente.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
