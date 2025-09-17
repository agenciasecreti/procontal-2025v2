import ApiResponse from '@/lib/api-response';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// @route UPDATE /api/teachers/[id]/active
// Atualiza o status de um professor (ativo/inativo)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;

  const body = await req.json();
  const { active } = body;

  //Verifica se o professor existe e se o ID é um número válido
  const teacher = await prisma.teacher.findUnique({
    where: { id: parseInt(id), deleted_at: null }, // Verifica se o professor nao está excluído
  });
  if (!teacher) {
    return ApiResponse.notFoundError('Professor não encontrado.');
  }

  let updatedTeacher;
  try {
    // Atualiza o professor no banco de dados
    updatedTeacher = await prisma.teacher.update({
      where: { id: parseInt(id), deleted_at: null }, // Verifica se o professor não está excluído
      data: {
        active: active ?? false,
      },
    });
  } catch (error) {
    return ApiResponse.internalServerError('Erro ao restaurar o professor.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  // Se o professor não foi atualizado, retorna um erro 404
  if (!updatedTeacher) return ApiResponse.notFoundError('Professor não atualizado.');

  return ApiResponse.success({
    message: `Professor ${active ? 'ativado' : 'desativado'} com sucesso.`,
  });
}
