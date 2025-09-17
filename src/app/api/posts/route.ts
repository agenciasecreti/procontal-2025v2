import ApiResponse from '@/lib/api-response';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { pagination } from 'prisma-extension-pagination';

// Importa o Prisma Client e a extensão de paginação
const prismaExt = prisma.$extends(pagination());

/**
 * Rota para gerenciar posts.
 * Permite listar todos os posts e criar um novo post.
 * @param req
 * @returns NextResponse com a lista de posts ou o post criado.
 */

// @route GET /api/posts
// Retorna a lista de posts ativos (não deletados).
export async function GET(req: NextRequest) {
  // Rotina protegida pelo middleware CORS - permite acesso apenas do próprio app

  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10');
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
  const search = req.nextUrl.searchParams.get('search') || '';
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
      title: true,
      slug: true,
      image: true,
      type: true,
      lead: true,
      content: true,
      start_date: true,
      end_date: true,
      user_id: true,
      highlight: true,
      active: true,
    };
  }

  let posts;
  let meta;
  try {
    // Consulta todos os posts ativos (não deletados) e inclui suas funções
    [posts, meta] = await prismaExt.post
      .paginate({
        where: {
          deleted_at: null,
          ...(typeof active === 'boolean' ? { active: active } : {}),
          ...(search && {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { slug: { contains: search, mode: 'insensitive' } },
              { lead: { contains: search, mode: 'insensitive' } },
              { content: { contains: search, mode: 'insensitive' } },
            ],
          }),
        },
        orderBy: { created_at: 'desc' },
        select: columns,
      })
      .withPages({
        limit: limit,
        includePageCount: true,
        page: page,
      });
  } catch (error) {
    return ApiResponse.internalServerError('Não foi possível recuperar os posts.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  return ApiResponse.paginated(posts, {
    total: meta.totalCount,
    page: meta.currentPage,
    limit: limit,
    pages: meta.pageCount,
  });
}

// @route POST /api/posts
// Cria um novo post com os dados fornecidos no corpo da requisição.
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

  const { title, slug, image, type, lead, content, startDate, endDate, userId, highlight, active } =
    res;

  let uniqueSlug = slug ? slug : title.slugify();

  // Verifica se já existe um post com o mesmo slug
  const existing = await prisma.post.findUnique({
    where: { slug: uniqueSlug },
  });

  if (existing) uniqueSlug = `${uniqueSlug}-${Date.now().toString(36)}`;

  // Verifica os campos obrigatórios
  if (!title) return ApiResponse.validationError('Título é obrigatório.');

  if (!type) return ApiResponse.validationError('Tipo é obrigatório.');

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

  // Cria o novo post no banco de dados, gerando um erro se não for possível
  let newPost;
  try {
    newPost = await prisma.post.create({
      data: {
        title,
        slug: slug !== undefined ? (slug ? slug : uniqueSlug) : uniqueSlug,
        image: image !== undefined ? (image ? image : undefined) : undefined,
        type: type || 'screen',
        lead: lead !== undefined ? (lead ? lead : undefined) : undefined,
        content: content !== undefined ? (content ? content : undefined) : undefined,
        start_date: newStartDate,
        end_date: newEndDate,
        user_id: userId ? parseInt(userId) : 2,
        highlight: highlight !== undefined ? highlight : false,
        active: active !== undefined ? active : false,
      },
    });
  } catch (error) {
    return ApiResponse.badRequest('Não foi possível criar o post.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  return ApiResponse.success(
    { message: 'Post criado com sucesso.', id: newPost.id },
    'Post criado com sucesso.'
  );
}
