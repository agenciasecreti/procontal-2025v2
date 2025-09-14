import ApiResponse from '@/lib/api-response';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { validatePassword, validateUserData } from '@/lib/validations/user';
import { CourseUser, Post, Role, User } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Rotas para gerenciar um usuário específico.
 * @param req - Requisição HTTP
 * @param params - Parâmetros da rota, incluindo o ID do usuário
 * @route GET /api/users/[id]
 * @returns NextResponse com os dados do usuário ou erro
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;
  const join = req.nextUrl.searchParams.get('join')?.split(',') || [];

  type UserDetail = User & {
    role?: Role | null;
    posts?: { post: Post }[] | null;
    courses?: { course: CourseUser }[] | null;
  };

  let user: UserDetail | null;
  let role: Role | null = null;
  let posts: Post[] | null = null;
  let courses: CourseUser[] | null = null;

  try {
    // Consulta o usuário no banco de dados
    user = await prisma.user.findUnique({
      where: {
        id: parseInt(id), //pelo ID do usuário
        deleted_at: null, //verifica se o usuário não foi deletado
      },
    });

    if (join.includes('role') && user) {
      role = await prisma.role.findUnique({
        where: { id: user.role_id, deleted_at: null },
      });
    }

    if (join.includes('posts') && user) {
      posts = await prisma.post.findMany({
        where: { user_id: user.id, deleted_at: null },
      });
    }

    if (join.includes('courses') && user) {
      courses = await prisma.courseUser.findMany({
        where: { user_id: user.id, deleted_at: null, course: { deleted_at: null } },
        include: {
          course: true,
        },
      });
    }
  } catch (error) {
    return ApiResponse.internalServerError('Erro ao recuperar o usuário.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  // Se o usuário não for encontrado, retorna um erro 404
  if (!user) return ApiResponse.notFoundError('Usuário');

  return ApiResponse.success({
    ...user,
    ...(join.includes('role') ? { role } : {}),
    ...(join.includes('posts') ? { posts } : {}),
    ...(join.includes('courses') ? { courses } : {}),
  });
}

/**
 * Rota para atualizar um usuário.
 * @param req
 * @param params
 * @route PUT /api/users/[id]
 * @returns
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  let res;
  try {
    res = await req.json();
  } catch {
    return ApiResponse.validationError('Erro ao ler os dados da requisição.');
  }

  const requestData = res;

  // Validação dos dados básicos
  const dataValidation = await validateUserData(requestData, parseInt(id));
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

  // Verifica se o usuario existe
  const user = await prisma.user.findUnique({
    where: { id: parseInt(id), deleted_at: null },
  });

  if (!user) return ApiResponse.notFoundError('Usuário');

  // Remove campos que não devem ser enviados para criação do usuário
  // Cria uma cópia dos dados do usuário e ajusta os campos necessários
  const userData = {
    ...requestData,
    role_id: requestData.role_id ? Number(requestData.role_id) : 4,
    birth_date: requestData.birth_date === '' ? null : dataValidation.data?.birth_date,
    phone: requestData.phone === '' ? null : dataValidation.data?.phone,
    whatsapp: requestData.whatsapp === '' ? null : dataValidation.data?.whatsapp,
  };

  const userFields = Object.keys(prisma.user.fields) as (keyof User)[];
  Object.keys(userData).forEach((key) => {
    if (!userFields.includes(key as keyof User)) {
      delete userData[key as keyof typeof userData];
    }
  });

  try {
    // Atualiza o usuário no banco de dados
    await prisma.user.update({
      where: { id: parseInt(id), deleted_at: null },
      data: userData,
    });

    return ApiResponse.success({ message: 'Usuário atualizado com sucesso.' });
  } catch (error) {
    return ApiResponse.internalServerError('Erro ao atualizar o usuário.', {
      details: error instanceof Error ? error.message : error,
    });
  }
}

/**
 * Rota para deletar um usuário.
 * @param req
 * @param params
 * @route DELETE /api/users/[id]
 * @returns
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;

  // Localiza o usuário pelo ID e verifica se ele não está marcado como deletado
  const user = await prisma.user.findUnique({
    where: { id: parseInt(id), deleted_at: null },
  });

  // Se o usuário não for encontrado ou já estiver deletado, retorna um erro 404
  if (!user) return ApiResponse.notFoundError('Usuário');

  let deletedUser;
  try {
    // Marca o usuário como deletado, definindo a data de exclusão
    deletedUser = await prisma.user.update({
      where: { id: parseInt(id), deleted_at: null },
      data: {
        deleted_at: new Date(),
      },
    });
  } catch (error) {
    return ApiResponse.internalServerError('Erro ao deletar o usuário.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  // Se o usuário não foi encontrado, retorna um erro 404
  if (!deletedUser) return ApiResponse.notFoundError('Usuário');

  return ApiResponse.success({
    message: 'Usuário deletado com sucesso.',
  });
}
