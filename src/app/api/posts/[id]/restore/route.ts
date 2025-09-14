import ApiResponse from '@/lib/api-response';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// @route PUT /api/posts/[id]/restore
// Restaura um post excluído, atualizando seus dados e removendo a data de exclusão.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  //Verifica se o post existe e se o ID é um número válido
  const post = await prisma.post.findUnique({
    where: { id: parseInt(id), deleted_at: { not: null } }, // Verifica se o post está excluído
  });
  if (!post) {
    return ApiResponse.notFoundError('Post');
  }

  let updatedPost;
  try {
    // Atualiza o post no banco de dados
    updatedPost = await prisma.post.update({
      where: { id: parseInt(id), deleted_at: { not: null } }, // Verifica se o post está excluído
      data: {
        deleted_at: null,
      },
    });
  } catch (error) {
    return ApiResponse.internalServerError('Erro ao restaurar o post.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  // Se o post não foi atualizado, retorna um erro 404
  if (!updatedPost) return ApiResponse.notFoundError('Post');

  return ApiResponse.success({
    message: 'Post restaurado com sucesso.',
  });
}
