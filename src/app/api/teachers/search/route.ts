import ApiResponse from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { pagination } from 'prisma-extension-pagination';

// Importa o Prisma Client e a extensão de paginação
const prismaExt = prisma.$extends(pagination());

/**
 * Rota para gerenciar professores.
 * Permite listar todos os professores e criar um novo professor.
 * @param req
 * @returns NextResponse com a lista de professores ou o professor criado.
 */

// @route GET /api/teachers/search
// Retorna a lista de professores ativos (não deletados).
export async function GET(req: NextRequest) {
  // Rota pública - não requer autenticação para buscar professores

  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10');
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
  const search = (req.nextUrl.searchParams.get('search') || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
  const select = req.nextUrl.searchParams.get('select') || '';
  const active =
    req.nextUrl.searchParams.get('active') !== null
      ? req.nextUrl.searchParams.get('active') === 'true'
      : null;

  // Prepara os campos a serem selecionados na consulta separados por vírgula.
  let columns = {} as Record<string, boolean | { select: Record<string, boolean> }>;
  if (select) {
    columns = select
      .split(',')
      .reduce(
        (acc: Record<string, boolean | { select: Record<string, boolean> }>, field: string) => {
          // Verifica se o campo é válido e não vazio
          if (field && field.trim()) {
            // Se o campo contém um ponto, trata como um relacionamento aninhado
            if (field.split('.').length > 1) {
              const key = field.trim().split('.')[0];
              const subfield = field.trim().split('.')[1];
              const prev = acc[key];
              acc[key] = {
                select: {
                  ...(typeof prev === 'object' && prev !== null && 'select' in prev
                    ? prev.select
                    : {}),
                  [subfield]: true,
                },
              };
            } else {
              acc[field.trim()] = true;
            }
          }
          return acc;
        },
        {}
      );
  } else {
    columns = {
      id: true,
      name: true,
      full_name: true,
      bio: true,
      genre: true,
      prefix: true,
      image: true,
      active: true,
    };
  }

  let teachers;
  let meta;
  try {
    // Consulta todos os professores ativos (não deletados) com paginação e filtragem por posição e pesquisa
    [teachers, meta] = await prismaExt.teacher
      .paginate({
        where: {
          deleted_at: null,
          ...(typeof active === 'boolean' ? { active: active } : {}),
          ...(search && {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { full_name: { contains: search, mode: 'insensitive' } },
              { bio: { contains: search, mode: 'insensitive' } },
              { prefix: { contains: search, mode: 'insensitive' } },
            ],
          }),
        },
        orderBy: { created_at: 'asc' },
        select: columns,
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
