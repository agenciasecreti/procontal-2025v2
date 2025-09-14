import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ApiResponse } from '../api-response';

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface ValidationResult<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  errors?: ValidationError[];
}

// Esquemas de validação comuns
export const commonSchemas = {
  email: z
    .string()
    .email({ message: 'Email deve ter um formato válido' })
    .transform((email) => email.toLowerCase().trim()),

  password: z
    .string()
    .min(8, { message: 'Senha deve ter pelo menos 8 caracteres' })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
      message:
        'Senha deve conter ao menos: 1 minúscula, 1 maiúscula, 1 número e 1 caractere especial',
    }),

  id: z.coerce
    .number()
    .int({ message: 'ID deve ser um número inteiro' })
    .positive({ message: 'ID deve ser um número positivo' }),

  name: z
    .string()
    .trim()
    .min(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
    .max(100, { message: 'Nome deve ter no máximo 100 caracteres' })
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, { message: 'Nome deve conter apenas letras e espaços' }),

  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  }),

  slug: z
    .string()
    .trim()
    .min(1, { message: 'Slug é obrigatório' })
    .regex(/^[a-z0-9-]+$/, {
      message: 'Slug deve conter apenas letras minúsculas, números e hífens',
    }),

  url: z.string().url({ message: 'URL deve ter um formato válido' }),

  phoneNumber: z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, {
    message: 'Telefone deve estar no formato (xx) xxxxx-xxxx',
  }),

  cpf: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, { message: 'CPF deve estar no formato xxx.xxx.xxx-xx' }),

  status: z.enum(['active', 'inactive', 'pending'], {
    errorMap: () => ({ message: 'Status deve ser: active, inactive ou pending' }),
  }),
};

// Esquemas específicos para entidades
export const userSchemas = {
  create: z.object({
    name: commonSchemas.name,
    email: commonSchemas.email,
    password: commonSchemas.password,
    role: z
      .enum(['admin', 'teacher', 'student'], {
        errorMap: () => ({ message: 'Role deve ser: admin, teacher ou student' }),
      })
      .default('student'),
    phone: commonSchemas.phoneNumber.optional(),
    cpf: commonSchemas.cpf.optional(),
  }),

  update: z.object({
    name: commonSchemas.name.optional(),
    email: commonSchemas.email.optional(),
    role: z.enum(['admin', 'teacher', 'student']).optional(),
    phone: commonSchemas.phoneNumber.optional(),
    cpf: commonSchemas.cpf.optional(),
    status: commonSchemas.status.optional(),
  }),

  login: z.object({
    email: commonSchemas.email,
    password: z.string().min(1, { message: 'Senha é obrigatória' }),
  }),
};

export const courseSchemas = {
  create: z.object({
    title: z.string().trim().min(1, { message: 'Título é obrigatório' }).max(200),
    description: z.string().trim().min(1, { message: 'Descrição é obrigatória' }),
    slug: commonSchemas.slug,
    teacherId: commonSchemas.id,
    price: z.coerce.number().min(0, { message: 'Preço deve ser maior ou igual a zero' }),
    duration: z.coerce.number().positive({ message: 'Duração deve ser um número positivo' }),
    level: z.enum(['beginner', 'intermediate', 'advanced'], {
      errorMap: () => ({ message: 'Nível deve ser: beginner, intermediate ou advanced' }),
    }),
    category: z.string().trim().min(1, { message: 'Categoria é obrigatória' }),
    thumbnail: z.string().url().optional(),
    status: commonSchemas.status.default('active'),
  }),

  update: z.object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().min(1).optional(),
    slug: commonSchemas.slug.optional(),
    teacherId: commonSchemas.id.optional(),
    price: z.coerce.number().min(0).optional(),
    duration: z.coerce.number().positive().optional(),
    level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    category: z.string().trim().min(1).optional(),
    thumbnail: z.string().url().optional(),
    status: commonSchemas.status.optional(),
  }),
};

export const postSchemas = {
  create: z.object({
    title: z.string().trim().min(1, { message: 'Título é obrigatório' }).max(200),
    content: z.string().trim().min(1, { message: 'Conteúdo é obrigatório' }),
    slug: commonSchemas.slug,
    excerpt: z.string().trim().max(500).optional(),
    authorId: commonSchemas.id,
    category: z.string().trim().min(1, { message: 'Categoria é obrigatória' }),
    tags: z.array(z.string().trim().min(1)).default([]),
    thumbnail: z.string().url().optional(),
    status: z.enum(['draft', 'published', 'archived']).default('draft'),
    publishedAt: z.string().datetime().optional(),
  }),

  update: z.object({
    title: z.string().trim().min(1).max(200).optional(),
    content: z.string().trim().min(1).optional(),
    slug: commonSchemas.slug.optional(),
    excerpt: z.string().trim().max(500).optional(),
    category: z.string().trim().min(1).optional(),
    tags: z.array(z.string().trim().min(1)).optional(),
    thumbnail: z.string().url().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    publishedAt: z.string().datetime().optional(),
  }),
};

// Função para validar dados
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
  try {
    const validatedData = schema.parse(data);
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationError[] = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
        value: err.path.length > 0 ? getNestedValue(data, err.path) : data,
      }));

      return {
        // success: false,
        error: 'Erro de validação',
        errors,
      };
    }

    return {
      // success: false,
      error: 'Erro de validação desconhecido',
      errors: [
        {
          field: 'unknown',
          message: 'Erro de validação desconhecido',
        },
      ],
    };
  }
}

// Função auxiliar para obter valor aninhado
function getNestedValue(obj: unknown, path: (string | number)[]): unknown {
  return path.reduce((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string | number, unknown>)[key];
    }
    return undefined;
  }, obj);
}

// Middleware para validação de request body
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return async (req: NextRequest): Promise<NextResponse | { validatedData: T }> => {
    try {
      const body = await req.json();
      const result = validateData(schema, body);

      if (!result.success) {
        return ApiResponse.validationError('Dados inválidos', {
          errors: result.errors,
        });
      }

      return { validatedData: result.data! };
    } catch {
      return ApiResponse.validationError('JSON inválido');
    }
  };
}

// Middleware para validação de query parameters
export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return (req: NextRequest): NextResponse | { validatedData: T } => {
    const searchParams = req.nextUrl.searchParams;
    const queryObject: Record<string, string | string[]> = {};

    searchParams.forEach((value, key) => {
      if (queryObject[key]) {
        if (Array.isArray(queryObject[key])) {
          (queryObject[key] as string[]).push(value);
        } else {
          queryObject[key] = [queryObject[key] as string, value];
        }
      } else {
        queryObject[key] = value;
      }
    });

    const result = validateData(schema, queryObject);

    if (!result.success) {
      return ApiResponse.validationError('Parâmetros de consulta inválidos', {
        errors: result.errors,
      });
    }

    return { validatedData: result.data! };
  };
}

// Middleware para validação de parâmetros da URL
export function validateParams<T>(schema: z.ZodSchema<T>) {
  return (params: Record<string, string>): NextResponse | { validatedData: T } => {
    const result = validateData(schema, params);

    if (!result.success) {
      return ApiResponse.validationError('Parâmetros da URL inválidos', {
        errors: result.errors,
      });
    }

    return { validatedData: result.data! };
  };
}
