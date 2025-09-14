'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FlipCardProps {
  height: string;
  front: React.ReactNode;
  back: React.ReactNode;
  className?: string;
  showScrollButtons?: boolean;
  scrollAmount?: number;
}

export function FlipCard({
  height,
  front,
  back,
  className,
  showScrollButtons = true,
  scrollAmount = 100,
}: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const backContentRef = useRef<HTMLDivElement>(null);

  // Verificar se pode fazer scroll
  const checkScroll = () => {
    if (backContentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = backContentRef.current;
      setCanScrollUp(scrollTop > 0);
      setCanScrollDown(scrollTop + clientHeight < scrollHeight);
    }
  };

  // Verificar scroll quando o card for virado
  useEffect(() => {
    if (flipped) {
      setTimeout(checkScroll, 100); // Pequeno delay para garantir que o DOM foi atualizado
    }
  }, [flipped]);

  const scrollUp = () => {
    if (backContentRef.current) {
      backContentRef.current.scrollBy({
        top: -scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 300); // Verificar após a animação
    }
  };

  const scrollDown = () => {
    if (backContentRef.current) {
      backContentRef.current.scrollBy({
        top: scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 300); // Verificar após a animação
    }
  };

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  return (
    <div className={cn('h-full', className)}>
      <div
        className={cn('flip-card cursor-pointer', height)}
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleFlip();
          }
        }}
      >
        <div
          className={cn(
            'transform-style-preserve-3d relative w-full transition-transform duration-700',
            flipped && 'rotate-y-180',
            height
          )}
        >
          {/* Front Side */}
          <div className={cn('absolute inset-0 w-full backface-hidden', height)}>{front}</div>

          {/* Back Side */}
          <div className={cn('absolute inset-0 w-full rotate-y-180 backface-hidden', height)}>
            <div
              ref={backContentRef}
              className={cn(
                'from-tertiary dark:from-primary w-full overflow-y-auto rounded-lg bg-gradient-to-br to-yellow-800 p-10 text-balance text-white shadow-md shadow-stone-500 dark:to-yellow-800',
                height
              )}
              onScroll={checkScroll}
            >
              {back}
            </div>
          </div>
        </div>
      </div>

      {/* Botões de scroll só aparecem quando o card está virado e há conteúdo para scroll */}
      {flipped && showScrollButtons && (canScrollUp || canScrollDown) && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={scrollUp}
            disabled={!canScrollUp}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 font-medium transition-all duration-200',
              canScrollUp ? 'text-primary/50' : 'text-primary-foreground/5'
            )}
            title="Rolar para cima"
          >
            <ChevronUp className="h-8 w-8" />
          </button>
          <button
            onClick={scrollDown}
            disabled={!canScrollDown}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 font-medium transition-all duration-200',
              canScrollDown ? 'text-primary/50' : 'text-primary-foreground/5'
            )}
            title="Rolar para baixo"
          >
            <ChevronDown className="h-8 w-8" />
          </button>
        </div>
      )}
    </div>
  );
}
