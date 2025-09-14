import bcrypt from 'bcrypt';
import { jwtVerify, SignJWT } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '../api-response';

// Blacklist de tokens (em produção, use Redis)
const tokenBlacklist = new Set<string>();

// Limpar tokens expirados da blacklist periodicamente
setInterval(
  () => {
    // Em produção, implemente lógica para limpar tokens expirados do Redis
  },
  60 * 60 * 1000
); // A cada hora

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthResult {
  success?: boolean;
  user?: JWTPayload;
  message?: string;
  error?: string;
  code?: string;
}

// Configurações JWT
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// Função para gerar token JWT
export async function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET);

  return token;
}

// Função para verificar token JWT
export async function verifyToken(token: string): Promise<AuthResult> {
  try {
    // Verifica se o token está na blacklist
    if (tokenBlacklist.has(token)) {
      return {
        // success: false,
        error: 'Token inválido',
        // code: 'TOKEN_BLACKLISTED',
      };
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Verifica se o payload tem a estrutura esperada
    if (!payload.userId || !payload.email || !payload.role) {
      return {
        // success: false,
        error: 'Token inválido',
        // code: 'INVALID_TOKEN_PAYLOAD',
      };
    }

    const user: JWTPayload = {
      userId: payload.userId as number,
      email: payload.email as string,
      role: payload.role as string,
      iat: payload.iat,
      exp: payload.exp,
    };

    return {
      success: true,
      user,
    };
  } catch (error) {
    let code = 'TOKEN_INVALID';
    let message = 'Token inválido';

    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        code = 'TOKEN_EXPIRED';
        message = 'Token expirado';
      } else if (error.message.includes('signature')) {
        code = 'TOKEN_SIGNATURE_INVALID';
        message = 'Assinatura do token inválida';
      }
    }

    return {
      // success: false,
      error: message,
      code,
    };
  }
}

// Função para adicionar token à blacklist
export function blacklistToken(token: string): void {
  tokenBlacklist.add(token);

  // Em produção, adicione ao Redis com TTL baseado na expiração do token
  // await redis.setex(`blacklist:${token}`, tokenTTL, '1');
}

// Middleware de autenticação
export function authenticate() {
  return async (req: NextRequest): Promise<NextResponse | { user: JWTPayload }> => {
    const authHeader = req.headers.get('authorization');
    const cookieToken = req.cookies.get('accessToken')?.value;

    // Tenta pegar o token do header Authorization ou do cookie
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : cookieToken;

    if (!token) {
      return ApiResponse.authenticationError('Token de acesso requerido');
    }

    const authResult = await verifyToken(token);

    if (!authResult.success || !authResult.user) {
      return ApiResponse.authenticationError(authResult.message || 'Token inválido');
    }

    return { user: authResult.user };
  };
}

// Middleware de autorização por roles
export function authorize(...allowedRoles: Array<string>) {
  return (user: JWTPayload): NextResponse | { authorized: true } => {
    if (!allowedRoles.includes(user.role)) {
      return ApiResponse.authorizationError('Acesso negado. Permissões insuficientes.');
    }

    return { authorized: true };
  };
}

// Função para hash de senha
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Função para verificar senha
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Função auxiliar para extrair token de diferentes fontes
export function extractToken(req: NextRequest): string | null {
  // 1. Tenta pegar do header Authorization
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // 2. Tenta pegar do cookie
  const cookieToken = req.cookies.get('accessToken')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  // 3. Tenta pegar do query parameter (menos seguro, use apenas para casos específicos)
  const queryToken = req.nextUrl.searchParams.get('token');
  if (queryToken) {
    return queryToken;
  }

  return null;
}

// Middleware para refresh token (opcional)
export async function refreshToken(req: NextRequest): Promise<NextResponse | { newToken: string }> {
  const refreshTokenValue = req.cookies.get('refreshToken')?.value;

  if (!refreshTokenValue) {
    return ApiResponse.authenticationError('Refresh token requerido');
  }

  try {
    const { payload } = await jwtVerify(refreshTokenValue, JWT_SECRET);

    if (!payload.userId || !payload.email || !payload.role) {
      return ApiResponse.authenticationError('Refresh token inválido');
    }

    // Gera novo access token
    const newToken = await generateToken({
      userId: payload.userId as number,
      email: payload.email as string,
      role: payload.role as string,
    });

    return { newToken };
  } catch {
    return ApiResponse.authenticationError('Refresh token inválido ou expirado');
  }
}

// Função para logout (adiciona token à blacklist)
export async function logout(req: NextRequest): Promise<NextResponse> {
  const token = extractToken(req);

  if (token) {
    blacklistToken(token);
  }

  const response = ApiResponse.success(null, 'Logout realizado com sucesso');

  // Remove cookies
  response.cookies.delete('accessToken');
  response.cookies.delete('refreshToken');

  return response;
}
