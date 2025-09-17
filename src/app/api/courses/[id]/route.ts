import ApiResponse from '@/lib/api-response';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Course, CourseCategory, CourseModule, CourseTeacher, CourseUser } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Rotas para gerenciar um course específico.
 * @param req - Requisição HTTP
 * @param params - Parâmetros da rota, incluindo o ID do curso
 * @returns NextResponse com os dados do curso ou erro
 */

// @route GET /api/courses/[id]
// Retorna os dados de um course específico.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  //Rota pública, não necessita de autenticação

  const { id } = await params;
  const join = req.nextUrl.searchParams.get('join')?.split(',') || [];

  type CourseDetail = Course & {
    categories?: CourseCategory[] | null;
    teachers?: CourseTeacher[] | null;
    modules?: CourseModule[] | null;
    users?: CourseUser[] | null;
  };

  let course: CourseDetail | null;
  let categories: CourseCategory[] | null = null;
  let teachers: CourseTeacher[] | null = null;
  let modules: CourseModule[] | null = null;
  let users: CourseUser[] | null = null;

  try {
    // Consulta o post no banco de dados
    //verifica se o id é um inteiro ou um slug
    if (isNaN(parseInt(id))) {
      course = await prisma.course.findUnique({
        where: { slug: id, deleted_at: null },
      });
    } else {
      course = await prisma.course.findUnique({
        where: { id: parseInt(id), deleted_at: null },
      });
    }

    if (join.includes('categories') && course) {
      categories = await prisma.courseCategory.findMany({
        where: { course_id: course.id, deleted_at: null, category: { deleted_at: null } },
        include: {
          category: true,
        },
      });
    }

    if (join.includes('teachers') && course) {
      teachers = await prisma.courseTeacher.findMany({
        where: { course_id: course.id, deleted_at: null, teacher: { deleted_at: null } },
        include: {
          teacher: true,
        },
      });
    }

    if (join.includes('modules') && course) {
      modules = await prisma.courseModule.findMany({
        where: { course_id: course.id, deleted_at: null },
      });
    }

    if (join.includes('users') && course) {
      users = await prisma.courseUser.findMany({
        where: { course_id: course.id, deleted_at: null, user: { deleted_at: null } },
        include: {
          user: true,
        },
      });
    }
  } catch (error) {
    return ApiResponse.internalServerError('Erro ao recuperar o curso.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  // Se o curso não for encontrado, retorna um erro 404
  if (!course) return ApiResponse.notFoundError('Curso');

  return ApiResponse.success({
    ...course,
    ...(join.includes('categories') ? { categories } : {}),
    ...(join.includes('teachers') ? { teachers } : {}),
    ...(join.includes('modules') ? { modules } : {}),
    ...(join.includes('users') ? { users } : {}),
  });
}

// @route PUT /api/courses/[id]
// Atualiza os dados de um course específico.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  // Extrai os dados do corpo da requisição
  const { title, slug, workload, image, content, startDate, endDate, active } = await req.json();

  let uniqueSlug = slug ? slug : title.slugify();

  // Verifica se já existe um curso com o mesmo slug e id diferente
  const existing = await prisma.course.findFirst({
    where: {
      slug: uniqueSlug,
      id: { not: parseInt(id) },
    },
  });

  if (existing) uniqueSlug = `${uniqueSlug}-${Date.now().toString(36)}`;

  let newStartDate;
  if (startDate && isNaN(new Date(startDate).getTime())) {
    return ApiResponse.validationError('Data de início inválida.');
  } else {
    if (startDate) newStartDate = new Date(startDate);
  }

  let newEndDate;
  if (endDate === '') {
    newEndDate = null; // Limpa o campo no banco de dados
  } else if (endDate && isNaN(new Date(endDate).getTime())) {
    return ApiResponse.validationError('Data de término inválida.');
  } else {
    if (endDate) newEndDate = new Date(endDate);
  }

  // Verifica se o curso existe e se o ID é um número válido
  const course = await prisma.course.findUnique({
    where: { id: parseInt(id), deleted_at: null },
  });
  if (!course) {
    return ApiResponse.notFoundError('Curso');
  }

  try {
    // Atualiza o curso no banco de dados
    await prisma.course.update({
      where: { id: parseInt(id), deleted_at: null },
      data: {
        title,
        slug: slug !== undefined ? (slug ? slug : uniqueSlug) : uniqueSlug,
        workload: workload !== undefined ? (workload ? Number(workload) : undefined) : undefined,
        content: content !== undefined ? (content ? content : undefined) : undefined,
        image: image !== undefined ? (image ? image : undefined) : undefined,
        start_date: newStartDate,
        end_date: newEndDate,
        active: active !== undefined ? active : false,
      },
    });
  } catch (error) {
    return ApiResponse.internalServerError('Erro ao atualizar o curso.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  return ApiResponse.success({
    message: 'Curso atualizado com sucesso.',
  });
}

// @route DELETE /api/courses/[id]
// Marca um curso como deletado, definindo a data de exclusão.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  console.log('Deletando curso com ID:', id);

  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  // Localiza o curso pelo ID e verifica se ele não está marcado como deletado
  const course = await prisma.course.findUnique({
    where: { id: parseInt(id), deleted_at: null },
  });

  // Se o curso não for encontrado ou já estiver deletado, retorna um erro 404
  if (!course) return ApiResponse.notFoundError('Curso');

  let deletedCourse;
  try {
    // Marca o curso como deletado, definindo a data de exclusão
    deletedCourse = await prisma.course.update({
      where: { id: parseInt(id), deleted_at: null },
      data: {
        deleted_at: new Date(),
      },
    });
  } catch (error) {
    return ApiResponse.internalServerError('Erro ao deletar o curso.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  // Se o curso não foi encontrado, retorna um erro 404
  if (!deletedCourse) return ApiResponse.notFoundError('Curso');

  return ApiResponse.success({
    message: 'Curso deletado com sucesso.',
  });
}
