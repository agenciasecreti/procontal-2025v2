'use client';

import dynamic from 'next/dynamic';

// Importação dinâmica do BtnWhatsapp para evitar problemas de hidratação
const BtnWhatsapp = dynamic(() => import('@/components/btn-whatsapp'), {
  ssr: false,
});

export default function BtnWhatsappWrapper() {
  return <BtnWhatsapp />;
}
