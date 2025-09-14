export interface SiteConfig {
  [key: string]: string | number | boolean;
}

export interface ConfigContextType {
  config: SiteConfig;
  loading: boolean;
  error: string | null;
  getConfig: <T = string | number | boolean>(key: string, defaultValue?: T) => T;
  refreshConfig: () => Promise<void>;
}

export interface ConfigProviderProps {
  children: React.ReactNode;
  initialConfig?: SiteConfig;
}
