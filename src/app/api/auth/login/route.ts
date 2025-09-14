import ApiResponse from '@/lib/api-response';
import { generateToken, verifyPassword } from '@/lib/middlewares/auth';
import { rateLimit, rateLimitConfigs, sanitizeInput } from '@/lib/middlewares/security';
import { userSchemas, validateData } from '@/lib/middlewares/validation';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { NextRequest } from 'next/server';

// Schema de validação para login (sem restrição de admin)
const { login: loginSchema } = userSchemas;

/**
 * Rota para autenticação de login.
 * Permite que usuários façam login com email e senha.
 * Utiliza middlewares de segurança, validação e rate limiting.
 * @param req - Requisição HTTP
 * @route POST /auth/login
 * @returns NextResponse com os dados do usuário autenticado ou erro
 */
export async function POST(req: NextRequest) {
  // Extrai os dados do corpo da requisição
  let res;
  try {
    res = await req.json();
  } catch (error) {
    return ApiResponse.badRequest('Dados inválidos no corpo da requisição', {
      message: error instanceof Error ? error.message : error,
    });
  }

  // Aplicar rate limiting para auth
  const authRateLimit = rateLimit(rateLimitConfigs.auth);
  const rateLimitResult = authRateLimit(req);
  if (rateLimitResult instanceof ApiResponse) {
    return rateLimitResult;
  }

  // Sanitiza os dados de entrada
  const sanitizedBody = sanitizeInput(res);

  const validation = validateData(loginSchema, sanitizedBody);
  if (!validation.success) {
    return ApiResponse.badRequest('Dados de login inválidos', {
      details: validation.errors,
    });
  }

  const { email, password } = validation.data!;

  // Consulta o usuário no banco de dados por email e se ele está ativo
  const user = await prisma.user.findFirst({
    where: { email: email as string, deleted_at: null },
    include: { role: true },
  });

  // Verifica se o usuário existe
  if (!user || !user.password) {
    return ApiResponse.authenticationError('Credenciais Inválidas');
  }

  // Verifica se a senha está correta usando o método seguro
  const isPasswordValid = await verifyPassword(password as string, user.password);

  if (!isPasswordValid) {
    return ApiResponse.authenticationError('Credenciais Inválidas');
  }

  // Gera o token JWT usando o método seguro
  const accessToken = await generateToken({
    userId: user.id,
    email: email as string,
    role: user.role.name,
  });

  // Gera refresh token
  const refreshTokenValue = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias validade

  await prisma.refreshToken.create({
    data: {
      token: refreshTokenValue,
      user_id: user.id,
      user_agent: req.headers.get('user-agent') || null,
      ip_address:
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        'unknown',
      expires_at: expiresAt,
    },
  });

  const response = ApiResponse.success({
    user: {
      id: user.id,
      name: user.name,
      role: user.role.name,
    },
    accessToken,
    refreshToken: refreshTokenValue,
  });

  // Access Token cookie com configurações seguras
  response.cookies.set({
    name: 'accessToken',
    value: accessToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 1, // 1 hora (mais seguro)
    path: '/',
    sameSite: 'strict',
  });

  // Refresh Token cookie
  response.cookies.set({
    name: 'refreshToken',
    value: refreshTokenValue,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    path: '/',
    sameSite: 'strict',
  });

  return response;
}
