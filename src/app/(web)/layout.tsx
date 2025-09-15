import './styles.css';

import BtnWhatsappWrapper from '@/components/btn-whatsapp-wrapper';

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <div className="h-full w-full">{children}</div>
      <BtnWhatsappWrapper />
    </>
  );
}
