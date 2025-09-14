import ApiResponse from '@/lib/api-response';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Rota para restaurar um usuário excluído.
 * @param req
 * @param params
 * @route PUT /api/users/[id]/restore
 * @returns
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;

  //Verifica se o usuário existe e se o ID é um número válido
  const user = await prisma.user.findUnique({
    where: { id: parseInt(id), deleted_at: { not: null } }, // Verifica se o usuário está excluído
  });
  if (!user) {
    return ApiResponse.notFoundError('Usuário');
  }

  let updatedUser;
  try {
    // Atualiza o usuário no banco de dados
    updatedUser = await prisma.user.update({
      where: { id: parseInt(id), deleted_at: { not: null } }, // Verifica se o usuário está excluído
      data: {
        deleted_at: null,
      },
    });
  } catch (error) {
    return ApiResponse.internalServerError('Erro ao restaurar o usuário.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  // Se o usuário não foi atualizado, retorna um erro 404
  if (!updatedUser) return ApiResponse.notFoundError('Usuário');

  return ApiResponse.success({
    message: 'Usuário restaurado com sucesso.',
  });
}
