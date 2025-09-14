import ApiResponse from '@/lib/api-response';
import { revokeApiKey } from '@/lib/apiKeys';
import { verifyAuth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Rota para revogar uma API Key.
 * @param req
 * @param context
 * @route DELETE /api/admin/api-keys/[id]
 * @returns NextResponse com mensagem de sucesso ou erro.
 */
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id: idParam } = await context.params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return ApiResponse.validationError('ID inválido', {
        details: 'O ID deve ser um número inteiro.',
      });
    }

    await revokeApiKey(id);

    return ApiResponse.success({
      message: 'API Key revogada com sucesso',
    });
  } catch (error) {
    return ApiResponse.internalServerError('Erro ao revogar API Key', {
      details: error instanceof Error ? error.message : error,
    });
  }
}
