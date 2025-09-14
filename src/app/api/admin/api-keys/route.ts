import ApiResponse from '@/lib/api-response';
import { generateApiKey, listApiKeys, validateIpPattern } from '@/lib/apiKeys';
import { verifyAuth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Rota para listar todas as API Keys.
 * Permite que administradores visualizem todas as chaves de API existentes.
 * @param req
 * @route GET /api/admin/api-keys
 * @returns NextResponse com a lista de API Keys ou erro.
 */
export async function GET(req: NextRequest) {
  const res = await verifyAuth(req);
  if (res instanceof NextResponse) return res;

  try {
    const apiKeys = await listApiKeys();

    return ApiResponse.success({
      ...apiKeys.map((key) => ({
        ...key,
        permissions: key.permissions ? JSON.parse(key.permissions) : [],
        ipWhitelist: key.ip_whitelist ? JSON.parse(key.ip_whitelist) : [],
      })),
    });
  } catch (error) {
    return ApiResponse.internalServerError('Erro ao listar API Keys', {
      details: error instanceof Error ? error.message : error,
    });
  }
}

/**
 * Rota para criar uma nova API Key.
 * Permite que administradores criem novas chaves de API.
 * @param req
 * @route POST /api/admin/api-keys
 * @returns NextResponse com a API Key criada ou erro.
 */
export async function POST(req: NextRequest) {
  // Verifica a autenticação do usuário
  const res = await verifyAuth(req);
  if (res instanceof NextResponse) return res;

  try {
    const body = await req.json();
    const { name, permissions, ip_whitelist, expires_att } = body;

    if (!name || name.trim() === '') {
      return ApiResponse.validationError('Nome da API Key é obrigatório', {
        details: 'O nome da API Key não pode estar vazio.',
      });
    }

    // Valida padrões de IP se fornecidos
    if (ip_whitelist && Array.isArray(ip_whitelist)) {
      for (const pattern of ip_whitelist) {
        const validation = validateIpPattern(pattern);
        if (!validation.valid) {
          return ApiResponse.validationError(`Padrão de IP inválido: "${pattern}"`, {
            details: validation.error,
          });
        }
      }
    }

    const apiKeyData = await generateApiKey({
      name: name.trim(),
      permissions: permissions || [],
      ip_whitelist: ip_whitelist || [],
      expires_at: expires_att ? new Date(expires_att) : undefined,
    });

    return ApiResponse.success({
      ...apiKeyData,
      message: 'API Key criada com sucesso',
      warning: 'Guarde esta chave em local seguro. Ela não será exibida novamente!',
      examples: {
        'Qualquer IP': ['*'],
        'Rede local': ['192.168.0.0/16'],
        'IPs específicos': ['203.0.113.45', '198.51.100.67'],
        Wildcard: ['192.168.1.*', '10.0.?.100'],
        'CIDR público': ['0.0.0.0/0'],
      },
    });
  } catch (error) {
    return ApiResponse.internalServerError('Erro ao criar API Key', {
      details: error instanceof Error ? error.message : error,
    });
  }
}
