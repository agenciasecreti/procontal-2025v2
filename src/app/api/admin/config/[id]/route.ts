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
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;

  let config;
  try {
    // Consulta a configuração no banco de dados
    config = await prisma.config.findUnique({
      where: { id: parseInt(id), deleted_at: null },
    });
  } catch (error) {
    return ApiResponse.internalServerError('Erro ao recuperar a configuração.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  // Se a configuração não for encontrada, retorna um erro 404
  if (!config) return ApiResponse.notFoundError('Configuração');

  return ApiResponse.success({
    id: config.id,
    key: config.key,
    value: config.value,
  });
}

/**
 * Rota para atualizar uma configuração específica.
 * @param req
 * @param params
 * @route PUT /api/admin/config/[id]
 * @returns NextResponse com mensagem de sucesso ou erro.
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;

  // Extrai os dados do corpo da requisição
  const { key, value } = await req.json();
  const data = {
    key,
    value,
  };

  console.log('Atualizando config com ID:', id, 'com dados:', data);

  let config;
  // Caso id não seja um número
  if (isNaN(parseInt(id))) {
    config = await prisma.config.findFirst({
      where: { key: id, deleted_at: null },
    });
  } else {
    config = await prisma.config.findFirst({
      where: { id: parseInt(id), deleted_at: null },
    });
  }
  if (!config) {
    return ApiResponse.notFoundError('Configuração');
  }

  try {
    // Atualiza a configuração no banco de dados
    await prisma.config.update({
      where: {
        id: config.id,
      },
      data,
    });
  } catch (error) {
    return ApiResponse.internalServerError('Erro ao atualizar a configuração.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  return ApiResponse.success({
    message: `"${config.name}" atualizado com sucesso.`,
  });
}

/**
 * Rota para deletar uma configuração específica.
 * @param req
 * @param params
 * @route DELETE /api/admin/config/[id]
 * @returns NextResponse com mensagem de sucesso ou erro.
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;

  // Localiza a configuração pelo ID e verifica se ele não está marcado como deletado
  const config = await prisma.config.findUnique({
    where: { id: parseInt(id), deleted_at: null },
  });

  // Se a configuração não for encontrada ou já estiver deletada, retorna um erro 404
  if (!config) return ApiResponse.notFoundError('Configuração não encontrada ou já deletada.');

  let deletedConfig;
  try {
    // Marca a configuração como deletado, definindo a data de exclusão
    deletedConfig = await prisma.config.update({
      where: { id: parseInt(id), deleted_at: null },
      data: {
        deleted_at: new Date(),
      },
    });
  } catch (error) {
    return ApiResponse.internalServerError('Erro ao deletar a configuração.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  // Se a configuração não foi encontrada, retorna um erro 404
  if (!deletedConfig) return ApiResponse.notFoundError('Configuração');

  return ApiResponse.success({
    message: 'Configuração deletada com sucesso.',
  });
}
