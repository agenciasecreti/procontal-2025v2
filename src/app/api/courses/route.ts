import ApiResponse from '@/lib/api-response';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { pagination } from 'prisma-extension-pagination';

// Importa o Prisma Client e a extensão de paginação
const prismaExt = prisma.$extends(pagination());

/**
 * Rota para gerenciar cursos.
 * Permite listar todos os cursos e criar um novo curso.
 * @param req
 * @returns NextResponse com a lista de cursos ou o curso criado.
 */

// @route GET /api/courses
// Retorna a lista de cursos ativos (não deletados).
export async function GET(req: NextRequest) {
  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  // Se for autenticação via API Key
  if (authResult.type === 'api-key') {
    const permissions = authResult.apiKey.apiKeyData?.permissions || [];

    // Verificar se tem a permissão necessária
    if (!permissions.includes('read:course')) {
      return ApiResponse.authenticationError('Permissão insuficiente para acessar cursos.');
    }
  }

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
      workload: true,
      active: true,
    };
  }

  let courses;
  let meta;
  try {
    // Consulta todos os cursos ativos (não deletados) com paginação e filtragem por posição e pesquisa
    // Utiliza a extensão de paginação para obter os cursos e as informações de meta
    // A consulta inclui filtragem por título, texto e botão de texto, além de ordenação por data de criação
    [courses, meta] = await prismaExt.course
      .paginate({
        where: {
          deleted_at: null,
          ...(typeof active === 'boolean' ? { active: active } : {}),
          ...(search && {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { slug: { contains: search, mode: 'insensitive' } },
              { content: { contains: search, mode: 'insensitive' } },
              ...(columns.modules
                ? [
                    {
                      modules: {
                        some: {
                          OR: [
                            { title: { contains: search } },
                            { slug: { contains: search } },
                            { content: { contains: search } },
                          ],
                        },
                      },
                    },
                  ]
                : []),
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
    return ApiResponse.internalServerError('Não foi possível recuperar os cursos.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  return ApiResponse.paginated(courses, {
    total: meta.totalCount,
    page: meta.currentPage,
    limit: limit,
    pages: meta.pageCount,
  });
}

// @route POST /api/courses
// Cria um novo curso com os dados fornecidos no corpo da requisição.
export async function POST(req: NextRequest) {
  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  // Se for autenticação via API Key
  if (authResult.type === 'api-key') {
    const permissions = authResult.apiKey.apiKeyData?.permissions || [];

    // Verificar se tem a permissão necessária
    if (!permissions.includes('create:course')) {
      return ApiResponse.authenticationError('Permissão insuficiente para criar cursos.');
    }
  }

  let res;
  try {
    res = await req.json();
  } catch (error) {
    return ApiResponse.validationError('Erro ao ler os dados da requisição.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  const { title, slug, workload, content, image, startDate, endDate, active } = res;

  let uniqueSlug = slug ? slug : title.slugify();

  // Verifica se já existe um curso com o mesmo slug
  const existing = await prisma.course.findUnique({
    where: { slug: uniqueSlug },
  });

  if (existing) uniqueSlug = `${uniqueSlug}-${Date.now().toString(36)}`;

  // Verifica os campos obrigatórios
  if (!title) {
    return ApiResponse.validationError('Título é obrigatório.');
  }

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

  // Cria o novo curso no banco de dados, gerando um erro se não for possível
  let newCourse;
  try {
    newCourse = await prisma.course.create({
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
    return ApiResponse.badRequest('Não foi possível criar o curso.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  return ApiResponse.success(
    { message: 'Curso criado com sucesso.', id: newCourse.id },
    'Curso criado com sucesso.'
  );
}
