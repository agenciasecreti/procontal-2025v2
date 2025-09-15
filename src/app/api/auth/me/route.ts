import ApiResponse from '@/lib/api-response';
import { cacheConfigs, withCache } from '@/lib/middlewares';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

/**
 * Rota para obter informações do usuário autenticado.
 * @param req - Requisição HTTP
 * @route GET /auth/me
 * @returns NextResponse com os dados do usuário ou erro
 */
export const GET = async (req: NextRequest) => {
  // Obter cookies da requisição
  const cookieStore = await cookies();
  let accessToken = cookieStore.get('accessToken')?.value;

  // Caso não encontre cookies, procura por bearer token no header
  if (!accessToken) {
    const authHeader = req.headers.get('authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (token) {
        accessToken = token;
      }
    }
  }

  if (!accessToken) {
    return ApiResponse.success(null, 'Nenhum usuário autenticado');
  }

  // Extrair userId do token para cache
  let userId: string | undefined;
  let payload: { userId: number; email: string; role: string } | undefined;

  try {
    payload = jwt.verify(accessToken, process.env.JWT_SECRET!) as {
      userId: number;
      email: string;
      role: string;
    };
    userId = payload.userId.toString();
  } catch {
    return ApiResponse.authenticationError('Token inválido ou expirado');
  }

  if (!payload || !payload.userId) {
    return ApiResponse.authenticationError('Token inválido ou não encontrado');
  }

  // 🚀 Verificar cache primeiro
  const cache = withCache(cacheConfigs.auth);
  const cachedResponse = cache.check(req, userId);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Buscar dados do usuário
  console.log('userId do payload:', payload.userId);

  const user = await prisma.user.findFirst({
    where: {
      id: payload.userId,
      deleted_at: null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      role: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!user) {
    return ApiResponse.notFoundError('Usuário');
  }

  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role.name,
  };

  return ApiResponse.success(userData, 'Usuário autenticado com sucesso');
};
