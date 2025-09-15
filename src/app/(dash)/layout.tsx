import '@/app/globals.css';
import { ConsentManager } from '@/components/analytics/consent-manager';
import { GoogleAnalytics } from '@/components/analytics/google-analytics';
import {
  GoogleTagManager,
  GoogleTagManagerNoScript,
} from '@/components/analytics/google-tag-manager';
import BtnWhatsappWrapper from '@/components/btn-whatsapp-wrapper';
import { ClientConfigProvider } from '@/components/client-config-provider';
import metaConfig, { viewportConfig } from '@/components/config/metadata';
import { ResourceHints } from '@/components/resource-hints';
import { AuthProvider } from '@/contexts/auth-context';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Open_Sans } from 'next/font/google';
import { Toaster } from 'sonner';

export const metadata = metaConfig;
export const viewport = viewportConfig;

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-open-sans',
  display: 'swap',
  preload: true,
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`h-full ${openSans.variable}`} suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        <GoogleAnalytics />

        {/* Google Tag Manager */}
        <GoogleTagManager />

        {/* Critical CSS inline */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            /* Critical CSS para Above-the-fold */
            body { margin: 0; font-family: ${openSans.style.fontFamily}; }
            .loading-skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: loading 1.5s infinite; }
            @keyframes loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
            .min-h-screen { min-height: 100vh; }
            .flex { display: flex; }
          `,
          }}
        />

        {/* Resource hints */}
        <ResourceHints />
      </head>
      <body className={`h-full w-full ${openSans.className}`}>
        {/* GTM NoScript */}
        <GoogleTagManagerNoScript />
        <ClientConfigProvider>
          <AuthProvider>
            <Toaster expand={true} richColors />
            <div className="h-full w-full">{children}</div>
            <BtnWhatsappWrapper />
          </AuthProvider>
        </ClientConfigProvider>
        <ConsentManager />
        {process.env.NODE_ENV === 'production' && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  );
}
