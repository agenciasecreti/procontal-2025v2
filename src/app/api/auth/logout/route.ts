import ApiResponse from '@/lib/api-response';
import prisma from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

/**
 * Rota para logout do usuário.
 * Revoga o refresh token e remove os cookies de autenticação.
 * @param req - Requisição HTTP
 * @route POST /auth/logout
 * @returns NextResponse com mensagem de sucesso ou erro
 */
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  let refreshToken = cookieStore.get('refreshToken')?.value;
  let accessToken = cookieStore.get('accessToken')?.value;

  // Caso não encontre o accessToken no cookie, procura no header por bearer token
  if (!accessToken) {
    const authHeader = req.headers.get('authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (token) {
        accessToken = token;
      }
    }
  }

  if (!refreshToken) {
    if (!accessToken) {
      return ApiResponse.authenticationError(
        'Usuário não autenticado. Nenhum token de acesso ou atualização encontrado.'
      );
    }

    // Verifica se o accessToken é válido
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    let payload;
    try {
      const verified = await jwtVerify(accessToken, secret);
      payload = verified.payload;
    } catch (err) {
      console.error('Erro ao verificar accessToken:', err);
      return ApiResponse.authenticationError(
        'Autenticação inválida. O token de acesso fornecido é inválido.'
      );
    }

    const userId = payload.userId as number;

    // Busca o refreshToken no banco de dados
    const userToken = await prisma.refreshToken.findFirst({
      where: {
        user_id: userId,
        revoked: false,
        expires_at: {
          gt: new Date(), // Ainda não expirou
        },
      },
      orderBy: {
        created_at: 'desc', // Pega o mais recente
      },
    });
    refreshToken = userToken?.token;
  }

  // Seta os cookies de logout
  cookieStore.set('accessToken', '', { maxAge: 0, path: '/' });
  cookieStore.set('refreshToken', '', { maxAge: 0, path: '/' });

  // Revoga o refreshToken no banco de dados
  await prisma.refreshToken.update({
    where: { token: refreshToken },
    data: {
      revoked: true,
      revoked_at: new Date(),
    },
  });

  return ApiResponse.success({ message: 'Logout efetuado com sucesso.' });
}
