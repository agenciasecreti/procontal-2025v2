import ApiResponse from '@/lib/api-response';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// @route PUT /api/posts/[id]/restore
// Restaura um banner excluído, atualizando seus dados e removendo a data de exclusão.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  // Se for autenticação via API Key
  if (authResult.type === 'api-key') {
    const permissions = authResult.apiKey.apiKeyData?.permissions || [];

    // Verificar se tem a permissão necessária
    if (!permissions.includes('delete:banner')) {
      return ApiResponse.authenticationError('Permissão insuficiente para remover banners.');
    }
  }

  //Verifica se o banner existe e se o ID é um número válido
  const banner = await prisma.banner.findUnique({
    where: { id: parseInt(id), deleted_at: { not: null } }, // Verifica se o banner está excluído
  });
  if (!banner) {
    return ApiResponse.notFoundError('Banner');
  }

  let updatedBanner;
  try {
    // Atualiza o banner no banco de dados
    updatedBanner = await prisma.banner.update({
      where: { id: parseInt(id), deleted_at: { not: null } }, // Verifica se o banner está excluído
      data: {
        deleted_at: null,
      },
    });
  } catch (error) {
    return ApiResponse.internalServerError('Erro ao restaurar o banner.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  // Se o banner não foi atualizado, retorna um erro 404
  if (!updatedBanner) return ApiResponse.notFoundError('Banner');

  return ApiResponse.success({
    message: 'Banner restaurado com sucesso.',
  });
}
