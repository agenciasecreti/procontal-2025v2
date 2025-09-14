import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhone(phone: string): string {
  // Remove caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '');

  // Formata o número de telefone
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }

  return phone; // Retorna o número original se não for válido
}

export function clearPhone(phone: string): string {
  // Remove caracteres não numéricos
  return phone.replace(/\D/g, '').trim();
}

export function formatCpf(cpf: string): string {
  // Remove caracteres não numéricos
  const cleaned = cpf.replace(/\D/g, '');

  // Formata o CPF
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
  }

  return cpf; // Retorna o CPF original se não for válido
}

export function clearCpf(cpf: string): string {
  // Remove caracteres não numéricos
  return cpf.replace(/\D/g, '');
}

export function formatCnpj(cnpj: string): string {
  // Remove caracteres não numéricos
  const cleaned = cnpj.replace(/\D/g, '');

  // Formata o CNPJ
  if (cleaned.length === 14) {
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
  }

  return cnpj; // Retorna o CNPJ original se não for válido
}

export function clearCnpj(cnpj: string): string {
  // Remove caracteres não numéricos
  return cnpj.replace(/\D/g, '');
}

export function formatDateTime(date: Date | string, format: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  return d
    .toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: format.includes('HH') ? '2-digit' : undefined,
      minute: format.includes(':mm') ? '2-digit' : undefined,
      second: format.includes(':ss') ? '2-digit' : undefined,
    })
    .replace(',', '')
    .trim();
}

// Gera uma senha aleatória de 12 caracteres
export function randomPassword(length = 12): string {
  // Gera uma senha forte e aleatória de 8 dígitos com letras maiúsculas, minúsculas, números e símbolos
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const allChars = uppercase + lowercase + numbers + symbols;
  let randomPassword = '';

  // Garantir pelo menos um de cada tipo
  randomPassword += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  randomPassword += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  randomPassword += numbers.charAt(Math.floor(Math.random() * numbers.length));
  randomPassword += symbols.charAt(Math.floor(Math.random() * symbols.length));

  // Preencher o restante até 12 caracteres
  for (let i = randomPassword.length; i < length; i++) {
    randomPassword += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  // Embaralhar a senha para evitar padrão previsível
  randomPassword = randomPassword
    .split('')
    .sort(() => 0.5 - Math.random())
    .join('');

  return randomPassword;
}
