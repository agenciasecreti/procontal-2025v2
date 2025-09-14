import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const prisma = new PrismaClient();

export interface ApiKeyData {
  name: string;
  permissions?: string[];
  ip_whitelist?: string[];
  expires_at?: Date;
}

export interface ApiKeyResponse {
  id: number;
  name: string;
  apiKey: string;
  permissions?: string[];
  ip_whitelist?: string[];
  expires_at?: Date;
  active: boolean;
}

/**
 * Gera uma nova API Key
 */
export async function generateApiKey(data: ApiKeyData): Promise<ApiKeyResponse> {
  // Gera uma chave aleatória de 32 bytes em formato hexadecimal
  const apiKey = `sk_${crypto.randomBytes(32).toString('hex')}`;

  // Cria hash da chave para armazenar no banco
  const keyHash = await bcrypt.hash(apiKey, 12);

  const newApiKey = await prisma.apiKey.create({
    data: {
      name: data.name,
      key_hash: keyHash,
      permissions: data.permissions ? JSON.stringify(data.permissions) : null,
      ip_whitelist: data.ip_whitelist ? JSON.stringify(data.ip_whitelist) : null,
      expires_at: data.expires_at,
    },
  });

  return {
    id: newApiKey.id,
    name: newApiKey.name,
    apiKey, // Retorna a chave apenas na criação
    permissions: newApiKey.permissions
      ? (() => {
          try {
            return JSON.parse(newApiKey.permissions);
          } catch {
            console.error(
              `Erro ao parsear permissions para API Key ${newApiKey.id}:`,
              newApiKey.permissions
            );
            return [];
          }
        })()
      : undefined,
    ip_whitelist: newApiKey.ip_whitelist
      ? (() => {
          try {
            return JSON.parse(newApiKey.ip_whitelist);
          } catch {
            console.error(
              `Erro ao parsear ip_whitelist para API Key ${newApiKey.id}:`,
              newApiKey.ip_whitelist
            );
            return [];
          }
        })()
      : undefined,
    expires_at: newApiKey.expires_at || undefined,
    active: newApiKey.active,
  };
}

/**
 * Verifica se uma API Key é válida
 */
export interface VerifiedApiKeyData {
  id: number;
  name: string;
  permissions: string[];
  ip_whitelist: string[];
}

export async function verifyApiKey(
  apiKey: string,
  clientIp?: string
): Promise<{
  valid: boolean;
  apiKeyData?: VerifiedApiKeyData;
  error?: string;
}> {
  try {
    // Busca todas as chaves ativas
    const apiKeys = await prisma.apiKey.findMany({
      where: {
        active: true,
        deleted_at: null,
        OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }],
      },
    });

    // console.log('API Keys encontradas:', apiKeys)

    // Verifica se alguma chave corresponde
    for (const key of apiKeys) {
      const isValid = await bcrypt.compare(apiKey, key.key_hash);

      if (isValid) {
        // Verifica whitelist de IPs se configurado
        if (key.ip_whitelist && clientIp) {
          const allowedIps = JSON.parse(key.ip_whitelist);

          // Se a whitelist contém "*" ou "0.0.0.0/0", permite qualquer IP
          if (allowedIps.includes('*') || allowedIps.includes('0.0.0.0/0')) {
            // Permite qualquer IP
          } else if (!isIpAuthorized(clientIp, allowedIps)) {
            return {
              valid: false,
              error: `IP ${clientIp} não autorizado. IPs permitidos: ${allowedIps.join(', ')}`,
            };
          }
        }

        // Atualiza último uso
        await prisma.apiKey.update({
          where: { id: key.id },
          data: { last_used_at: new Date() },
        });

        return {
          valid: true,
          apiKeyData: {
            id: key.id,
            name: key.name,
            permissions: key.permissions
              ? (() => {
                  try {
                    return JSON.parse(key.permissions);
                  } catch {
                    console.error(
                      `Erro ao parsear permissions para API Key ${key.id}:`,
                      key.permissions
                    );
                    return [];
                  }
                })()
              : [],
            ip_whitelist: key.ip_whitelist
              ? (() => {
                  try {
                    return JSON.parse(key.ip_whitelist);
                  } catch {
                    console.error(
                      `Erro ao parsear ip_whitelist para API Key ${key.id}:`,
                      key.ip_whitelist
                    );
                    return [];
                  }
                })()
              : [],
          },
        };
      }
    }

    return { valid: false, error: 'API Key inválida' };
  } catch (error) {
    console.error('Erro ao verificar API Key:', error);
    return { valid: false, error: 'Erro interno ao verificar API Key' };
  }
}

/**
 * Lista todas as API Keys (sem mostrar as chaves)
 */
export async function listApiKeys() {
  return await prisma.apiKey.findMany({
    where: { deleted_at: null },
    select: {
      id: true,
      name: true,
      permissions: true,
      ip_whitelist: true,
      expires_at: true,
      active: true,
      last_used_at: true,
      created_at: true,
    },
    orderBy: { created_at: 'desc' },
  });
}

/**
 * Revoga uma API Key
 */
export async function revokeApiKey(id: number) {
  return await prisma.apiKey.update({
    where: { id },
    data: {
      active: false,
      deleted_at: new Date(),
    },
  });
}

/**
 * Valida um padrão de IP antes de salvar
 */
export function validateIpPattern(pattern: string): { valid: boolean; error?: string } {
  // Remove espaços
  pattern = pattern.trim();

  if (!pattern) {
    return { valid: false, error: 'Padrão de IP não pode estar vazio' };
  }

  // Permite wildcards especiais para qualquer IP
  if (pattern === '*' || pattern === '0.0.0.0/0') {
    return { valid: true };
  }

  // Valida CIDR
  if (pattern.includes('/')) {
    const [network, prefix] = pattern.split('/');
    const prefixNum = parseInt(prefix, 10);

    if (isNaN(prefixNum) || prefixNum < 0 || prefixNum > 32) {
      return { valid: false, error: 'Prefixo CIDR deve ser entre 0 e 32' };
    }

    // Valida o IP da rede
    if (!isValidIpFormat(network)) {
      return { valid: false, error: 'IP de rede inválido no CIDR' };
    }
  }
  // Valida wildcards
  else if (pattern.includes('*') || pattern.includes('?')) {
    // Aceita wildcards válidos
    if (!/^[0-9.*?]+$/.test(pattern)) {
      return { valid: false, error: 'Padrão wildcard contém caracteres inválidos' };
    }
  }
  // Valida IP específico
  else {
    if (!isValidIpFormat(pattern)) {
      return { valid: false, error: 'Formato de IP inválido' };
    }
  }

  return { valid: true };
}

/**
 * Verifica se uma string está no formato de IP válido
 */
function isValidIpFormat(ip: string): boolean {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;

  return parts.every((part) => {
    const num = parseInt(part, 10);
    return !isNaN(num) && num >= 0 && num <= 255;
  });
}

/**
 * Verifica se um IP corresponde a um padrão (suporta wildcards)
 */
function matchesIpPattern(ip: string, pattern: string): boolean {
  // Suporte a wildcards (* e ?)
  if (pattern.includes('*') || pattern.includes('?')) {
    const regexPattern = pattern.replace(/\./g, '\\.').replace(/\*/g, '.*').replace(/\?/g, '.');

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(ip);
  }

  // Suporte a CIDR
  if (pattern.includes('/')) {
    return ipInCidr(ip, pattern);
  }

  // IP específico
  return ip === pattern;
}

/**
 * Verifica se um IP está dentro de uma faixa CIDR
 */
function ipInCidr(ip: string, cidr: string): boolean {
  if (!cidr.includes('/')) {
    // Se não tem barra, é um IP específico
    return ip === cidr;
  }

  const [network, prefixLength] = cidr.split('/');
  const prefix = parseInt(prefixLength, 10);

  // Converte IPs para números
  const ipNum = ipToNumber(ip);
  const networkNum = ipToNumber(network);

  if (ipNum === null || networkNum === null) {
    return false;
  }

  // Calcula a máscara de rede
  const mask = (0xffffffff << (32 - prefix)) >>> 0;

  // Verifica se o IP está na mesma rede
  return (ipNum & mask) === (networkNum & mask);
}

/**
 * Converte IP string para número
 */
function ipToNumber(ip: string): number | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;

  let result = 0;
  for (let i = 0; i < 4; i++) {
    const part = parseInt(parts[i], 10);
    if (isNaN(part) || part < 0 || part > 255) return null;
    result = (result << 8) + part;
  }
  return result >>> 0; // Converte para unsigned
}

/**
 * Verifica se um IP está autorizado na whitelist
 */
function isIpAuthorized(clientIp: string, allowedIps: string[]): boolean {
  // Verifica se algum padrão na whitelist corresponde ao IP
  return allowedIps.some((pattern) => matchesIpPattern(clientIp, pattern));
}
