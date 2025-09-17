/**
 * 🌍 Configurações de Ambiente
 * Centraliza e valida todas as variáveis de ambiente da aplicação
 */

// Validação de variáveis obrigatórias
const requiredEnv = ['JWT_SECRET', 'DATABASE_URL', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY'];

// Verificar se todas as variáveis obrigatórias estão definidas
for (const env of requiredEnv) {
  if (!process.env[env]) {
    throw new Error(`❌ Variável de ambiente obrigatória não definida: ${env}`);
  }
}

// 🔧 Configurações da aplicação
export const config = {
  // URLs Base
  urls: {
    public: process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3001',
    cdn: process.env.NEXT_PUBLIC_CDN_URL || '',
  },

  // Site
  site: {
    name: process.env.NEXT_PUBLIC_SITE_NAME || 'SecreTI',
    shortName: process.env.NEXT_PUBLIC_SITE_SHORTNAME || 'SecreTI',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },

  // Banco de dados
  database: {
    url: process.env.DATABASE_URL!,
  },

  // S3/CDN
  s3: {
    bucketName: process.env.S3_BUCKET_NAME || 'secreti',
    region: process.env.S3_REGION || 'sfo2',
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },

  // SMTP
  smtp: {
    host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT || '2525'),
    user: process.env.SMTP_USER || 'c5d5c1ecbe150d',
    password: process.env.SMTP_PASSWORD || 'c350889c93115f',
    from: {
      name: process.env.SMTP_FROM_NAME || 'SecreTI',
      email: process.env.SMTP_FROM_EMAIL || 'contato@secreti.com.br',
    },
  },

  // Admin Features (centralizadas e flexíveis)
  admin: {
    // Parse da string separada por vírgulas
    enabledFeatures: (process.env.NEXT_PUBLIC_ADMIN_FEATURES || '')
      .split(',')
      .map((f) => f.trim())
      .filter((f) => f.length > 0),

    // Helper functions para verificar features específicas
    features: {
      get posts() {
        return config.admin.enabledFeatures.includes('posts');
      },
      get banners() {
        return config.admin.enabledFeatures.includes('banners');
      },
      get courses() {
        return config.admin.enabledFeatures.includes('courses');
      },
      get teachers() {
        return config.admin.enabledFeatures.includes('teachers');
      },
      get users() {
        return config.admin.enabledFeatures.includes('users');
      },
      get config() {
        return config.admin.enabledFeatures.includes('config');
      },
    },

    // Verificar se pelo menos uma feature está habilitada
    get hasAnyEnabled() {
      return config.admin.enabledFeatures.length > 0;
    },
  },

  // Environment
  env: {
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
  },
} as const;

// 🔍 Função para debug das configurações (apenas em desenvolvimento)
export function debugConfig() {
  if (config.env.isDev) {
    console.log('🔧 Configurações da aplicação:', {
      urls: config.urls,
      site: config.site,
      rateLimit: config.rateLimit,
      admin: {
        enabledFeatures: config.admin.enabledFeatures,
        hasAnyEnabled: config.admin.hasAnyEnabled,
        features: {
          posts: config.admin.features.posts,
          banners: config.admin.features.banners,
          courses: config.admin.features.courses,
          teachers: config.admin.features.teachers,
          users: config.admin.features.users,
          config: config.admin.features.config,
        },
      },
      env: config.env,
    });
  }
}

// 🎯 Utilitário para verificar múltiplas features de uma vez
export function hasAdminFeatures(...features: string[]): boolean {
  return features.every((feature) => config.admin.enabledFeatures.includes(feature));
}

// 🎯 Utilitário para verificar se pelo menos uma feature está habilitada
export function hasAnyAdminFeature(...features: string[]): boolean {
  return features.some((feature) => config.admin.enabledFeatures.includes(feature));
}

// Validar configurações críticas
export function validateConfig() {
  const errors: string[] = [];

  // Validar JWT Secret
  if (config.jwt.secret.length < 32) {
    errors.push('JWT_SECRET deve ter pelo menos 32 caracteres');
  }

  // Validar URLs
  try {
    new URL(config.urls.public);
  } catch {
    errors.push('URLs inválidas detectadas');
  }

  // Validar S3
  if (!config.s3.accessKeyId || !config.s3.secretAccessKey) {
    errors.push('Credenciais S3 incompletas');
  }

  // Validar Rate Limiting
  if (config.rateLimit.maxRequests < 1 || config.rateLimit.windowMs < 1000) {
    errors.push('Configurações de rate limiting inválidas');
  }

  // Validar Admin Features
  const validFeatures = ['posts', 'banners', 'courses', 'users', 'config'];
  const enabledFeatures = (process.env.NEXT_PUBLIC_ADMIN_FEATURES || '')
    .split(',')
    .map((f) => f.trim())
    .filter((f) => f.length > 0);

  const invalidFeatures = enabledFeatures.filter(
    (feature: string) => !validFeatures.includes(feature)
  );
  if (invalidFeatures.length > 0) {
    errors.push(`Features admin inválidas: ${invalidFeatures.join(', ')}`);
  }

  if (errors.length > 0) {
    throw new Error(`❌ Erros de configuração:\n${errors.join('\n')}`);
  }

  console.log('✅ Todas as configurações validadas com sucesso');
}

export default config;
