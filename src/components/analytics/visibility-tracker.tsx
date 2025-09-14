'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface VisibilityTrackerProps {
  children: ReactNode;
  onVisible: () => void;
}

// Componente que rastreia quando um elemento fica visível na tela
// Usa Intersection Observer para detectar visibilidade
// Chama onVisible quando o elemento entra na viewport
// Ideal para rastrear visualizações de cursos, notícias, etc.
export function VisibilityTracker({ children, onVisible }: VisibilityTrackerProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onVisible();
            observer.unobserve(entry.target); // Para de observar depois que viu
          }
        });
      },
      { threshold: 0.5 } // Dispara quando 50% está visível
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [onVisible]);

  return <div ref={elementRef}>{children}</div>;
}
