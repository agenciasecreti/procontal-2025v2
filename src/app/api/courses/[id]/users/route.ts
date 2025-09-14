import ApiResponse from '@/lib/api-response';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { pagination } from 'prisma-extension-pagination';

// Importa o Prisma Client e a extensão de paginação
const prismaExt = prisma.$extends(pagination());

/**
 * Rota para gerenciar os usuarios do curso.
 * Permite listar todos os usuarios e criar um novo usuario.
 * @param req
 * @returns NextResponse com a lista de usuarios ou o usuario criado.
 */

// @route GET /api/courses/[id]/users
// Retorna a lista de usuarios do curso especificado.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10');
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
  const search = req.nextUrl.searchParams.get('search') || '';

  let users;
  let meta;
  try {
    // Consulta todos os usuarios do curso especificado usando a tabela de relacionamento courseUser
    [users, meta] = await prismaExt.user
      .paginate({
        where: {
          deleted_at: null, // Verifica se o usuario não foi excluído
          courses: {
            some: {
              deleted_at: null, // Verifica se a inscrição não foi excluída
              course_id: parseInt(id),
            },
          },
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
        include: {
          courses: {
            where: {
              deleted_at: null, // Verifica se a inscrição não foi excluída
              course_id: parseInt(id), // Filtra apenas os usuarios do curso especificado
            },
            include: {
              course: true, // Inclui os detalhes do curso
            },
          },
        },
        orderBy: {
          name: 'asc', // Ordena os usuarios pelo nome
        },
      })
      .withPages({
        limit: limit,
        includePageCount: true,
        page: page,
      });
  } catch (error) {
    return ApiResponse.internalServerError('Não foi possível recuperar os alunos do curso.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  return ApiResponse.paginated(users, {
    total: meta.totalCount,
    limit: limit,
    page: meta.currentPage,
    pages: meta.pageCount,
  });
}

// @route POST /api/courses/[id]/users
// Adiciona um novo usuario à um curso especificado.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;

  try {
    const body = await req.json();
    const { userId } = body;

    // Verifica se o usuario já está inscrito ATIVAMENTE no curso
    const existing = await prisma.courseUser.findFirst({
      where: {
        course_id: parseInt(id),
        user_id: parseInt(userId),
        deleted_at: null, // Verifica se a inscrição não foi excluída
      },
    });

    if (existing) {
      return ApiResponse.badRequest('Usuario já está inscrito neste curso.', {
        details: 'Por favor, verifique se o ID do usuario está correto.',
      });
    }

    // Cria uma nova inscrição do usuario no curso (mesmo que já tenha existido antes)
    const courseUser = await prisma.courseUser.create({
      data: {
        course_id: parseInt(id),
        user_id: parseInt(userId),
      },
    });

    return ApiResponse.success(courseUser, 'Usuário adicionado ao curso com sucesso.', 201);
  } catch (error) {
    return ApiResponse.internalServerError('Não foi possível adicionar o aluno ao curso.', {
      details: error instanceof Error ? error.message : error,
    });
  }
}

// @route DELETE /api/courses/[id]/users
// Remove um usuario de um curso especificado.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;

  try {
    const body = await req.json();
    const { userId } = body;

    // Verifica se o usuario está inscrito no curso
    const existing = await prisma.courseUser.findFirst({
      where: {
        course_id: parseInt(id),
        user_id: parseInt(userId),
        deleted_at: null, // Verifica se a inscrição não foi excluída
      },
    });

    if (!existing) {
      return ApiResponse.badRequest('Usuario não está inscrito neste curso.', {
        details: 'Por favor, verifique se o ID do usuario está correto.',
      });
    }

    // Adiciona deleted_at a inscrição do usuario no curso
    await prisma.courseUser.update({
      where: {
        id: existing.id,
      },
      data: {
        deleted_at: new Date(),
      },
    });

    return ApiResponse.success({ message: 'Usuario removido do curso com sucesso.' });
  } catch (error) {
    return ApiResponse.internalServerError('Não foi possível remover o aluno do curso.', {
      details: error instanceof Error ? error.message : error,
    });
  }
}

// @route UPDATE /api/courses/[id]/users
// Atualiza a inscrição de um usuario em um curso especificado.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;

  try {
    const body = await req.json();
    const { userId, active } = body;

    // Verifica se o usuario está inscrito no curso
    const existing = await prisma.courseUser.findFirst({
      where: {
        course_id: parseInt(id),
        user_id: parseInt(userId),
        deleted_at: null, // Verifica se a inscrição não foi excluída
      },
    });

    if (!existing) {
      return ApiResponse.badRequest('Usuario não está inscrito neste curso.', {
        details: 'Por favor, verifique se o ID do usuario está correto.',
      });
    }

    // Atualiza a inscrição do usuario para o novo curso
    const updatedCourseUser = await prisma.courseUser.update({
      where: {
        id: existing.id,
      },
      data: {
        active: active !== undefined ? active : existing.active, // Atualiza o status ativo se fornecido
      },
    });

    return ApiResponse.success(updatedCourseUser);
  } catch (error) {
    return ApiResponse.internalServerError(
      'Não foi possível atualizar a inscrição do aluno no curso.',
      { details: error instanceof Error ? error.message : error }
    );
  }
}
