import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '../api-response';

// Cache store em memória (em produção, use Redis)
interface CacheEntry {
  data: unknown;
  expires: number;
  etag: string;
}

const cacheStore = new Map<string, CacheEntry>();

// Limpar cache expirado periodicamente
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of cacheStore.entries()) {
      if (entry.expires < now) {
        cacheStore.delete(key);
      }
    }
  },
  5 * 60 * 1000
); // Limpa a cada 5 minutos

export interface CacheConfig {
  ttl: number; // Time to live em segundos
  includeUser?: boolean; // Se deve incluir ID do usuário na chave
  includeQuery?: boolean; // Se deve incluir query params na chave
  varyBy?: string[]; // Headers específicos para variar o cache
  skipIf?: (req: NextRequest) => boolean; // Condição para pular cache
}

// Configurações de cache pré-definidas
export const cacheConfigs = {
  // Cache para verificação de autenticação - 5 minutos
  auth: {
    ttl: 5 * 60, // 5 minutos
    includeUser: true,
    varyBy: ['authorization'],
  } as CacheConfig,

  // Cache para dados do usuário - 10 minutos
  user: {
    ttl: 10 * 60, // 10 minutos
    includeUser: true,
    includeQuery: true,
  } as CacheConfig,

  // Cache para listas (cursos, posts, etc.) - 5 minutos
  list: {
    ttl: 5 * 60, // 5 minutos
    includeQuery: true,
    skipIf: (req) => req.method !== 'GET',
  } as CacheConfig,

  // Cache para dados específicos - 15 minutos
  detail: {
    ttl: 15 * 60, // 15 minutos
    includeQuery: true,
    skipIf: (req) => req.method !== 'GET',
  } as CacheConfig,
};

// Gerar chave de cache
function generateCacheKey(req: NextRequest, config: CacheConfig, userId?: string): string {
  const parts = [req.nextUrl.pathname];

  if (config.includeUser && userId) {
    parts.push(`user:${userId}`);
  }

  if (config.includeQuery) {
    const searchParams = req.nextUrl.searchParams;
    if (searchParams.toString()) {
      parts.push(`query:${searchParams.toString()}`);
    }
  }

  if (config.varyBy) {
    for (const header of config.varyBy) {
      const value = req.headers.get(header);
      if (value) {
        parts.push(`${header}:${value}`);
      }
    }
  }

  return parts.join('|');
}

// Gerar ETag
function generateETag(data: unknown): string {
  const content = JSON.stringify(data);
  return `"${Buffer.from(content).toString('base64').slice(0, 16)}"`;
}

// Middleware de cache
export function withCache(config: CacheConfig) {
  return {
    // Verificar se existe cache válido
    check: (req: NextRequest, userId?: string): NextResponse | null => {
      // Pular cache se configurado
      if (config.skipIf && config.skipIf(req)) {
        return null;
      }

      // Apenas para métodos seguros
      if (!['GET', 'HEAD'].includes(req.method)) {
        return null;
      }

      const cacheKey = generateCacheKey(req, config, userId);
      const cached = cacheStore.get(cacheKey);

      if (!cached || cached.expires < Date.now()) {
        return null; // Cache miss ou expirado
      }

      // Verificar If-None-Match (ETag)
      const ifNoneMatch = req.headers.get('if-none-match');
      if (ifNoneMatch === cached.etag) {
        return new NextResponse(null, {
          status: 304,
          headers: {
            ETag: cached.etag,
            'Cache-Control': `public, max-age=${config.ttl}`,
            'X-Cache': 'HIT-304',
          },
        });
      }

      // Cache hit - retornar dados com ApiResponse
      const response = ApiResponse.success(cached.data);
      response.headers.set('ETag', cached.etag);
      response.headers.set('Cache-Control', `public, max-age=${config.ttl}`);
      response.headers.set('X-Cache', 'HIT');
      return response;
    },

    // Armazenar resposta no cache
    store: (req: NextRequest, response: NextResponse, userId?: string): void => {
      // Pular cache se configurado
      if (config.skipIf && config.skipIf(req)) {
        return;
      }

      // Apenas cachear respostas de sucesso
      if (response.status !== 200) {
        return;
      }

      // Tentar extrair dados JSON da resposta
      response
        .json()
        .then((data) => {
          const cacheKey = generateCacheKey(req, config, userId);
          const etag = generateETag(data);
          const expires = Date.now() + config.ttl * 1000;

          cacheStore.set(cacheKey, {
            data,
            expires,
            etag,
          });

          // Adicionar headers de cache na resposta
          response.headers.set('ETag', etag);
          response.headers.set('Cache-Control', `public, max-age=${config.ttl}`);
          response.headers.set('X-Cache', 'MISS');
        })
        .catch(() => {
          // Ignore JSON parsing errors
        });
    },
  };
}

// Invalidar cache por padrão
export function invalidateCache(pattern: string): void {
  const regex = new RegExp(pattern);
  for (const [key] of cacheStore.entries()) {
    if (regex.test(key)) {
      cacheStore.delete(key);
    }
  }
}

// Limpar todo o cache
export function clearCache(): void {
  cacheStore.clear();
}

// Estatísticas do cache
export function getCacheStats(): {
  size: number;
  entries: Array<{ key: string; expires: Date; size: number }>;
} {
  const entries = Array.from(cacheStore.entries()).map(([key, entry]) => ({
    key,
    expires: new Date(entry.expires),
    size: JSON.stringify(entry.data).length,
  }));

  return {
    size: cacheStore.size,
    entries,
  };
}
