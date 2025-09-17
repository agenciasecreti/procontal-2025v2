import ApiResponse from '@/lib/api-response';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// @route UPDATE /api/banners/[id]/active
// Atualiza o status de um banner (ativo/inativo)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;

  const body = await req.json();
  const { active } = body;

  //Verifica se o banner existe e se o ID é um número válido
  const banner = await prisma.banner.findUnique({
    where: { id: parseInt(id), deleted_at: null }, // Verifica se o banner nao está excluído
  });
  if (!banner) {
    return ApiResponse.notFoundError('Banner não encontrado.');
  }

  let updatedBanner;
  try {
    // Atualiza o banner no banco de dados
    updatedBanner = await prisma.banner.update({
      where: { id: parseInt(id), deleted_at: null }, // Verifica se o banner não está excluído
      data: {
        active: active ?? false,
      },
    });
  } catch (error) {
    return ApiResponse.internalServerError('Erro ao restaurar o banner.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  // Se o banner não foi atualizado, retorna um erro 404
  if (!updatedBanner) return ApiResponse.notFoundError('Banner não atualizado.');

  return ApiResponse.success({
    message: `Banner ${active ? 'ativado' : 'desativado'} com sucesso.`,
  });
}
