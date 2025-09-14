import ApiResponse from '@/lib/api-response';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Post, PostCategory, User } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Rotas para gerenciar um post específico.
 * @param req - Requisição HTTP
 * @param params - Parâmetros da rota, incluindo o ID do post
 * @returns NextResponse com os dados do post ou erro
 */

// @route GET /api/posts/[id]
// Retorna os dados de um post específico.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;
  const join = req.nextUrl.searchParams.get('join')?.split(',') || [];

  type PostDetail = Post & {
    user?: User | null;
    categories?: PostCategory[] | null;
  };

  let post: PostDetail | null;
  let user: User | null = null;
  let categories: PostCategory[] | null = null;

  try {
    // Consulta o post no banco de dados
    //verifica se o id é um inteiro ou um slug
    if (isNaN(parseInt(id))) {
      post = await prisma.post.findUnique({
        where: { slug: id, deleted_at: null },
      });
    } else {
      post = await prisma.post.findUnique({
        where: { id: parseInt(id), deleted_at: null },
      });
    }

    if (join.includes('user') && post && post.user_id !== null) {
      user = await prisma.user.findUnique({
        where: { id: post.user_id, deleted_at: null },
      });
    }

    if (join.includes('categories') && post) {
      categories = await prisma.postCategory.findMany({
        where: { post_id: post.id, deleted_at: null, category: { deleted_at: null } },
        include: {
          category: true,
        },
      });
    }
  } catch (error) {
    return ApiResponse.internalServerError('Erro ao recuperar o post.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  // Se o post não for encontrado, retorna um erro 404
  if (!post) return ApiResponse.notFoundError('Post');

  return ApiResponse.success({
    ...post,
    ...(join.includes('user') ? { user } : {}),
    ...(join.includes('categories') ? { categories } : {}),
  });
}

// @route PUT /api/posts/[id]
// Atualiza os dados de um post específico.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;

  let res;
  try {
    res = await req.json();
  } catch (error) {
    return ApiResponse.badRequest('Corpo da requisição inválido.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  const { title, slug, image, type, lead, content, startDate, endDate, userId, highlight, active } =
    res;

  let uniqueSlug = slug ? slug : title.slugify();

  // Verifica se já existe um post com o mesmo slug e id diferente
  const existing = await prisma.post.findFirst({
    where: {
      slug: uniqueSlug,
      id: { not: parseInt(id) },
    },
  });

  if (existing) uniqueSlug = `${uniqueSlug}-${Date.now().toString(36)}`;

  // Verifica os campos obrigatórios
  if (!title)
    return ApiResponse.badRequest('Título é obrigatório.', {
      details: 'Por favor, verifique se o título está correto.',
    });

  if (!type)
    return ApiResponse.badRequest('Tipo é obrigatório.', {
      details: 'Por favor, verifique se o tipo está correto.',
    });

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

  // Verifica se o post existe e se o ID é um número válido
  const post = await prisma.post.findUnique({
    where: { id: parseInt(id), deleted_at: null },
  });
  if (!post) {
    return ApiResponse.notFoundError('Post não encontrado.');
  }

  try {
    // Atualiza o post no banco de dados
    await prisma.post.update({
      where: { id: parseInt(id), deleted_at: null },
      data: {
        title,
        slug: slug !== undefined ? (slug ? slug : uniqueSlug) : uniqueSlug,
        image: image !== undefined ? (image ? image : undefined) : undefined,
        type: type !== undefined ? (type ? type : undefined) : undefined,
        lead: lead !== undefined ? (lead ? lead : undefined) : undefined,
        content: content !== undefined ? (content ? content : undefined) : undefined,
        start_date: newStartDate,
        end_date: newEndDate,
        user_id: userId ? parseInt(userId) : undefined,
        highlight: highlight !== undefined ? (highlight ? highlight : undefined) : undefined,
        active: active !== undefined ? active : false,
      },
    });
  } catch (error) {
    return ApiResponse.internalServerError('Erro ao atualizar o post.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  return ApiResponse.success('Post atualizado com sucesso.');
}

// @route DELETE /api/posts/[id]
// Marca um post como deletado, definindo a data de exclusão.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  // Localiza o post pelo ID e verifica se ele não está marcado como deletado
  const post = await prisma.post.findUnique({
    where: { id: parseInt(id), deleted_at: null },
  });

  // Se o post não for encontrado ou já estiver deletado, retorna um erro 404
  if (!post) return ApiResponse.notFoundError('Post não encontrado ou já deletado.');

  let deletedPost;
  try {
    // Marca o post como deletado, definindo a data de exclusão
    deletedPost = await prisma.post.update({
      where: { id: parseInt(id), deleted_at: null },
      data: {
        deleted_at: new Date(),
      },
    });
  } catch (error) {
    return ApiResponse.internalServerError('Erro ao deletar o post.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  // Se o post não foi encontrado, retorna um erro 404
  if (!deletedPost) return ApiResponse.notFoundError('Post não encontrado.');

  return ApiResponse.success('Post deletado com sucesso.');
}
