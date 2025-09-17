import ApiResponse from '@/lib/api-response';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// @route UPDATE /api/courses/[id]/active
// Atualiza o status de um curso (ativo/inativo)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;

  const body = await req.json();
  const { active } = body;

  //Verifica se o curso existe e se o ID é um número válido
  const course = await prisma.course.findUnique({
    where: { id: parseInt(id), deleted_at: null }, // Verifica se o curso nao está excluído
  });
  if (!course) {
    return ApiResponse.notFoundError('Curso não encontrado.');
  }

  let updatedCourse;
  try {
    // Atualiza o curso no banco de dados
    updatedCourse = await prisma.course.update({
      where: { id: parseInt(id), deleted_at: null }, // Verifica se o curso não está excluído
      data: {
        active: active ?? false,
      },
    });
  } catch (error) {
    return ApiResponse.internalServerError('Erro ao restaurar o curso.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  // Se o curso não foi atualizado, retorna um erro 404
  if (!updatedCourse) return ApiResponse.notFoundError('Curso não atualizado.');

  return ApiResponse.success({
    message: `Curso ${active ? 'ativado' : 'desativado'} com sucesso.`,
  });
}
