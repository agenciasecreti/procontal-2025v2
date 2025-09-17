import ApiResponse from '@/lib/api-response';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { CourseModule } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Rotas para gerenciar um módulo específico.
 * @param req - Requisição HTTP
 * @param params - Parâmetros da rota, incluindo o ID do módulo
 * @returns NextResponse com os dados do módulo ou erro
 */

// @route PUT /api/courses/[id]/modules/[moduleId]
// Retorna os dados de um módulo específico.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { id, moduleId } = await params;

  type ModuleDetail = CourseModule;

  let courseModule: ModuleDetail | null;

  try {
    // Consulta o módulo no banco de dados
    courseModule = await prisma.courseModule.findUnique({
      where: {
        id: parseInt(moduleId),
        course_id: parseInt(id),
        deleted_at: null,
      },
    });
  } catch (error) {
    return ApiResponse.internalServerError('Erro ao recuperar o módulo.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  // Se o módulo não for encontrado, retorna um erro 404
  if (!courseModule) return ApiResponse.notFoundError('Módulo');

  return ApiResponse.success({
    ...courseModule,
  });
}

// @route PUT /api/courses/[id]
// Atualiza os dados de um course específico.
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  const { id, moduleId } = await params;

  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  // Extrai os dados do corpo da requisição
  const { title, slug, workload, content } = await req.json();

  let uniqueSlug = slug ? slug : title.slugify();

  // Verifica se já existe um curso com o mesmo slug e id diferente
  const existing = await prisma.course.findFirst({
    where: {
      slug: uniqueSlug,
      id: { not: parseInt(id) },
    },
  });

  if (existing) uniqueSlug = `${uniqueSlug}-${Date.now().toString(36)}`;

  // Verifica se o módulo existe e se o ID é um número válido
  const courseModule = await prisma.courseModule.findUnique({
    where: { id: parseInt(moduleId), course_id: parseInt(id), deleted_at: null },
  });
  if (!courseModule) {
    return ApiResponse.notFoundError('Módulo');
  }

  try {
    // Atualiza o módulo no banco de dados
    await prisma.courseModule.update({
      where: { id: parseInt(moduleId), deleted_at: null },
      data: {
        title,
        slug: slug !== undefined ? (slug ? slug : uniqueSlug) : uniqueSlug,
        workload: workload !== undefined ? (workload ? Number(workload) : undefined) : undefined,
        content: content !== undefined ? (content ? content : undefined) : undefined,
      },
    });
  } catch (error) {
    return ApiResponse.internalServerError('Erro ao atualizar o módulo.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  return ApiResponse.success({
    message: 'Módulo atualizado com sucesso.',
  });
}
