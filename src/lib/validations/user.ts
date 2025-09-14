import { clearCpf, clearPhone } from '@/lib/utils';
import { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import PasswordValidator from 'password-validator';
import prisma from '../prisma';

export interface UserValidationData {
  name?: string;
  email?: string;
  cpf?: string;
  phone?: string;
  whatsapp?: string;
  birth_date?: string;
  avatar?: string;
  password?: string;
  confirmPassword?: string;
  role_id?: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  data?: User;
}

// Função para validar nome
export function isValidName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  const trimmedName = name.trim();
  if (trimmedName.length < 2 || trimmedName.length > 50) return false;
  // Verifica se contém apenas letras, espaços e alguns caracteres especiais comuns em nomes
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'.-]+$/;
  return nameRegex.test(trimmedName);
}

// Função para validar email
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
}

export async function validateUserData(
  data: UserValidationData,
  id?: number
): Promise<ValidationResult> {
  const validatedData: User = {} as User;

  // Validação do nome
  if (data.name !== undefined) {
    if (!data.name?.trim()) {
      return { isValid: false, error: 'O nome é obrigatório.' };
    }
    if (!isValidName(data.name)) {
      return {
        isValid: false,
        error: 'Nome inválido. Deve conter apenas letras e ter entre 2 a 50 caracteres.',
      };
    }
    validatedData.name = data.name.trim();
  }

  // Validação do email
  if (data.email !== undefined) {
    if (!data.email?.trim()) {
      return { isValid: false, error: 'O e-mail é obrigatório.' };
    }

    if (!isValidEmail(data.email)) {
      return { isValid: false, error: 'E-mail inválido.' };
    }

    // Limpa e valida o formato do e-mail
    const emailValidation = data.email.trim().toLowerCase();

    // Percorre o banco pra saber se o e-mail já está cadastrado
    const existingUser = await prisma.user.findUnique({
      where: { email: emailValidation },
    });

    // Caso encontre um usuário com o mesmo e-mail
    if (existingUser) {
      // Se não foi passado id, significa que é um novo usuário
      if (!id) {
        return { isValid: false, error: 'Já existe um usuário com este e-mail.' };
      } else {
        // Se foi passado id, significa que é uma edição
        if (existingUser.id !== id) {
          return { isValid: false, error: 'Já existe um usuário com este e-mail.' };
        }
      }
    }

    validatedData.email = emailValidation;
  }

  // Validação do CPF se ele for fornecido
  if (data.cpf !== undefined) {
    // Caso eu mande ele vazio
    if (data.cpf === '') {
      validatedData.cpf = null; // define como null
    } else {
      const cpfCleaned = clearCpf(data.cpf);
      // Se depois de limpar o CPF ele estiver vazio, ele veio em um formato inválido
      if (cpfCleaned.length === 0) {
        return { isValid: false, error: 'CPF inválido. Deve conter apenas números.' };
      }
      // Verifica se o CPF tem 11 dígitos
      if (cpfCleaned.length !== 11) {
        return { isValid: false, error: 'CPF inválido. Deve conter 11 dígitos.' };
      }
      validatedData.cpf = cpfCleaned;
    }
  }

  // Validação do telefone se ele for fornecido
  if (data.phone !== undefined) {
    // Caso eu mande ele vazio
    if (data.phone === '') {
      validatedData.phone = null; // define como null
    } else {
      const phoneCleaned = clearPhone(data.phone);
      // Se depois de limpar o telefone ele estiver vazio, ele veio em um formato inválido
      if (phoneCleaned.length === 0) {
        return { isValid: false, error: 'Telefone inválido. Deve conter apenas números.' };
      }
      // Verifica se o telefone tem 10 ou 11 dígitos
      if (phoneCleaned.length < 10 || phoneCleaned.length > 11) {
        return { isValid: false, error: 'Telefone inválido. Deve conter 10 ou 11 dígitos.' };
      }
      validatedData.phone = phoneCleaned;
    }
  }

  // Validação do whatsapp se ele for fornecido
  if (data.whatsapp !== undefined) {
    // Caso eu mande ele vazio
    if (data.whatsapp === '') {
      validatedData.whatsapp = null; // define como null
    } else {
      const whatsappCleaned = clearPhone(data.whatsapp);
      // Se depois de limpar o whatsapp ele estiver vazio, ele veio em um formato inválido
      if (whatsappCleaned.length === 0) {
        return { isValid: false, error: 'WhatsApp inválido. Deve conter apenas números.' };
      }
      // Verifica se o whatsapp tem 10 ou 11 dígitos
      if (whatsappCleaned.length < 10 || whatsappCleaned.length > 11) {
        return { isValid: false, error: 'WhatsApp inválido. Deve conter 10 ou 11 dígitos.' };
      }
      validatedData.whatsapp = whatsappCleaned;
    }
  }

  // Validação da data de nascimento se ela for fornecida
  if (data.birth_date !== undefined) {
    // Caso eu mande ele vazio
    if (isNaN(new Date(data.birth_date).getTime()) === true) {
      validatedData.birth_date = null; // define como null
    } else {
      const birth_date = new Date(data.birth_date);
      if (isNaN(birth_date.getTime())) {
        return { isValid: false, error: 'Data de nascimento inválida.' };
      }
      validatedData.birth_date = new Date(
        birth_date.getFullYear(),
        birth_date.getMonth(),
        birth_date.getDate()
      );
    }
  }

  return { isValid: true, data: validatedData };
}

export interface PasswordValidationResult {
  isValid: boolean;
  error?: string;
  hashedPassword?: string;
}

// Função para validar a senha
export function validatePassword(
  password: string,
  confirmPassword?: string
): PasswordValidationResult {
  // Verifica se as senhas coincidem
  if (!confirmPassword || password !== confirmPassword) {
    return { isValid: false, error: 'A senha e a confirmação não coincidem.' };
  }

  // Validação com password-validator
  const schema = new PasswordValidator();
  schema
    .is()
    .min(8)
    .is()
    .max(100)
    .has()
    .uppercase()
    .has()
    .lowercase()
    .has()
    .digits()
    .has()
    .symbols()
    .has()
    .not()
    .spaces()
    .is()
    .not()
    .oneOf(['Senha123', '12345678', 'qwertyuiop', 'password', '1234567890']);

  if (!schema.validate(password)) {
    return {
      isValid: false,
      error:
        'A senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais.',
    };
  }

  return { isValid: true, hashedPassword: bcrypt.hashSync(password, 10) };
}
