// src/lib/gtag.ts
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || '';

// Função para enviar página visualizada
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// Função para enviar eventos personalizados
export const event = (
  action: string,
  {
    event_category,
    event_label,
    value,
    custom_parameters = {},
  }: {
    event_category?: string;
    event_label?: string;
    value?: number;
    custom_parameters?: Record<string, string | number | boolean | undefined>;
  }
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category,
      event_label,
      value,
      ...custom_parameters,
    });
  }
};

// Tipos TypeScript para window.gtag
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}
