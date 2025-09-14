import { PrismaClient } from '@prisma/client';
import { jwtVerify, SignJWT } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from './api-response';
import { VerifiedApiKeyData, verifyApiKey } from './apiKeys';

const prisma = new PrismaClient();

// Função para gerar novo access token
async function generateAccessToken(userId: number): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h') // ✅ Aumentado para 8 horas
    .sign(secret);
}

// Função para verificar e renovar token usando refresh token
async function renewTokenIfExpired(
  req: NextRequest
): Promise<{ token: string; renewed: boolean } | null> {
  const refreshToken = req.cookies.get('refreshToken')?.value;

  if (!refreshToken) {
    return null;
  }

  try {
    // Verifica se o refresh token existe e não foi revogado
    const storedRefreshToken = await prisma.refreshToken.findUnique({
      where: {
        token: refreshToken,
        revoked: false,
        expires_at: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!storedRefreshToken) {
      return null;
    }

    // Gera novo access token
    const newAccessToken = await generateAccessToken(storedRefreshToken.user_id);

    return {
      token: newAccessToken,
      renewed: true,
    };
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    return null;
  }
}

type AuthResult =
  | { type: 'api-key'; apiKey: { valid: boolean; apiKeyData?: VerifiedApiKeyData; error?: string } }
  | {
      type: 'user';
      user: { id: number; name: string; email: string; avatar: string | null; role: string };
      tokenRenewed?: boolean;
      newAccessToken?: string;
    }
  | NextResponse;

export async function verifyAuth(req: NextRequest): Promise<AuthResult> {
  try {
    // Primeiro verifica se é uma API Key
    const apiKey = req.headers.get('x-api-key');

    if (apiKey) {
      const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');

      const apiKeyResult = await verifyApiKey(apiKey, clientIp || undefined);

      if (apiKeyResult.valid) {
        return {
          type: 'api-key',
          apiKey: apiKeyResult,
        };
      } else {
        return ApiResponse.authenticationError(apiKeyResult.error || 'API Key inválida');
      }
    }

    // Se não é API Key, verifica JWT token
    const authHeader = req.headers.get('authorization');
    const cookieToken = req.cookies.get('accessToken')?.value;

    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (cookieToken) {
      token = cookieToken;
    }

    if (!token) {
      return ApiResponse.authenticationError('Você não está autenticado');
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

    // Tenta verificar o token atual
    const { payload } = await jwtVerify(token, secret);

    const userId =
      typeof payload.userId === 'string' ? parseInt(payload.userId, 10) : payload.userId;
    if (typeof userId !== 'number' || isNaN(userId)) {
      return NextResponse.json(
        { error: 'Usuário inválido ou sem permissão para acessar este recurso' },
        { status: 401 }
      );
    }

    try {
      if (typeof userId !== 'number' || isNaN(userId)) {
        return ApiResponse.authenticationError('ID de usuário inválido no token');
      }
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
      });

      if (!user) {
        return ApiResponse.authenticationError('Usuário não encontrado');
      }

      return {
        type: 'user',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role.name,
        },
      };
    } catch (jwtError: unknown) {
      // Se o token expirou, tenta renovar usando refresh token
      interface JwtError {
        code?: string;
        message?: string;
      }
      const isJwtExpired =
        typeof jwtError === 'object' &&
        jwtError !== null &&
        (('code' in jwtError && (jwtError as JwtError).code === 'ERR_JWT_EXPIRED') ||
          ('message' in jwtError &&
            typeof (jwtError as JwtError).message === 'string' &&
            (jwtError as JwtError).message!.includes('exp')));

      if (isJwtExpired) {
        console.log('Token expirado, tentando renovar...');

        const renewResult = await renewTokenIfExpired(req);

        if (renewResult) {
          // Verifica o novo token
          const { payload } = await jwtVerify(renewResult.token, secret);

          const user = await prisma.user.findUnique({
            where: { id: payload.userId as number },
            include: { role: true },
          });

          if (!user) {
            return ApiResponse.authenticationError('Usuário não encontrado');
          }

          // Retorna o usuário com indicação de que o token foi renovado
          return {
            type: 'user',
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              avatar: user.avatar,
              role: user.role.name,
            },
            tokenRenewed: true,
            newAccessToken: renewResult.token,
          };
        }

        // Se não conseguiu renovar, retorna erro de token expirado
        return ApiResponse.authenticationError(
          'Token expirado e não foi possível renovar. Faça login novamente.'
        );
      }

      // Para outros erros de JWT, retorna erro genérico
      throw jwtError;
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? `Token inválido: ${error.message}` : 'Token inválido';
    return ApiResponse.authenticationError(errorMessage);
  }
}

// Função helper para verificar autenticação e atualizar cookies se necessário
export async function verifyAuthWithCookieUpdate(
  req: NextRequest
): Promise<{ auth: AuthResult; response?: NextResponse }> {
  const authResult = await verifyAuth(req);

  if (authResult instanceof NextResponse) {
    return { auth: authResult };
  }

  // Se o token foi renovado, cria uma resposta com o novo cookie
  if (authResult.type === 'user' && authResult.tokenRenewed && authResult.newAccessToken) {
    const response = NextResponse.next();

    // Define o novo access token no cookie
    response.cookies.set('accessToken', authResult.newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // ✅ 8 horas (mesmo tempo do token)
      path: '/',
    });

    return {
      auth: authResult,
      response,
    };
  }

  return { auth: authResult };
}
