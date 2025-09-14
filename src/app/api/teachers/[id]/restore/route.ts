import ApiResponse from '@/lib/api-response';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// @route PUT /api/posts/[id]/restore
// Restaura um professor excluído, atualizando seus dados e removendo a data de exclusão.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  //Verifica se o professor existe e se o ID é um número válido
  const teacher = await prisma.teacher.findUnique({
    where: { id: parseInt(id), deleted_at: { not: null } }, // Verifica se o professor está excluído
  });
  if (!teacher) {
    return ApiResponse.notFoundError('Professor');
  }

  let updatedTeacher;
  try {
    // Atualiza o professor no banco de dados
    updatedTeacher = await prisma.teacher.update({
      where: { id: parseInt(id), deleted_at: { not: null } }, // Verifica se o professor está excluído
      data: {
        deleted_at: null,
      },
    });
  } catch (error) {
    return ApiResponse.internalServerError('Erro ao restaurar o professor.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  // Se o professor não foi atualizado, retorna um erro 404
  if (!updatedTeacher) return ApiResponse.notFoundError('Professor');

  return ApiResponse.success({
    message: 'Professor restaurado com sucesso.',
  });
}
