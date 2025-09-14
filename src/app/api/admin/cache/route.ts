import ApiResponse from '@/lib/api-response';
import { verifyAuth } from '@/lib/auth';
import { clearCache, getCacheStats, invalidateCache } from '@/lib/middlewares';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Rota para obter estatísticas do cache.
 * @param req
 * @route GET /api/admin/cache/stats
 * @returns NextResponse com estatísticas do cache ou erro.
 */
export async function GET(req: NextRequest) {
  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const stats = getCacheStats();

  return ApiResponse.success({
    message: 'Estatísticas do cache',
    stats: {
      totalEntries: stats.size,
      entries: stats.entries.map((entry) => ({
        ...entry,
        sizeKB: Math.round((entry.size / 1024) * 100) / 100,
        expiresIn: Math.max(0, Math.floor((entry.expires.getTime() - Date.now()) / 1000)),
      })),
    },
  });
}

/**
 * Rota para limpar o cache.
 * @param req
 * @route DELETE /api/admin/cache
 * @returns NextResponse com mensagem de sucesso ou erro.
 */
export async function DELETE(req: NextRequest) {
  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(req.url);
  const pattern = searchParams.get('pattern');

  if (pattern) {
    // Invalidar por padrão
    invalidateCache(pattern);
    return ApiResponse.success({
      message: `Cache invalidado para o padrão: ${pattern}`,
    });
  } else {
    // Limpar todo o cache
    clearCache();
    return ApiResponse.success({
      message: 'Todo o cache foi limpo',
    });
  }
}
