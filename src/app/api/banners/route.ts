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

// @route GET /api/banners
// Retorna a lista de banners ativos (não deletados).
export async function GET(req: NextRequest) {
  // Rota protegida pelo middleware CORS - permite acesso apenas do próprio app

  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10');
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
  const search = req.nextUrl.searchParams.get('search') || '';
  const select = req.nextUrl.searchParams.get('select') || '';
  console.log('select:', select);
  const position = req.nextUrl.searchParams.get('position') || '';
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
      position: true,
      active: true,
    };
  }

  let banners;
  let meta;
  try {
    // Consulta todos os banners ativos (não deletados) com paginação e filtragem por posição e pesquisa
    // Utiliza a extensão de paginação para obter os banners e as informações de meta
    // A consulta inclui filtragem por título, texto e botão de texto, além de ordenação por data de criação
    [banners, meta] = await prismaExt.banner
      .paginate({
        where: {
          deleted_at: null,
          ...(typeof active === 'boolean' ? { active: active } : {}),
          ...(search && {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { text: { contains: search, mode: 'insensitive' } },
              { btn_text: { contains: search, mode: 'insensitive' } },
            ],
          }),
          ...(position && position !== '' ? { position: position } : {}),
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
    return ApiResponse.internalServerError('Não foi possível recuperar os banners.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  return ApiResponse.paginated(banners, {
    total: meta.totalCount,
    limit: limit,
    pages: meta.pageCount,
    page: meta.currentPage,
  });
}

/**
 * Rota para criar um novo banner.
 * @param req
 * @route POST /api/banners
 * @returns NextResponse com a confirmação ou erro.
 */
export async function POST(req: NextRequest) {
  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  // Se for autenticação via API Key
  if (authResult.type === 'api-key') {
    const permissions = authResult.apiKey.apiKeyData?.permissions || [];

    // Verificar se tem a permissão necessária
    if (!permissions.includes('create:banner')) {
      return ApiResponse.authenticationError('Permissão insuficiente para alterar banners.');
    }
  }

  // Extrai os dados do corpo da requisição
  const { title, position, text, btnText, image, imageMobile, link, startDate, endDate, active } =
    await req.json();

  let newStartDate;
  if (startDate && isNaN(new Date(startDate).getTime())) {
    return ApiResponse.badRequest('Data de início inválida.', {
      details: 'Por favor, verifique se a data de início está correta.',
    });
  } else {
    if (startDate) newStartDate = new Date(startDate);
  }

  let newEndDate;
  if (endDate === '') {
    newEndDate = null; // Limpa o campo no banco de dados
  } else if (endDate && isNaN(new Date(endDate).getTime())) {
    return ApiResponse.badRequest('Data de término inválida.', {
      details: 'Por favor, verifique se a data de término está correta.',
    });
  } else {
    if (endDate) newEndDate = new Date(endDate);
  }

  // Cria o novo banner no banco de dados, gerando um erro se não for possível
  let newBanner;
  try {
    newBanner = await prisma.banner.create({
      data: {
        title,
        position,
        text,
        btn_text: btnText,
        image,
        image_mobile: imageMobile,
        link,
        start_date: newStartDate,
        end_date: newEndDate,
        active: active !== undefined ? active : false,
      },
    });
  } catch (error) {
    return ApiResponse.badRequest('Não foi possível criar o banner.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  return ApiResponse.success(
    { message: 'Banner criado com sucesso.', id: newBanner.id },
    'Banner criado com sucesso.'
  );
}
