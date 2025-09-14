import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import ApiResponse from '../api-response';
import { authenticate, authorize, JWTPayload } from './auth';
import { applyCors, rateLimit, rateLimitConfigs, sanitizeInput, securityHeaders } from './security';
import { validateBody, validateParams, validateQuery } from './validation';

// Tipo para resultado de middleware
type MiddlewareResult<T = unknown> = NextResponse | { [K in keyof T]: T[K] };

// Função para combinar middlewares
export async function withMiddlewares<T extends Record<string, unknown>>(
  req: NextRequest,
  middlewares: Array<(req: NextRequest) => Promise<MiddlewareResult> | MiddlewareResult>
): Promise<NextResponse | T> {
  const results: Record<string, unknown> = {};

  for (const middleware of middlewares) {
    const result = await middleware(req);

    if (result instanceof NextResponse) {
      return result;
    }

    Object.assign(results, result);
  }

  return results as T;
}

// Middlewares pré-configurados
export const middlewares = {
  // Rate limiting
  generalRateLimit: () => rateLimit(rateLimitConfigs.general),
  authRateLimit: () => rateLimit(rateLimitConfigs.auth),
  strictRateLimit: () => rateLimit(rateLimitConfigs.strict),

  // Segurança
  security: (req: NextRequest, res: NextResponse) => {
    // Aplica headers de segurança
    Object.entries(securityHeaders).forEach(([key, value]) => {
      res.headers.set(key, value);
    });

    // Aplica CORS
    return applyCors(req, res);
  },

  // Sanitização
  sanitize: () => {
    // A sanitização será feita nos dados quando forem processados
    return null;
  },

  // Autenticação
  auth: authenticate(),

  // Autorização
  adminOnly: (user: JWTPayload) => authorize('admin')(user),
  teacherOrAdmin: (user: JWTPayload) => authorize('admin', 'teacher')(user),
  authenticated: (user: JWTPayload) => authorize('admin', 'teacher', 'student')(user),
};

// Helper para criar handlers de API com middlewares
export function createApiHandler<T = unknown>(
  handler: (req: NextRequest, context: T) => Promise<ApiResponse>
) {
  return async (req: NextRequest, params?: { params: Record<string, string> }) => {
    try {
      // Aplicar CORS e headers de segurança
      const response = ApiResponse.success({});
      const corsResponse = applyCors(req, response);

      // Aplicar headers de segurança
      Object.entries(securityHeaders).forEach(([key, value]) => {
        corsResponse.headers.set(key, value);
      });

      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        return ApiResponse.success({}, 'OPTIONS request handled');
      }

      // Executar handler principal
      const context = params ? { params: params.params } : {};
      return await handler(req, context as T);
    } catch (error) {
      return ApiResponse.internalServerError('Erro interno no servidor', {
        details: error instanceof Error ? error.message : String(error),
      });
    }
  };
}

// Helper para criar handlers autenticados
export function createAuthenticatedHandler<T = { user: JWTPayload }>(
  handler: (req: NextRequest, context: T) => Promise<ApiResponse>,
  requiredRoles?: Array<'admin' | 'teacher' | 'student'>
) {
  return createApiHandler<T>(async (req, baseContext) => {
    // Aplicar rate limiting geral
    const rateLimitResult = middlewares.generalRateLimit()(req);
    if (rateLimitResult instanceof ApiResponse) {
      return rateLimitResult;
    }

    // Aplicar autenticação
    const authResult = await middlewares.auth(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Aplicar autorização se roles foram especificadas
    if (requiredRoles && requiredRoles.length > 0) {
      const authzResult = authorize(...requiredRoles)(user);
      if (authzResult instanceof NextResponse) {
        return authzResult;
      }
    }

    // Combinar contextos
    const context = { ...baseContext, user } as T;

    return await handler(req, context);
  });
}

// Helper para criar handlers com validação
export function createValidatedHandler<
  TBody = unknown,
  TQuery = unknown,
  TParams = unknown,
>(config: {
  bodySchema?: z.ZodSchema<TBody>;
  querySchema?: z.ZodSchema<TQuery>;
  paramsSchema?: z.ZodSchema<TParams>;
  requireAuth?: boolean;
  requiredRoles?: Array<'admin' | 'teacher' | 'student'>;
  rateLimit?: 'general' | 'auth' | 'strict';
}) {
  return (
    handler: (
      req: NextRequest,
      context: {
        body?: TBody;
        query?: TQuery;
        params?: TParams;
        user?: JWTPayload;
      }
    ) => Promise<ApiResponse>
  ) => {
    return createApiHandler(async (req, baseContext) => {
      const context: {
        body?: TBody;
        query?: TQuery;
        params?: TParams;
        user?: JWTPayload;
      } = {};

      // Aplicar rate limiting se especificado
      if (config.rateLimit) {
        const rateLimitFn = {
          general: middlewares.generalRateLimit(),
          auth: middlewares.authRateLimit(),
          strict: middlewares.strictRateLimit(),
        }[config.rateLimit];

        const rateLimitResult = rateLimitFn(req);
        if (rateLimitResult instanceof ApiResponse) {
          return rateLimitResult;
        }
      }

      // Validar parâmetros da URL se especificado
      if (
        config.paramsSchema &&
        baseContext &&
        typeof baseContext === 'object' &&
        'params' in baseContext
      ) {
        const paramsResult = validateParams(config.paramsSchema)(
          (baseContext as { params: Record<string, string> }).params
        );
        if (paramsResult instanceof NextResponse) {
          return paramsResult;
        }
        context.params = paramsResult.validatedData;
      }

      // Validar query parameters se especificado
      if (config.querySchema) {
        const queryResult = validateQuery(config.querySchema)(req);
        if (queryResult instanceof NextResponse) {
          return queryResult;
        }
        context.query = queryResult.validatedData;
      }

      // Validar body se especificado
      if (config.bodySchema && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const bodyResult = await validateBody(config.bodySchema)(req);
        if (bodyResult instanceof NextResponse) {
          return bodyResult;
        }
        context.body = bodyResult.validatedData;
      }

      // Aplicar autenticação se necessário
      if (config.requireAuth) {
        const authResult = await middlewares.auth(req);
        if (authResult instanceof NextResponse) {
          return authResult;
        }

        context.user = authResult.user;

        // Aplicar autorização se roles foram especificadas
        if (config.requiredRoles && config.requiredRoles.length > 0) {
          const authzResult = authorize(...config.requiredRoles)(context.user);
          if (authzResult instanceof NextResponse) {
            return authzResult;
          }
        }
      }

      // Sanitizar dados
      if (context.body) {
        context.body = sanitizeInput(context.body) as TBody;
      }
      if (context.query) {
        context.query = sanitizeInput(context.query) as TQuery;
      }

      return await handler(req, context);
    });
  };
}

// Re-export cache functionality
export { cacheConfigs, clearCache, getCacheStats, invalidateCache, withCache } from './cache';
