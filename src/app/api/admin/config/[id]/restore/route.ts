import ApiResponse from '@/lib/api-response';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Rotas para gerenciar uma configuração específica.
 * @param req - Requisição HTTP
 * @param params - Parâmetros da rota, incluindo o ID da configuração
 * @route GET /api/admin/config/[id]
 * @returns NextResponse com os dados da configuração ou erro
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;

  //Verifica se a configuração existe e se o ID é um número válido
  const config = await prisma.config.findUnique({
    where: { id: parseInt(id), deleted_at: { not: null } }, // Verifica se a configuração está excluída
  });
  if (!config) {
    return ApiResponse.notFoundError('Configuração');
  }

  let updatedConfig;
  try {
    // Atualiza a configuração no banco de dados
    updatedConfig = await prisma.config.update({
      where: { id: parseInt(id), deleted_at: { not: null } }, // Verifica se a configuração está excluída
      data: {
        deleted_at: null,
      },
    });
  } catch (error) {
    return ApiResponse.internalServerError('Erro ao restaurar a configuração.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  // Se a configuração não foi atualizada, retorna um erro 404
  if (!updatedConfig) return ApiResponse.notFoundError('Configuração');

  return ApiResponse.success({
    message: 'Configuração restaurada com sucesso.',
  });
}
