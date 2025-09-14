import ApiResponse from '@/lib/api-response';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';

/**
 * Rota para redefinição de senha.
 * @route POST /auth/reset
 * @returns NextResponse com a confirmação ou erro.
 */
export async function POST(req: NextRequest) {
  let res;
  try {
    res = await req.json();
  } catch (error) {
    return ApiResponse.validationError('Erro ao processar a requisição.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  const { email } = res;
  if (!email)
    return ApiResponse.validationError('E-mail é obrigatório.', {
      fields: { email: 'E-mail é obrigatório.' },
    });

  // Verifica se o e-mail existe no banco de dados
  const user = await prisma.user.findUnique({
    where: { email, deleted_at: null },
  });

  if (!user)
    return ApiResponse.validationError('E-mail não encontrado.', {
      fields: { email: 'E-mail não encontrado.' },
    });

  // Gera um codigo de 6 digitos numericos
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const updateUser = await prisma.user.update({
    where: { id: user.id },
    data: { reset_code: code, reset_code_expires: new Date(Date.now() + 3600000) }, // 1 hora de validade
  });

  if (!updateUser)
    return ApiResponse.internalServerError('Erro ao gerar o código de redefinição de senha.');

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/sendmail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: user.email,
        from: process.env.SMTP_FROM_EMAIL,
        subject: `[${process.env.NEXT_PUBLIC_SITE_NAME}] E-mail de redefinição de senha`,
        message: `<p>Olá ${user.name},</p>
                       <p>Você solicitou a redefinição de sua senha. Para continuar, utilize o código <b style="font-size: 24px;">${code}</b>, usando o seguinte link:</p>
                       <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/redefinir-senha">Redefinir Senha</a></p>
                       <p>Se você não solicitou esta redefinição, por favor ignore este e-mail.</p>
                       <p>Atenciosamente,</p>
                       <p>${process.env.NEXT_PUBLIC_SITE_NAME}</p>`,
      }),
    });
    if (!response.ok) {
      console.error('Erro ao enviar o e-mail:', {
        details: `Status Code: ${response.status} - ${response.statusText}`,
      });
      return ApiResponse.internalServerError('Erro ao enviar o e-mail.');
    }
  } catch (error) {
    return ApiResponse.internalServerError('Erro ao enviar o e-mail.', {
      details: error instanceof Error ? error.message : error,
    });
  }

  return ApiResponse.success({
    message: 'Redefinição de senha solicitada com sucesso. Verifique seu e-mail.',
  });
}
