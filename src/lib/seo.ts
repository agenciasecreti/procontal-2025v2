import { Metadata } from 'next';

export interface PageMetadata {
  title?: string;
  description?: string;
  type?: string;
  image?: string;
  active?: boolean;
}

export function generateSEOMetadata(meta: PageMetadata): Metadata {
  return {
    title: meta.title
      ? `${meta.title} - ${process.env.NEXT_PUBLIC_SITE_NAME}`
      : process.env.NEXT_PUBLIC_SITE_NAME,
    description: meta.description || process.env.NEXT_PUBLIC_SITE_DESCRIPTION,
    keywords: [...(process.env.NEXT_PUBLIC_SITE_KEYWORDS ?? '').split(',')],
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      title: meta.title
        ? `${meta.title} - ${process.env.NEXT_PUBLIC_SITE_NAME}`
        : process.env.NEXT_PUBLIC_SITE_NAME,
      description: meta.description || process.env.NEXT_PUBLIC_SITE_DESCRIPTION,
      type: (meta.type as 'website' | 'article' | 'book' | 'profile') || 'website',
      locale: 'pt_BR',
      siteName: process.env.NEXT_PUBLIC_SITE_NAME,
      images: meta.image
        ? [
            {
              url: meta.image,
              width: 1200,
              height: 630,
              alt: meta.title || process.env.NEXT_PUBLIC_SITE_NAME,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title
        ? `${meta.title} - ${process.env.NEXT_PUBLIC_SITE_NAME}`
        : process.env.NEXT_PUBLIC_SITE_NAME,
      description: meta.description || process.env.NEXT_PUBLIC_SITE_DESCRIPTION,
      images: meta.image ? [meta.image] : undefined,
      creator: process.env.NEXT_PUBLIC_TWITTER_HANDLE,
      site: process.env.NEXT_PUBLIC_TWITTER_HANDLE,
    },
    robots: {
      index: meta.active !== false,
      follow: meta.active !== false,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION_ID,
    },
    authors: [{ name: process.env.NEXT_PUBLIC_SITE_NAME }],
    creator: process.env.NEXT_PUBLIC_SITE_NAME,
    publisher: process.env.NEXT_PUBLIC_SITE_NAME,
    category: process.env.NEXT_PUBLIC_SITE_CATEGORY,
    alternates: {
      canonical:
        meta.active !== false
          ? `${process.env.NEXT_PUBLIC_SITE_URL}${meta.title ? `/${meta.title}` : ''}`
          : undefined,
    },
  };
}
