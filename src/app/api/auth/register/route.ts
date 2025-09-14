import ApiResponse from '@/lib/api-response';
import { generateToken } from '@/lib/middlewares/auth';
import prisma from '@/lib/prisma';
import { clearCpf, clearPhone } from '@/lib/utils';
import { isValidEmail, isValidName, validatePassword } from '@/lib/validations/user';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Rota para criar um novo usuário.
 * Permite que usuários se registrem com email e senha.
 * @param req
 * @route POST /auth/register
 * @returns NextResponse com os dados do usuário ou erro.
 */
export async function POST(req: NextRequest) {
  let name, email, whatsapp, cpf, password, confirmPassword;
  try {
    ({ name, email, whatsapp, cpf, password, confirmPassword } = await req.json());
  } catch {
    return ApiResponse.validationError('Erro ao processar a requisição.');
  }

  // Verifica se todos os campos obrigatórios foram preenchidos
  if (!name || !email || !password || !confirmPassword)
    return ApiResponse.validationError('Todos os campos são obrigatórios.');

  // Valida o nome
  if (!isValidName(name)) return ApiResponse.validationError('Nome inválido.');

  // Valida o email
  if (!isValidEmail(email)) return ApiResponse.validationError('E-mail inválido.');

  // Se a senha for diferente da confirmação de senha, retorna um erro
  if (password !== confirmPassword)
    return ApiResponse.validationError('As senhas fornecidas são diferentes.', {
      details: 'A senha e a confirmação não coincidem.',
    });

  // Valida a senha usando a função centralizada
  const passwordValidation = validatePassword(password, confirmPassword);
  if (!passwordValidation.isValid) {
    return ApiResponse.validationError(passwordValidation.error || 'Senha inválida');
  }

  // Verifica se o e-mail já está cadastrado
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUser)
    return ApiResponse.validationError('Já existe um usuário com este e-mail.', {
      details: 'Por favor, utilize outro e-mail para se registrar.',
    });

  // Criptografa a senha usando a função de validação que já faz o hash
  const passwordHash = passwordValidation.hashedPassword!;

  const role = await prisma.role.findFirst({
    where: { name: 'guest' },
  });
  if (!role) {
    return ApiResponse.validationError('Função padrão para usuários não encontrada.', {
      details: 'Entre em contato com o suporte.',
    });
  }

  // Cria o novo usuário no banco de dados, gerando um erro se não for possível
  let user;
  try {
    user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        whatsapp: whatsapp ? clearPhone(whatsapp) : null,
        cpf: cpf ? clearCpf(cpf) : null,
        password: passwordHash,
        role_id: role.id,
      },
    });
  } catch (error) {
    return ApiResponse.validationError('Não foi possível criar o usuário.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  // Gera o token JWT usando o método seguro
  const accessToken = await generateToken({
    userId: user.id,
    email: email as string,
    role: role.name,
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

  const response = NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      role: role.name,
    },
    accessToken,
    refreshToken: refreshTokenValue,
  });

  // Access Token cookie
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
