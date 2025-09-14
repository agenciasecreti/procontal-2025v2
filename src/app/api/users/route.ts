import ApiResponse from '@/lib/api-response';
import { verifyAuth } from '@/lib/auth';

import { prisma } from '@/lib/prisma';
import { validatePassword, validateUserData } from '@/lib/validations/user';
import { NextRequest, NextResponse } from 'next/server';
import { pagination } from 'prisma-extension-pagination';

// Importa o Prisma Client e a extensão de paginação
const prismaExt = prisma.$extends(pagination());

/**
 * Rota para gerenciar usuários.
 * Permite listar todos os usuários e criar um novo usuário.
 * @param req
 * @route GET /api/users
 * @returns NextResponse com a lista de usuários ou o usuário criado.
 */
export async function GET(req: NextRequest) {
  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10');
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1');

  let users;
  let meta;
  try {
    // Consulta todos os usuários ativos (não deletados) e inclui suas funções
    [users, meta] = await prismaExt.user
      .paginate({
        where: { deleted_at: null },
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: {
            select: {
              name: true,
            },
          },
        },
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

/**
 * Rota para criar um novo usuário.
 * @param req
 * @route POST /api/users
 * @returns NextResponse com os dados do usuário criado ou erro
 */
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

  const requestData = res;

  // Validação dos dados básicos
  const dataValidation = await validateUserData(requestData);
  if (!dataValidation.isValid) {
    return ApiResponse.validationError('Erro ao validar os dados do usuário.', {
      details: dataValidation.error,
    });
  }

  // Verifica se a senha foi fornecida e a valida
  if (requestData.password) {
    const passwordValidation = validatePassword(requestData.password, requestData.confirmPassword);
    if (!passwordValidation.isValid) {
      return ApiResponse.validationError('Erro ao validar a senha do usuário.', {
        details: passwordValidation.error,
      });
    }
    requestData.password = passwordValidation.hashedPassword;
  }

  // Remove campos que não devem ser enviados para criação do usuário
  // Cria uma cópia dos dados do usuário e ajusta os campos necessários
  const userData = {
    ...requestData,
    role_id: requestData.role_id ? Number(requestData.role_id) : 4,
    birth_date: requestData.birth_date === '' ? null : dataValidation.data?.birth_date,
    phone: requestData.phone === '' ? null : dataValidation.data?.phone,
    whatsapp: requestData.whatsapp === '' ? null : dataValidation.data?.whatsapp,
  };

  // Remove campos que não existem no modelo User
  const allowedFields = [
    'name',
    'email',
    'password',
    'role_id',
    'birth_date',
    'phone',
    'whatsapp',
    'created_at',
    'updated_at',
    'deleted_at',
    'id',
  ];
  Object.keys(userData).forEach((key) => {
    if (!allowedFields.includes(key)) {
      delete userData[key as keyof typeof userData];
    }
  });

  let newUser;
  try {
    // Cria o novo usuário no banco de dados, gerando um erro se não for possível
    newUser = await prismaExt.user.create({ data: userData });
  } catch (error) {
    return ApiResponse.badRequest('Não foi possível criar o usuário.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  return ApiResponse.success(
    { message: 'Usuário criado com sucesso.', id: newUser.id },
    'Usuário criado com sucesso.'
  );
}
