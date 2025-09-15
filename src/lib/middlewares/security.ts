import { NextRequest, NextResponse } from 'next/server';
import ApiResponse from '../api-response';

// Configuração de headers de segurança
export const securityHeaders = {
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  // XSS Protection
  'X-XSS-Protection': '1; mode=block',
  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "frame-src 'self' https://cdn.ckeditor.com https://www.youtube.com",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.ckeditor.com https://va.vercel-scripts.com https://vitals.vercel-insights.com",
    "style-src 'self' 'unsafe-inline' https://cdn.ckeditor.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://cdn.ckeditor.com",
    "connect-src 'self' https://cdn.ckeditor.com https://proxy-event.ckeditor.com https://vitals.vercel-insights.com",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; '),
  // HSTS (only for HTTPS)
  ...(process.env.NODE_ENV === 'production'
    ? {
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      }
    : {}),
};

// Rate limiting store (em produção, use Redis)
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Limpar entradas expiradas periodicamente
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000); // Limpa a cada minuto

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessful?: boolean;
}

export const rateLimitConfigs = {
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 200, // Aumentado para permitir uso normal
    message: 'Muitas requisições deste IP, tente novamente em 15 minutos.',
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Aumentado para permitir algumas tentativas válidas
    message: 'Muitas tentativas de login, tente novamente em 15 minutos.',
    skipSuccessful: true,
  },
  api: {
    windowMs: 60 * 1000, // 1 minuto
    max: 30, // Limite para APIs
    message: 'Limite de requisições da API excedido.',
  },
  strict: {
    windowMs: 60 * 1000, // 1 minuto
    max: 5, // Para operações sensíveis (reset senha, etc)
    message: 'Limite de requisições excedido para esta operação sensível.',
  },
  upload: {
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 10, // Para uploads de arquivos
    message: 'Muitos uploads, tente novamente em 5 minutos.',
  },
};

export function rateLimit(config: RateLimitConfig) {
  return (req: NextRequest): NextResponse | null => {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      req.headers.get('cf-connecting-ip') || // Cloudflare
      'unknown';
    const key = `${ip}:${req.nextUrl.pathname}`;
    const now = Date.now();

    let entry = rateLimitStore.get(key);

    if (!entry || entry.resetTime < now) {
      entry = {
        count: 1,
        resetTime: now + config.windowMs,
      };
      rateLimitStore.set(key, entry);
      return null; // Allow request
    }

    if (entry.count >= config.max) {
      const response = ApiResponse.rateLimitError(
        config.message || 'Excedido o limite de requisições',
        {
          limit: config.max,
          remaining: 0,
          resetTime: Math.ceil(entry.resetTime / 1000),
        }
      );

      // Adicionar headers de rate limit
      response.headers.set('X-RateLimit-Limit', config.max.toString());
      response.headers.set('X-RateLimit-Remaining', '0');
      response.headers.set('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000).toString());

      return response;
    }

    entry.count++;
    rateLimitStore.set(key, entry);
    return null; // Allow request
  };
}

// CORS configuration
export const corsConfig = {
  allowedOrigins: ['http://localhost:3000', process.env.NEXT_PUBLIC_SITE_URL].filter(Boolean),

  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-API-Key',
  ],

  credentials: true,
  maxAge: 86400, // 24 hours
};

export function applyCors(req: NextRequest, res: NextResponse): NextResponse {
  const origin = req.headers.get('origin');

  // Set CORS headers
  if (origin && corsConfig.allowedOrigins.includes(origin)) {
    res.headers.set('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // Para requisições sem origin (Postman, etc)
    res.headers.set('Access-Control-Allow-Origin', '*');
  }

  res.headers.set('Access-Control-Allow-Methods', corsConfig.allowedMethods.join(', '));
  res.headers.set('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '));
  res.headers.set('Access-Control-Allow-Credentials', corsConfig.credentials.toString());
  res.headers.set('Access-Control-Max-Age', corsConfig.maxAge.toString());

  return res;
}

// Input sanitization
export function sanitizeInput(input: unknown): unknown {
  if (typeof input === 'string') {
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }

  if (typeof input === 'object' && input !== null) {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }

  return input;
}
