import ApiResponse from '@/lib/api-response';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Rota para listar todas as configurações.
 * @param req
 * @route GET /api/admin/config
 * @returns NextResponse com a lista de configurações ou erro.
 */
export async function GET() {
  // Rota protegida pelo middleware CORS - permite acesso apenas do próprio app

  try {
    // Consulta todos as configurações ativas (não deletadas)
    const configs = await prisma.config.findMany({
      where: { deleted_at: null },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        name: true,
        key: true,
        value: true,
      },
    });

    return ApiResponse.list(configs);
  } catch (error) {
    console.error('Erro ao listar Configurações:', error);
    return ApiResponse.badRequest('Erro ao listar Configurações', {
      details: error instanceof Error ? error.message : error,
    });
  }
}

/**
 * Rota para criar uma nova configuração.
 * @param req
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}

/**
 * Rota para criar uma nova configuração.
 * @param req
 * @route POST /api/admin/config
 * @returns NextResponse com mensagem de sucesso ou erro.
 */
export async function POST(req: NextRequest) {
  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await req.json();
    const { name, key, value } = body;

    if (!name || name.trim() === '') {
      return ApiResponse.validationError('Nome da configuração é obrigatório', {
        details: 'O nome da configuração não pode estar vazio.',
      });
    }

    if (!key || key.trim() === '') {
      return ApiResponse.validationError('Chave da configuração é obrigatória', {
        details: 'A chave da configuração não pode estar vazia.',
      });
    }

    if (!value || value.trim() === '') {
      return ApiResponse.validationError('Valor da configuração é obrigatório', {
        details: 'O valor da configuração não pode estar vazio.',
      });
    }

    // Verifica se a chave já existe
    const existingConfig = await prisma.config.findUnique({
      where: { key: key.trim() },
    });

    if (existingConfig) {
      return ApiResponse.validationError('Chave da configuração já existe', {
        details: 'Uma configuração com esta chave já foi criada.',
      });
    }

    await prisma.config.create({
      data: {
        name: name ? name.trim() : null,
        key: key.trim(),
        value: value.trim(),
      },
    });

    return ApiResponse.success({
      message: 'Configuração criada com sucesso',
    });
  } catch (error) {
    return ApiResponse.internalServerError('Erro ao criar Configuração', {
      details: error instanceof Error ? error.message : error,
    });
  }
}
