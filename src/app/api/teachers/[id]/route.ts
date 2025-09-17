import ApiResponse from '@/lib/api-response';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { CourseTeacher, Teacher, User } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Rotas para gerenciar um teacher específico.
 * @param req - Requisição HTTP
 * @param params - Parâmetros da rota, incluindo o ID do professor
 * @returns NextResponse com os dados do professor ou erro
 */

// @route GET /api/teachers/[id]
// Retorna os dados de um professor específico.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Rotina protegida pelo middleware CORS - permite acesso apenas do próprio app

  const { id } = await params;
  const join = req.nextUrl.searchParams.get('join')?.split(',') || [];

  type TeacherDetail = Teacher & {
    id?: number;
    user?: User | null;
    courses?: { course: CourseTeacher }[] | null;
  };

  let teacher: TeacherDetail | null;
  let user: User | null = null;
  let courses: CourseTeacher[] | null = null;

  try {
    // Consulta o professor no banco de dados
    teacher = await prisma.teacher.findUnique({
      where: {
        id: parseInt(id),
        deleted_at: null,
      },
    });

    if (join.includes('user') && teacher && teacher.user_id !== null) {
      user = await prisma.user.findUnique({
        where: { id: teacher.user_id, deleted_at: null },
      });
    }

    if (join.includes('courses') && teacher) {
      courses = await prisma.courseTeacher.findMany({
        where: { teacher_id: teacher.id, deleted_at: null, course: { deleted_at: null } },
        include: {
          course: true,
        },
      });
    }
  } catch (error) {
    return ApiResponse.internalServerError('Erro ao recuperar o professor.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  // Se o professor não for encontrado, retorna um erro 404
  if (!teacher) return ApiResponse.notFoundError('Professor');

  return ApiResponse.success({
    ...teacher,
    ...(join.includes('user') ? { user } : {}),
    ...(join.includes('courses') ? { courses } : {}),
  });
}

// @route PUT /api/teachers/[id]
// Atualiza os dados de um professor específico.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  // Extrai os dados do corpo da requisição
  const { name, bio, image, active } = await req.json();
  const data = {
    name,
    bio,
    image,
    active: active !== undefined ? active : false,
  };

  // Verifica se o professor existe e se o ID é um número válido
  const teacher = await prisma.teacher.findUnique({
    where: { id: parseInt(id), deleted_at: null },
  });
  if (!teacher) {
    return ApiResponse.notFoundError('Professor');
  }

  try {
    // Atualiza o professor no banco de dados
    await prisma.teacher.update({
      where: { id: parseInt(id), deleted_at: null },
      data,
    });
  } catch (error) {
    return ApiResponse.internalServerError('Erro ao atualizar o professor.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  return ApiResponse.success({
    message: 'Professor atualizado com sucesso.',
  });
}

// @route DELETE /api/teachers/[id]
// Marca um professor como deletado, definindo a data de exclusão.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  console.log('Deletando professor com ID:', id);

  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  // Localiza o professor pelo ID e verifica se ele não está marcado como deletado
  const teacher = await prisma.teacher.findUnique({
    where: { id: parseInt(id), deleted_at: null },
  });

  // Se o professor não for encontrado ou já estiver deletado, retorna um erro 404
  if (!teacher) return ApiResponse.notFoundError('Professor');

  let deletedTeacher;
  try {
    // Marca o professor como deletado, definindo a data de exclusão
    deletedTeacher = await prisma.teacher.update({
      where: { id: parseInt(id), deleted_at: null },
      data: {
        deleted_at: new Date(),
      },
    });
  } catch (error) {
    return ApiResponse.internalServerError('Erro ao deletar o professor.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  // Se o professor não foi encontrado, retorna um erro 404
  if (!deletedTeacher) return ApiResponse.notFoundError('Professor');

  return ApiResponse.success({
    message: 'Professor deletado com sucesso.',
  });
}
