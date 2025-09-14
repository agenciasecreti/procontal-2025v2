'use client';

import { ConfigProvider } from '@/contexts/config-context';
import { ReactNode } from 'react';

interface ClientConfigProviderProps {
  children: ReactNode;
  initialConfig?: Record<string, string | number | boolean>;
}

export function ClientConfigProvider({ children, initialConfig }: ClientConfigProviderProps) {
  return <ConfigProvider initialConfig={initialConfig}>{children}</ConfigProvider>;
}
