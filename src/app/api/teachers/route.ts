import ApiResponse from '@/lib/api-response';
import { verifyAuth } from '@/lib/auth';

import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { pagination } from 'prisma-extension-pagination';

// Importa o Prisma Client e a extensão de paginação
const prismaExt = prisma.$extends(pagination());

/**
 * Rota para gerenciar professores.
 * Permite listar todos os professores e criar um novo professor.
 * @param req
 * @returns NextResponse com a lista de professores ou o professor criado.
 */

// @route GET /api/teachers
// Retorna a lista de professores ativos (não deletados).
export async function GET(req: NextRequest) {
  // Rota pública - não requer autenticação para listar professores

  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10');
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1');

  let teachers;
  let meta;
  try {
    // Consulta todos os professores ativos (não deletados) e inclui suas funções
    [teachers, meta] = await prismaExt.teacher
      .paginate({
        where: { deleted_at: null },
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          name: true,
          full_name: true,
          bio: true,
          genre: true,
          prefix: true,
          image: true,
          active: true,
        },
      })
      .withPages({
        limit: limit,
        includePageCount: true,
        page: page,
      });
  } catch (error) {
    return ApiResponse.internalServerError('Não foi possível recuperar os professores.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  return ApiResponse.paginated(teachers, {
    total: meta.totalCount,
    limit: limit,
    pages: meta.pageCount,
    page: meta.currentPage,
  });
}

// @route POST /api/teachers
// Cria um novo professor com os dados fornecidos no corpo da requisição.
export async function POST(req: NextRequest) {
  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  let res;
  try {
    res = await req.json();
  } catch (error) {
    return ApiResponse.validationError('Erro ao ler os dados da requisição.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  const { name, full_name, bio, genre, prefix, image, active } = res;

  // Cria o novo professor no banco de dados, gerando um erro se não for possível
  let newTeacher;
  try {
    newTeacher = await prisma.teacher.create({
      data: {
        name,
        full_name,
        bio,
        genre,
        prefix,
        image,
        active: active !== undefined ? active : false,
      },
    });
  } catch (error) {
    console.error('Erro ao criar professor:', error);
    return ApiResponse.badRequest('Não foi possível criar o professor.');
  }

  return ApiResponse.success(
    { message: 'Professor criado com sucesso.', id: newTeacher.id },
    'Professor criado com sucesso.'
  );
}
