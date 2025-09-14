'use client';

import { useEffect } from 'react';

export function ResourceHints() {
  useEffect(() => {
    // Preconnect para APIs críticas
    const preconnectLinks = [
      process.env.NEXT_PUBLIC_CDN_URL,
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
    ].filter(Boolean);

    preconnectLinks.forEach((url) => {
      if (url && !document.querySelector(`link[href="${url}"]`)) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = url;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
    });

    // DNS prefetch para domínios secundários
    const dnsPrefetchDomains = ['https://analytics.google.com', 'https://www.google-analytics.com'];

    dnsPrefetchDomains.forEach((domain) => {
      if (!document.querySelector(`link[href="${domain}"]`)) {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = domain;
        document.head.appendChild(link);
      }
    });
  }, []);

  return null;
}
