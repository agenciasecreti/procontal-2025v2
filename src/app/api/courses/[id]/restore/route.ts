import ApiResponse from '@/lib/api-response';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// @route PUT /api/posts/[id]/restore
// Restaura um curso excluído, atualizando seus dados e removendo a data de exclusão.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  //Verifica se o curso existe e se o ID é um número válido
  const course = await prisma.course.findUnique({
    where: { id: parseInt(id), deleted_at: { not: null } }, // Verifica se o curso está excluído
  });
  if (!course) {
    return ApiResponse.notFoundError('Curso');
  }

  let updatedCourse;
  try {
    // Atualiza o curso no banco de dados
    updatedCourse = await prisma.course.update({
      where: { id: parseInt(id), deleted_at: { not: null } }, // Verifica se o curso está excluído
      data: {
        deleted_at: null,
      },
    });
  } catch (error) {
    return ApiResponse.internalServerError('Erro ao restaurar o curso.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  // Se o curso não foi atualizado, retorna um erro 404
  if (!updatedCourse) return ApiResponse.notFoundError('Curso');

  return ApiResponse.success({
    message: 'Curso restaurado com sucesso.',
  });
}
