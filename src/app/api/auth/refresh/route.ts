import ApiResponse from '@/lib/api-response';
import { generateToken } from '@/lib/middlewares/auth';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

/**
 * Rota para refresh de token.
 * @route POST /auth/refresh
 * @returns NextResponse com o novo token de acesso ou erro.
 */
export async function POST() {
  // Obtém o refresh token do cookie
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (!refreshToken) {
    return ApiResponse.validationError(
      'Refresh token não informado. Nenhum token de atualização encontrado nos cookies.'
    );
  }

  const tokenInDb = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: { include: { role: true } } },
  });

  if (!tokenInDb || tokenInDb.revoked || new Date() > tokenInDb.expires_at) {
    return ApiResponse.authenticationError('Refresh token inválido ou expirado.');
  }

  const user = tokenInDb.user;

  // Gera o token JWT usando o método seguro
  const newAccessToken = await generateToken({
    userId: user.id,
    email: user.email,
    role: user.role.name,
  });

  return ApiResponse.success({
    accessToken: newAccessToken,
  });
}
