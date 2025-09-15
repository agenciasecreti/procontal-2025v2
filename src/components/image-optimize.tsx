// src/components/optimized-image.tsx
'use client';

import Image, { ImageProps } from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface ImageOptProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallback?: string;
  cacheKey?: string;
  lazy?: boolean;
}

export function ImageOpt({
  src,
  alt,
  fallback = '/images/placeholder.jpg',
  cacheKey,
  lazy = true,
  priority = false,
  ...props
}: ImageOptProps) {
  const [imageSrc, setImageSrc] = useState(lazy ? fallback : src);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldLoad, setShouldLoad] = useState(!lazy || priority);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (!lazy || shouldLoad) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            setImageSrc(src);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // Carrega 50px antes de aparecer
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, shouldLoad, src]);

  // Gerar URL com cache busting se necessário
  const getCachedImageUrl = (url: string) => {
    if (cacheKey && url !== fallback) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}v=${cacheKey}`;
    }
    return url;
  };

  return (
    <div ref={imgRef} className={props.className}>
      {shouldLoad && (
        <Image
          {...props}
          src={getCachedImageUrl(imageSrc)}
          alt={alt}
          priority={priority}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          onLoad={() => setIsLoading(false)}
          onError={() => {
            if (imageSrc !== fallback) {
              setImageSrc(fallback);
            }
            setIsLoading(false);
          }}
          style={{
            transition: 'opacity 0.3s ease',
            opacity: isLoading ? 0.8 : 1,
          }}
        />
      )}

      {!shouldLoad && (
        <div
          className="loading-skeleton h-full w-full"
          style={{ minHeight: props.height || '200px' }}
        />
      )}
    </div>
  );
}
