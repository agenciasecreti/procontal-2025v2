import { NextResponse } from 'next/server';

// Tipos para as respostas padronizadas
export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface StandardSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  pagination?: PaginationInfo;
  timestamp: string;
}

export interface StandardErrorResponse {
  success: false;
  error: {
    type: string;
    message: string;
    code?: string;
    details?: Record<string, unknown>;
    timestamp: string;
    requestId?: string;
  };
}

export type StandardResponse<T = unknown> = StandardSuccessResponse<T> | StandardErrorResponse;

// Classe para criar respostas padronizadas
export class ApiResponse {
  /**
   * Cria uma resposta de sucesso padronizada
   */
  static success<T>(
    data: T,
    message?: string,
    status: number = 200,
    pagination?: PaginationInfo,
    headers?: Record<string, string>
  ): NextResponse {
    const response: StandardSuccessResponse<T> = {
      success: true,
      data,
      message,
      pagination,
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(response, {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });
  }

  /**
   * Cria uma resposta de erro padronizada
   */
  static error(
    type: string,
    message: string,
    code?: string,
    status: number = 500,
    details?: Record<string, unknown>,
    headers?: Record<string, string>,
    requestId?: string
  ): NextResponse {
    const response: StandardErrorResponse = {
      success: false,
      error: {
        type,
        message,
        code,
        details,
        timestamp: new Date().toISOString(),
        requestId,
      },
    };

    return NextResponse.json(response, {
      status,
      headers: {
        'Content-Type': 'application/json',
        'X-Error-Type': type,
        'X-Error-Code': code || 'UNKNOWN',
        ...headers,
      },
    });
  }

  /**
   * Respostas de erro específicas mais comuns
   */
  static validationError(
    message: string = 'Dados inválidos',
    details?: Record<string, unknown>
  ): NextResponse {
    return this.error('VALIDATION_ERROR', message, 'VALIDATION_FAILED', 400, details);
  }

  static authenticationError(message: string = 'Token inválido ou expirado'): NextResponse {
    return this.error('AUTHENTICATION_ERROR', message, 'AUTH_FAILED', 401);
  }

  static authorizationError(message: string = 'Acesso negado'): NextResponse {
    return this.error('AUTHORIZATION_ERROR', message, 'ACCESS_DENIED', 403);
  }

  static notFoundError(resource: string = 'Recurso'): NextResponse {
    return this.error('NOT_FOUND_ERROR', `${resource} não encontrado`, 'NOT_FOUND', 404);
  }

  static conflictError(message: string, details?: Record<string, unknown>): NextResponse {
    return this.error('CONFLICT_ERROR', message, 'CONFLICT', 409, details);
  }

  static rateLimitError(
    message: string = 'Muitas tentativas. Tente novamente mais tarde.',
    details?: Record<string, unknown>
  ): NextResponse {
    return this.error('RATE_LIMIT_ERROR', message, 'RATE_LIMIT_EXCEEDED', 429, details, {
      'Retry-After': details?.resetTime
        ? Math.ceil(((details.resetTime as number) - Date.now()) / 1000).toString()
        : '60',
    });
  }

  static databaseError(message: string = 'Erro no banco de dados'): NextResponse {
    return this.error('DATABASE_ERROR', message, 'DATABASE_ERROR', 500);
  }

  static internalServerError(
    message: string = 'Erro interno do servidor',
    details?: Record<string, unknown>
  ): NextResponse {
    return this.error('INTERNAL_SERVER_ERROR', message, 'INTERNAL_ERROR', 500, details);
  }

  static badRequest(
    message: string = 'Dados inválidos',
    details?: Record<string, unknown>
  ): NextResponse {
    return this.error('BAD_REQUEST', message, 'BAD_REQUEST', 400, details);
  }

  /**
   * Respostas de sucesso específicas mais comuns
   */
  static created<T>(data: T, message: string = 'Criado com sucesso'): NextResponse {
    return this.success(data, message, 201);
  }

  static updated<T>(data: T, message: string = 'Atualizado com sucesso'): NextResponse {
    return this.success(data, message, 200);
  }

  static deleted(message: string = 'Deletado com sucesso'): NextResponse {
    return this.success(null, message, 200);
  }

  static noContent(): NextResponse {
    return new NextResponse(null, { status: 204 });
  }

  /**
   * Métodos específicos para listagem com paginação
   */
  static paginated<T>(data: T[], pagination: PaginationInfo, message?: string): NextResponse {
    return this.success(data, message, 200, pagination);
  }

  static list<T>(data: T[], message?: string): NextResponse {
    return this.success(data, message, 200);
  }

  /**
   * Wrapper para funções que podem gerar erros
   * Use os error handlers específicos para Edge Runtime ou Node.js
   */
  static async withErrorHandling<T>(
    handler: () => Promise<T>,
    onSuccess?: (data: T) => NextResponse,
    onError?: (error: unknown) => NextResponse
  ): Promise<NextResponse> {
    try {
      const result = await handler();

      if (onSuccess) {
        return onSuccess(result);
      }

      // Se o resultado já é um NextResponse, retornar diretamente
      if (result instanceof NextResponse) {
        return result;
      }

      // Caso contrário, wrappear em resposta de sucesso
      return this.success(result);
    } catch (error: unknown) {
      if (onError) {
        return onError(error);
      }

      // Fallback simples para erro genérico
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      return this.internalServerError(errorMessage);
    }
  }
}

// Função helper mais simples para uso rápido
export const createResponse = {
  success: <T>(data: T, message?: string, status?: number) =>
    ApiResponse.success(data, message, status),

  paginated: <T>(data: T[], pagination: PaginationInfo, message?: string) =>
    ApiResponse.paginated(data, pagination, message),

  list: <T>(data: T[], message?: string) => ApiResponse.list(data, message),

  error: (type: string, message: string, code?: string, status?: number) =>
    ApiResponse.error(type, message, code, status),
};

export default ApiResponse;
