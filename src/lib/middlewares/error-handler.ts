/**
 * Error Handling Avançado
 *
 * Este middleware captura, processa e registra todos os erros da aplicação,
 * fornecendo respostas consistentes e logs detalhados.
 * Integrado com ApiResponse para respostas padronizadas.
 */

import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { ApiResponse, type StandardErrorResponse } from '../api-response';

// Tipos de erro customizados
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  DATABASE = 'DATABASE_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  CONFLICT = 'CONFLICT_ERROR',
  RATE_LIMIT = 'RATE_LIMIT_ERROR',
  INTERNAL = 'INTERNAL_SERVER_ERROR',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE_ERROR',
  FILE_UPLOAD = 'FILE_UPLOAD_ERROR',
}

export interface AppError extends Error {
  type: ErrorType;
  statusCode: number;
  code?: string;
  details?: Record<string, unknown>;
  context?: Record<string, unknown>;
  isOperational: boolean;
}

// Usar o StandardErrorResponse do ApiResponse para consistência
export type ErrorResponse = StandardErrorResponse;

// 🏗️ Classe base para erros customizados
export class BaseError extends Error implements AppError {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly details?: Record<string, unknown>;
  public readonly context?: Record<string, unknown>;
  public readonly isOperational: boolean = true;

  constructor(
    message: string,
    type: ErrorType,
    statusCode: number,
    code?: string,
    details?: Record<string, unknown>,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.type = type;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.context = context;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Erros de validação
export class ValidationError extends BaseError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, ErrorType.VALIDATION, 400, 'VALIDATION_FAILED', details);
  }
}

// Erros de autenticação
export class AuthenticationError extends BaseError {
  constructor(message: string = 'Token inválido ou expirado', details?: Record<string, unknown>) {
    super(message, ErrorType.AUTHENTICATION, 401, 'AUTH_FAILED', details);
  }
}

// Erros de Autorização
export class AuthorizationError extends BaseError {
  constructor(message: string = 'Acesso negado', details?: Record<string, unknown>) {
    super(message, ErrorType.AUTHORIZATION, 403, 'ACCESS_DENIED', details);
  }
}

// Erros de não encontrado
export class NotFoundError extends BaseError {
  constructor(resource: string = 'Recurso', details?: Record<string, unknown>) {
    super(`${resource} não encontrado`, ErrorType.NOT_FOUND, 404, 'NOT_FOUND', details);
  }
}

// Erros de conflito
export class ConflictError extends BaseError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, ErrorType.CONFLICT, 409, 'CONFLICT', details);
  }
}

// Erros de limite de taxa
export class RateLimitError extends BaseError {
  constructor(
    message: string = 'Muitas tentativas. Tente novamente mais tarde.',
    details?: Record<string, unknown>
  ) {
    super(message, ErrorType.RATE_LIMIT, 429, 'RATE_LIMIT_EXCEEDED', details);
  }
}

// Erros de banco de dados
export class DatabaseError extends BaseError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, ErrorType.DATABASE, 500, 'DATABASE_ERROR', details);
  }
}

// Erros de serviços externos
export class ExternalServiceError extends BaseError {
  constructor(service: string, message: string, details?: Record<string, unknown>) {
    super(
      `Erro no serviço ${service}: ${message}`,
      ErrorType.EXTERNAL_SERVICE,
      502,
      'EXTERNAL_SERVICE_ERROR',
      details
    );
  }
}

// Erros de upload de arquivo
export class FileUploadError extends BaseError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, ErrorType.FILE_UPLOAD, 400, 'FILE_UPLOAD_ERROR', details);
  }
}

// Processador de erros por tipo
class ErrorProcessor {
  /**
   * Processar erro do Zod (validação)
   */
  static processZodError(error: ZodError): ValidationError {
    const details = error.issues.reduce(
      (acc, issue) => {
        const path = issue.path.join('.');
        acc[path] = issue.message;
        return acc;
      },
      {} as Record<string, string>
    );

    return new ValidationError('Dados inválidos fornecidos', details);
  }

  /**
   * Processar erro do Prisma
   */
  static processPrismaError(
    error: PrismaClientKnownRequestError | PrismaClientValidationError
  ): BaseError {
    if (error instanceof PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          return new ConflictError('Registro duplicado', {
            field: error.meta?.target,
            code: error.code,
          });

        case 'P2025':
          return new NotFoundError('Registro');

        case 'P2003':
          return new ValidationError('Referência inválida', {
            field: error.meta?.field_name,
            code: error.code,
          });

        case 'P2014':
          return new ValidationError('Violação de restrição', {
            relation: error.meta?.relation_name,
            code: error.code,
          });

        default:
          return new DatabaseError(`Erro no banco de dados: ${error.message}`, {
            code: error.code,
            meta: error.meta,
          });
      }
    }

    if (error instanceof PrismaClientValidationError) {
      return new ValidationError('Dados inválidos para o banco de dados');
    }

    return new DatabaseError('Erro desconhecido no banco de dados');
  }

  /**
   * Processar outros tipos de erro
   */
  static processGenericError(error: Error | unknown): BaseError {
    // Erro de timeout de rede
    if (typeof error === 'object' && error && 'code' in error) {
      const networkError = error as { code: string };
      if (networkError.code === 'ECONNREFUSED' || networkError.code === 'ENOTFOUND') {
        return new ExternalServiceError('rede', 'Falha na conexão');
      }
    }

    // Erro de JSON parsing
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      return new ValidationError('JSON inválido fornecido');
    }

    // Outros erros operacionais conhecidos
    if (typeof error === 'object' && error && 'isOperational' in error && error.isOperational) {
      return error as BaseError;
    }

    // Erro genérico não tratado
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new BaseError(
      'Erro interno do servidor',
      ErrorType.INTERNAL,
      500,
      'INTERNAL_ERROR',
      undefined,
      { originalError: errorMessage }
    );
  }
}

// Sistema de logging de erros
class ErrorLogger {
  /**
   * 📊 Log detalhado de erro
   */
  static logError(
    error: AppError,
    request?: NextRequest,
    additionalContext?: Record<string, unknown>
  ) {
    const logData = {
      timestamp: new Date().toISOString(),
      level: error.statusCode >= 500 ? 'ERROR' : 'WARN',
      type: error.type,
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
      stack: error.stack,
      details: error.details,
      context: {
        ...error.context,
        ...additionalContext,
        request: request
          ? {
              method: request.method,
              url: request.url,
              userAgent: request.headers.get('user-agent'),
              ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
              referer: request.headers.get('referer'),
            }
          : undefined,
      },
    };

    // Log no console (em produção, enviar para serviço de logging)
    if (error.statusCode >= 500) {
      console.error('ERRO CRÍTICO:', JSON.stringify(logData, null, 2));
    } else {
      console.warn('ERRO OPERACIONAL:', JSON.stringify(logData, null, 2));
    }

    // TODO: Integrar com serviços de monitoramento (Sentry, DataDog, etc.)
    // if (process.env.NODE_ENV === 'production') {
    //   sentryClient.captureException(error, { extra: logData });
    // }
  }

  /**
   * Log de métricas de erro
   */
  static logErrorMetrics(error: AppError) {
    // TODO: Integrar com métricas (Prometheus, CloudWatch, etc.)
    console.log(`MÉTRICA: ${error.type} - Status: ${error.statusCode}`);
  }
}

// Middleware principal de tratamento de erros
export class ErrorHandler {
  /**
   * Processar e formatar erro para resposta HTTP
   */
  static processError(
    error: Error | unknown,
    request?: NextRequest
  ): { error: AppError; response: NextResponse } {
    let processedError: AppError;

    // Processar diferentes tipos de erro
    if (error instanceof BaseError) {
      processedError = error;
    } else if (error instanceof ZodError) {
      processedError = ErrorProcessor.processZodError(error);
    } else if (
      error instanceof PrismaClientKnownRequestError ||
      error instanceof PrismaClientValidationError
    ) {
      processedError = ErrorProcessor.processPrismaError(error);
    } else {
      processedError = ErrorProcessor.processGenericError(error);
    }

    // Fazer log do erro
    ErrorLogger.logError(processedError, request);
    ErrorLogger.logErrorMetrics(processedError);

    // Usar ApiResponse para criar resposta consistente
    const response = this.createErrorResponse(processedError, request);

    return { error: processedError, response };
  }

  /**
   * Criar resposta de erro usando ApiResponse
   */
  private static createErrorResponse(error: AppError, request?: NextRequest): NextResponse {
    const requestId = request?.headers.get('x-request-id') || undefined;

    // Mapear tipos de erro para métodos específicos do ApiResponse
    switch (error.type) {
      case ErrorType.VALIDATION:
        return ApiResponse.validationError(error.message, error.details);

      case ErrorType.AUTHENTICATION:
        return ApiResponse.authenticationError(error.message);

      case ErrorType.AUTHORIZATION:
        return ApiResponse.authorizationError(error.message);

      case ErrorType.NOT_FOUND:
        return ApiResponse.notFoundError(error.message.replace(' não encontrado', ''));

      case ErrorType.CONFLICT:
        return ApiResponse.conflictError(error.message, error.details);

      case ErrorType.RATE_LIMIT:
        return ApiResponse.rateLimitError(error.message, error.details);

      case ErrorType.DATABASE:
        return ApiResponse.databaseError(error.message);

      case ErrorType.EXTERNAL_SERVICE:
        return ApiResponse.error(
          error.type,
          error.message,
          error.code,
          502,
          error.details,
          undefined,
          requestId
        );

      case ErrorType.FILE_UPLOAD:
        return ApiResponse.error(
          error.type,
          error.message,
          error.code,
          400,
          error.details,
          undefined,
          requestId
        );

      default:
        return ApiResponse.internalServerError(error.message);
    }
  }

  /**
   * Middleware para captura global de erros
   */
  static createMiddleware() {
    return async (request: NextRequest, handler: () => Promise<NextResponse>) => {
      try {
        return await handler();
      } catch (error) {
        const { response } = this.processError(error, request);
        return response;
      }
    };
  }
}

// Função helper para APIs - agora usando ApiResponse
export function withErrorHandling<T>(handler: (request: NextRequest) => Promise<T>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const result = await handler(request);

      // Se o handler retornar NextResponse, usar diretamente
      if (result instanceof NextResponse) {
        return result;
      }

      // Caso contrário, usar ApiResponse para wrappear
      return ApiResponse.success(result);
    } catch (error) {
      const { response } = ErrorHandler.processError(error, request);
      return response;
    }
  };
}

// Função para validação com tratamento de erro
export function validateRequest<T>(schema: { parse: (data: unknown) => T }, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw ErrorProcessor.processZodError(error);
    }
    throw error;
  }
}

export default ErrorHandler;
