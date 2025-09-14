import ApiResponse from '@/lib/api-response';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Banner } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Retorna os dados de um banner específico.
 * @param req - Requisição HTTP
 * @param params - Parâmetros da rota, incluindo o ID do banner
 * @route GET /api/banners/[id]
 * @returns NextResponse com os dados do banner ou erro
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  // Se for autenticação via API Key
  if (authResult.type === 'api-key') {
    const permissions = authResult.apiKey.apiKeyData?.permissions || [];

    // Verificar se tem a permissão necessária
    if (!permissions.includes('read:banner')) {
      return ApiResponse.authenticationError('Permissão insuficiente para acessar banners.');
    }
  }

  // Se for autenticação via API Key
  if (authResult.type === 'api-key') {
    const permissions = authResult.apiKey.apiKeyData?.permissions || [];

    // Verificar se tem a permissão necessária
    if (!permissions.includes('read:banner')) {
      return ApiResponse.authenticationError('Permissão insuficiente para acessar os banners.');
    }
  }

  const { id } = await params;

  type BannerDetail = Banner;

  let banner: BannerDetail | null;

  try {
    // Consulta o banner no banco de dados
    banner = await prisma.banner.findUnique({
      where: {
        id: parseInt(id),
        deleted_at: null,
      },
    });
  } catch (error) {
    return ApiResponse.internalServerError('Erro ao recuperar o banner.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  // Se o banner não for encontrado, retorna um erro 404
  if (!banner) return ApiResponse.notFoundError('Banner');

  return ApiResponse.success({
    ...banner,
  });
}

// @route PUT /api/banners/[id]
// Atualiza os dados de um banner específico.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  // Se for autenticação via API Key
  if (authResult.type === 'api-key') {
    const permissions = authResult.apiKey.apiKeyData?.permissions || [];

    // Verificar se tem a permissão necessária
    if (!permissions.includes('update:banner')) {
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

  const data = {
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
  };

  // Verifica se o banner existe e se o ID é um número válido
  const banner = await prisma.banner.findUnique({
    where: { id: parseInt(id), deleted_at: null },
  });
  if (!banner) {
    return ApiResponse.notFoundError('Banner');
  }

  try {
    // Atualiza o banner no banco de dados
    await prisma.banner.update({
      where: { id: parseInt(id), deleted_at: null },
      data,
    });
  } catch (error) {
    return ApiResponse.internalServerError('Erro ao atualizar o banner.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  return ApiResponse.success({
    message: 'Banner atualizado com sucesso.',
  });
}

// @route DELETE /api/banners/[id]
// Marca um banner como deletado, definindo a data de exclusão.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  // Localiza o banner pelo ID e verifica se ele não está marcado como deletado
  const banner = await prisma.banner.findUnique({
    where: { id: parseInt(id), deleted_at: null },
  });

  // Se o banner não for encontrado ou já estiver deletado, retorna um erro 404
  if (!banner) return ApiResponse.notFoundError('Banner');

  let deletedBanner;
  try {
    // Marca o banner como deletado, definindo a data de exclusão
    deletedBanner = await prisma.banner.update({
      where: { id: parseInt(id), deleted_at: null },
      data: {
        deleted_at: new Date(),
      },
    });
  } catch (error) {
    return ApiResponse.internalServerError('Erro ao deletar o banner.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  // Se o banner não foi encontrado, retorna um erro 404
  if (!deletedBanner) return ApiResponse.notFoundError('Banner');

  return ApiResponse.success({
    message: 'Banner deletado com sucesso.',
  });
}
