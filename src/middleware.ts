import { jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  applyCors,
  rateLimit,
  rateLimitConfigs,
  securityHeaders,
} from './lib/middlewares/security';

/**
 * Middleware principal da aplicação.
 * Aplica CORS, headers de segurança e rate limiting.
 * @param req - Requisição HTTP
 * @returns NextResponse
 */
export async function middleware(req: NextRequest) {
  // Criar resposta inicial
  const res = NextResponse.next();

  // Aplicar headers de segurança globalmente
  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.headers.set(key, value);
  });

  // Aplicar CORS para todas as requisições
  const corsResponse = applyCors(req, res);

  // Handle preflight requests (OPTIONS) - importante para CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsResponse.headers });
  }

  // Rate limiting apenas para rotas de API (não para páginas estáticas)
  const isApiRoute = req.nextUrl.pathname.startsWith('/api');

  if (isApiRoute) {
    // Rate limiting específico apenas para rotas sensíveis de auth
    const isSensitiveAuthRoute =
      req.nextUrl.pathname === '/api/auth/login' ||
      req.nextUrl.pathname === '/api/auth/register' ||
      req.nextUrl.pathname === '/api/auth/reset';

    if (isSensitiveAuthRoute) {
      const authRateLimit = rateLimit(rateLimitConfigs.auth);
      const rateLimitResult = authRateLimit(req);
      if (rateLimitResult instanceof NextResponse) {
        return rateLimitResult;
      }
    } else {
      // Rate limiting geral para outras APIs (incluindo /api/auth/me)
      const generalRateLimit = rateLimit(rateLimitConfigs.general);
      const rateLimitResult = generalRateLimit(req);
      if (rateLimitResult instanceof NextResponse) {
        return rateLimitResult;
      }
    }
    // Para APIs, apenas aplicamos segurança e rate limiting, não autenticação
    return corsResponse;
  }

  // Verificar autenticação apenas para rotas admin (não para API ou rotas públicas)
  const isHomePage = req.nextUrl.pathname === '/';
  const isLoginPage = req.nextUrl.pathname === '/login';
  const isPublicRoute = isHomePage || isLoginPage;
  const accessToken = req.cookies.get('accessToken')?.value;

  // Configuração de permissões por role
  type Role = 'admin' | 'super' | 'client' | string;
  const roleRoutePermissions: Record<Role, string[]> = {
    admin: ['/admin', '/area-do-aluno', '/area-do-professor', '/perfil'],
    super: ['/admin', '/area-do-aluno', '/area-do-professor', '/perfil'],
    teacher: ['/area-do-professor', '/perfil'],
    student: ['/area-do-aluno', '/perfil'],
    guest: ['/perfil'],
  };

  // Lista de grupos de rotas protegidas
  const protectedGroups = ['/admin', '/area-do-aluno', '/area-do-professor', '/perfil'];

  // Identifica qual grupo de rota está sendo acessado
  const currentGroup = protectedGroups.find(
    (group) => req.nextUrl.pathname === group || req.nextUrl.pathname.startsWith(group + '/')
  );

  // Se for rota pública, apenas aplicar CORS e headers de segurança
  if (isPublicRoute) {
    return corsResponse;
  }

  // Proteção baseada em permissões de role para grupos de rotas
  if (currentGroup) {
    if (accessToken) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
        const { payload } = await jwtVerify(accessToken, secret);

        // Verificar se o token tem as informações necessárias
        if (!payload.userId || !payload.email || !payload.role) {
          console.warn('Token inválido: payload incompleto');
          return NextResponse.redirect(new URL('/login', req.url));
        }

        // Verifica se o role do usuário tem permissão para acessar o grupo
        const allowedGroups: string[] = roleRoutePermissions[payload.role as Role] || [];
        if (
          allowedGroups.some(
            (group: string) =>
              req.nextUrl.pathname === group || req.nextUrl.pathname.startsWith(group + '/')
          )
        ) {
          return corsResponse;
        } else {
          // Redireciona para a home se não tiver permissão
          return NextResponse.redirect(new URL('/', req.url));
        }
      } catch (err) {
        console.error('Erro na verificação do token:', err);
        return NextResponse.redirect(new URL('/login', req.url));
      }
    } else {
      console.error('Acesso negado: token não fornecido');
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return corsResponse;
}

export const config = {
  // Usar sintaxe mais específica que exclui explicitamente rotas públicas
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - / (homepage)
     * - /login (login page)
     * - /_next/static (static files)
     * - /_next/image (image optimization files)
     * - /favicon.ico (favicon file)
     */
    '/((?!$|login|_next/static|_next/image|favicon.ico).*)',
  ],
};
