import { ConsentManager } from '@/components/analytics/consent-manager';
import { GoogleAnalytics } from '@/components/analytics/google-analytics';
import {
  GoogleTagManager,
  GoogleTagManagerNoScript,
} from '@/components/analytics/google-tag-manager';
import { ClientConfigProvider } from '@/components/client-config-provider';
import metaConfig, { viewportConfig } from '@/components/config/metadata';
import { ResourceHints } from '@/components/resource-hints';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/hooks/use-auth';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Geist, Geist_Mono, Open_Sans } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-open-sans',
  display: 'swap',
  preload: true,
});

export const metadata = metaConfig;
export const viewport = viewportConfig;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${openSans.variable} h-full`}
      suppressHydrationWarning
    >
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

        {/* Preload de recursos críticos */}
        <link
          rel="preload"
          href="/fonts/OpenSans-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        {/* Resource hints */}
        <ResourceHints />
      </head>

      <body className={`antialiased`}>
        {/* GTM NoScript */}
        <GoogleTagManagerNoScript />
        <ClientConfigProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <Toaster expand={false} richColors />
              {children}
            </AuthProvider>
          </ThemeProvider>
        </ClientConfigProvider>
        <ConsentManager />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
