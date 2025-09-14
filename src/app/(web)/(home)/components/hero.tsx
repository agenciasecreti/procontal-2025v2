'use client';

import IconLoop from '@/components/logo/icon-loop';
import Header from '@/components/web/header';
import { BannerPrincipalType } from '@/types/models';
import { Suspense, lazy, useEffect, useState } from 'react';

// Lazy load do carousel para não bloquear renderização inicial
const EmblaCarousel = lazy(() => import('@/components/embla-carousel'));

// Skeleton para loading state
function CarouselSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <IconLoop width={200} />
    </div>
  );
}

const fetchBanners = async () => {
  const res = await fetch('/api/banners', {
    method: 'GET',
    cache: 'no-store',
  });
  const { success, data } = await res.json();
  if (!success) throw new Error('Failed to fetch banners');

  return data;
};

export default function Hero() {
  const [loading, setLoading] = useState(true);
  const [principals, setPrincipals] = useState<BannerPrincipalType[]>([]);

  useEffect(() => {
    setLoading(true);
    fetchBanners()
      .then(function (banners) {
        setPrincipals(banners || []);
        setLoading(false);
      })
      .catch(function () {
        setPrincipals([]);
        setLoading(false);
      });
  }, []);

  return (
    <section id="inicio" className="relative w-full text-white">
      <div className="absolute z-10 w-full">
        <Header />
      </div>
      {!loading && principals.length > 0 ? (
        <Suspense fallback={<CarouselSkeleton />}>
          <EmblaCarousel slides={principals} options={{ loop: true }} />
        </Suspense>
      ) : (
        <CarouselSkeleton />
      )}
    </section>
  );
}
