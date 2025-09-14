'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function ConsentManager() {
  const [showConsent, setShowConsent] = useState(false);
  const [hasConsented, setHasConsented] = useState<boolean | null>(null);

  useEffect(() => {
    // Verificar se já tem consentimento salvo
    const consent = localStorage.getItem('analytics-consent');
    if (consent === null) {
      setShowConsent(true);
    } else {
      setHasConsented(consent === 'true');
    }
  }, []);

  useEffect(() => {
    // Se já consentiu, inicializar analytics
  }, [hasConsented]);

  const handleConsent = (accepted: boolean) => {
    localStorage.setItem('analytics-consent', accepted.toString());
    setHasConsented(accepted);
    setShowConsent(false);

    // Se aceito, inicializar analytics
    if (accepted && typeof window !== 'undefined') {
      // Recarregar scripts de analytics se necessário
      window.location.reload();
    }
  };

  if (!showConsent) return null;

  return (
    <div className="fixed right-4 bottom-4 z-50 max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Cookies e Analytics</CardTitle>
          <CardDescription className="text-xs">
            Usamos cookies para melhorar sua experiência e analisar o uso do site.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex gap-2 pt-0">
          <Button size="sm" variant="outline" onClick={() => handleConsent(false)}>
            Recusar
          </Button>
          <Button size="sm" onClick={() => handleConsent(true)}>
            Aceitar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
