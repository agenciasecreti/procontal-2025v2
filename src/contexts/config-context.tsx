'use client';

import { ConfigContextType, ConfigProviderProps, SiteConfig } from '@/types/config';
import { createContext, useContext, useEffect, useState } from 'react';

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children, initialConfig = {} }: ConfigProviderProps) {
  const [config, setConfig] = useState<SiteConfig>(initialConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError(null);

      // Normaliza a URL base para evitar problemas de CORS
      const baseUrl =
        typeof window !== 'undefined'
          ? window.location.origin
          : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';

      const response = await fetch(`${baseUrl}/api/admin/config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        const normalizedConfig: SiteConfig = {};
        result?.data.map((item: { key: string; value: string }) => {
          normalizedConfig[item.key] = item.value;
        });
        setConfig(normalizedConfig);
        // console.log('Configurações carregadas:', normalizedConfig);
      } else {
        throw new Error(result.error || 'Erro ao carregar configurações');
      }
    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');

      // Em caso de erro, usa configurações padrão
      setConfig({
        'site.title': process.env.NEXT_PUBLIC_SITE_NAME || '',
        'site.description': process.env.NEXT_PUBLIC_SITE_DESCRIPTION || '',
        'contact.whatsapp': process.env.NEXT_PUBLIC_CONTACT_WHATSAPP || '',
        'contact.phone': process.env.NEXT_PUBLIC_CONTACT_PHONE || '',
        'contact.email': process.env.NEXT_PUBLIC_CONTACT_EMAIL || '',
        ...initialConfig,
      });
    } finally {
      setLoading(false);
    }
  };

  const getConfig = <T = string | number | boolean,>(key: string, defaultValue?: T): T => {
    const value = config[key];
    if (value === undefined) {
      return defaultValue as T;
    }
    return value as T;
  };

  const refreshConfig = async () => {
    await fetchConfig();
  };

  useEffect(() => {
    fetchConfig();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const contextValue: ConfigContextType = {
    config,
    loading,
    error,
    getConfig,
    refreshConfig,
  };

  return <ConfigContext.Provider value={contextValue}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig deve ser usado dentro de um ConfigProvider');
  }
  return context;
}

// Hook específico para pegar uma configuração
export function useAdminConfig<T = string>(key: string, defaultValue?: T): T {
  const { getConfig } = useConfig();
  return getConfig(key, defaultValue);
}

// Hook para configurações do site
export function useSiteConfig() {
  const { getConfig } = useConfig();

  return {
    title: getConfig('site.title', process.env.NEXT_PUBLIC_SITE_NAME) as string,
    description: getConfig('site.description', process.env.NEXT_PUBLIC_SITE_DESCRIPTION) as string,
    url: getConfig('site.url', process.env.NEXT_PUBLIC_SITE_URL) as string,
    keywords: getConfig('site.keywords', process.env.NEXT_PUBLIC_SITE_KEYWORDS) as string,
    category: getConfig('site.category', process.env.NEXT_PUBLIC_SITE_CATEGORY) as string,
  };
}

// Hook para configurações de tema
export function useThemeConfig() {
  const { getConfig } = useConfig();

  return {
    defaultTheme: getConfig('ui.theme.default', 'light') as string,
    animationEnabled: getConfig('ui.animation.enabled', true) as boolean,
    logoLight: getConfig('assets.logo.light', '/logo-l.webp') as string,
    logoDark: getConfig('assets.logo.dark', '/logo-d.webp') as string,
  };
}

// Hook para informações de contato
export function useContactConfig() {
  const { getConfig } = useConfig();

  return {
    phone: getConfig('contact.phone', '') as string,
    email: getConfig('contact.email', '') as string,
    whatsapp: getConfig('contact.whatsapp', '') as string,
    address: getConfig('contact.address', '') as string,
  };
}

// Hook para redes sociais
export function useSocialConfig() {
  const { getConfig } = useConfig();

  return {
    facebook: getConfig('social.facebook', '') as string,
    instagram: getConfig('social.instagram', '') as string,
    linkedin: getConfig('social.linkedin', '') as string,
    youtube: getConfig('social.youtube', '') as string,
  };
}
