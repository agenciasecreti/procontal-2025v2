// src/lib/login-guard.ts

// Mapa para rastrear tentativas de login ativas
const activeLoginAttempts = new Map<string, boolean>();

export function createLoginGuard() {
  return {
    // Verificar se já existe uma tentativa ativa para este email
    canAttemptLogin: (email: string): boolean => {
      const isActive = activeLoginAttempts.get(email);
      return !isActive;
    },

    // Marcar tentativa como ativa
    startLoginAttempt: (email: string): void => {
      console.log('[LOGIN GUARD] Iniciando tentativa para:', email);
      activeLoginAttempts.set(email, true);
    },

    // Finalizar tentativa
    endLoginAttempt: (email: string): void => {
      console.log('[LOGIN GUARD] Finalizando tentativa para:', email);
      activeLoginAttempts.delete(email);
    },

    // Limpar todas as tentativas (útil para debug)
    clearAllAttempts: (): void => {
      console.log('[LOGIN GUARD] Limpando todas as tentativas ativas');
      activeLoginAttempts.clear();
    },

    // Debug - listar tentativas ativas
    getActiveAttempts: (): string[] => {
      return Array.from(activeLoginAttempts.keys());
    },
  };
}

// Instância global
export const loginGuard = createLoginGuard();
