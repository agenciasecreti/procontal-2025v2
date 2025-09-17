import ApiResponse from '@/lib/api-response';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// @route UPDATE /api/posts/[id]/active
// Atualiza o status de um post (ativo/inativo)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;

  const body = await req.json();
  const { active } = body;

  //Verifica se o post existe e se o ID é um número válido
  const post = await prisma.post.findUnique({
    where: { id: parseInt(id), deleted_at: null }, // Verifica se o post nao está excluído
  });
  if (!post) {
    return ApiResponse.notFoundError('Post não encontrado.');
  }

  let updatedPost;
  try {
    // Atualiza o post no banco de dados
    updatedPost = await prisma.post.update({
      where: { id: parseInt(id), deleted_at: null }, // Verifica se o post não está excluído
      data: {
        active: active ?? false,
      },
    });
  } catch (error) {
    return ApiResponse.internalServerError('Erro ao restaurar o post.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  // Se o post não foi atualizado, retorna um erro 404
  if (!updatedPost) return ApiResponse.notFoundError('Post não atualizado.');

  return ApiResponse.success({
    message: `Post ${active ? 'ativado' : 'desativado'} com sucesso.`,
  });
}
