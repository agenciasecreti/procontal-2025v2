import ApiResponse from '@/lib/api-response';
import prisma from '@/lib/prisma';
import { validatePassword } from '@/lib/validations/user';
import bcrypt from 'bcrypt';
import { NextRequest } from 'next/server';

/**
 * Rota para redefinir a senha de um usuário.
 * Permite que usuários redefinam suas senhas usando um código de verificação.
 * @param req
 * @route POST /api/auth/change
 * @returns NextResponse com mensagem de sucesso ou erro.
 */
export async function POST(req: NextRequest) {
  // Extrai os dados do corpo da requisição
  let code, password, confirmPassword;
  try {
    ({ code, password, confirmPassword } = await req.json());
  } catch {
    return ApiResponse.validationError('Dados inválidos no corpo da requisição.');
  }

  if (!code) return ApiResponse.validationError('Código é obrigatório.');

  if (!password || !confirmPassword)
    return ApiResponse.validationError('Nova senha e confirmação são obrigatórias.');

  if (password !== confirmPassword) return ApiResponse.validationError('As senhas não coincidem.');

  // Valida a senha usando nossa função centralizada
  const passwordValidation = validatePassword(password, confirmPassword);
  if (!passwordValidation.isValid) {
    return ApiResponse.validationError(passwordValidation.error || 'Senha inválida');
  }

  // Verifica se o código existe no banco de dados e se ainda nao expirou
  const user = await prisma.user.findFirst({
    where: {
      reset_code: code,
      reset_code_expires: { gte: new Date() },
      deleted_at: null,
    },
  });
  if (!user) return ApiResponse.notFoundError('Código inválido ou expirado');

  console.log('Usuário encontrado:', user);

  // Atualiza a senha do usuário
  const passwordHash = bcrypt.hashSync(password, 10);

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { password: passwordHash, reset_code: null, reset_code_expires: null },
    });
  } catch (error) {
    return ApiResponse.internalServerError('Erro ao atualizar o usuário.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  return ApiResponse.success({ message: 'Senha redefinida com sucesso.' });
}
