import ApiResponse from '@/lib/api-response';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { pagination } from 'prisma-extension-pagination';

// Importa o Prisma Client e a extensão de paginação
const prismaExt = prisma.$extends(pagination());

/**
 * Rota para gerenciar os professors do curso.
 * Permite listar todos os professors e criar um novo professor.
 * @param req
 * @returns NextResponse com a lista de professors ou o professor criado.
 */

// @route GET /api/courses/[id]/teachers
// Retorna a lista de professors do curso especificado.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10');
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
  const search = req.nextUrl.searchParams.get('search') || '';

  let teachers;
  let meta;
  try {
    // Consulta todos os professors do curso especificado usando a tabela de relacionamento courseTeacher
    [teachers, meta] = await prismaExt.teacher
      .paginate({
        where: {
          deleted_at: null, // Verifica se o professor não foi excluído
          courses: {
            some: {
              deleted_at: null, // Verifica se a inscrição não foi excluída
              course_id: parseInt(id),
            },
          },
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { full_name: { contains: search, mode: 'insensitive' } },
          ],
        },
        include: {
          courses: {
            where: {
              deleted_at: null, // Verifica se a inscrição não foi excluída
              course_id: parseInt(id), // Filtra apenas os professors do curso especificado
            },
            include: {
              course: true, // Inclui os detalhes do curso
            },
          },
          user: true, // Inclui os detalhes do usuário associado ao professor
        },
        orderBy: {
          name: 'asc', // Ordena os professors pelo nome
        },
      })
      .withPages({
        limit: limit,
        includePageCount: true,
        page: page,
      });
  } catch (error) {
    return ApiResponse.internalServerError('Não foi possível recuperar os professors do curso.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  return ApiResponse.paginated(teachers, {
    total: meta.totalCount,
    limit: limit,
    page: meta.currentPage,
    pages: meta.pageCount,
  });
}

// @route POST /api/courses/[id]/teachers
// Adiciona um novo professor à um curso especificado.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;

  try {
    const body = await req.json();
    const { teacher_id } = body;

    // Verifica se o professor já está inscrito no curso
    const existing = await prisma.courseTeacher.findFirst({
      where: {
        course_id: parseInt(id),
        teacher_id: parseInt(teacher_id),
        deleted_at: null, // Verifica se a inscrição não foi excluída
      },
    });

    if (existing) {
      return ApiResponse.badRequest('Professor já está inscrito neste curso.', {
        details: 'Por favor, verifique se o ID do professor está correto.',
      });
    }

    // Cria a inscrição do professor no curso
    const courseTeacher = await prisma.courseTeacher.create({
      data: {
        course_id: parseInt(id),
        teacher_id: parseInt(teacher_id),
      },
    });

    return ApiResponse.success(courseTeacher, 'Professor adicionado ao curso com sucesso.', 201);
  } catch (error) {
    return ApiResponse.internalServerError('Não foi possível adicionar o professor ao curso.', {
      details: error instanceof Error ? error.message : error,
    });
  }
}

// @route DELETE /api/courses/[id]/teachers
// Remove um professor de um curso especificado.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;

  try {
    const body = await req.json();
    const { teacher_id } = body;

    // Verifica se o professor está inscrito no curso
    const existing = await prisma.courseTeacher.findFirst({
      where: {
        course_id: parseInt(id),
        teacher_id: parseInt(teacher_id),
        deleted_at: null, // Verifica se a inscrição não foi excluída
      },
    });

    if (!existing) {
      return ApiResponse.badRequest('Professor não está inscrito neste curso.', {
        details: 'Por favor, verifique se o ID do professor está correto.',
      });
    }

    // Adiciona deleted_at a inscrição do professor no curso
    await prisma.courseTeacher.update({
      where: {
        id: existing.id,
      },
      data: {
        deleted_at: new Date(),
      },
    });

    return ApiResponse.success({ message: 'Professor removido do curso com sucesso.' });
  } catch (error) {
    return ApiResponse.internalServerError('Não foi possível remover o professor do curso.', {
      details: error instanceof Error ? error.message : error,
    });
  }
}
