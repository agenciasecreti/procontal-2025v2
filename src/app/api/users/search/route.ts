import ApiResponse from '@/lib/api-response';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { pagination } from 'prisma-extension-pagination';

// Importa o Prisma Client e a extensão de paginação
const prismaExt = prisma.$extends(pagination());

/**
 * Rota para gerenciar usuários.
 * Permite listar todos os usuários e criar um novo usuário.
 * @param req
 * @route GET /api/users/search
 * @returns NextResponse com a lista de usuários ou o usuário criado.
 */
export async function GET(req: NextRequest) {
  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10');
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
  const search = (req.nextUrl.searchParams.get('search') || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
  const select = req.nextUrl.searchParams.get('select') || '';

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
      email: true,
      cpf: true,
      birth_date: true,
      phone: true,
      whatsapp: true,
      avatar: true,
      role: {
        select: {
          name: true,
        },
      },
    };
  }

  let users;
  let meta;
  try {
    // Consulta todos os usuários ativos (não deletados) e inclui suas funções
    [users, meta] = await prismaExt.user
      .paginate({
        where: {
          deleted_at: null,
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
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
    return ApiResponse.internalServerError('Não foi possível recuperar os usuários.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  return ApiResponse.paginated(users, {
    total: meta.totalCount,
    page: meta.currentPage,
    limit: limit,
    pages: meta.pageCount,
  });
}
