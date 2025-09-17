import GeneralMessage from '@/components/mail/general-message';
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

  const form = {
    subject: `[${process.env.NEXT_PUBLIC_SITE_NAME}] E-mail de redefinição de senha`,
    to: user.email,
    from: process.env.SMTP_FROM_EMAIL,
    name: '',
    phone: '',
    email: '',
    message: `<p>Olá ${user.name},</p>
                <p>Você solicitou a redefinição de sua senha. Para continuar, utilize o código abaixo:</p>
                <p style="text-align: center;"><b style="font-size: 24px;">${code}</b></p>
                <p>Acesse o link para <a href="${process.env.NEXT_PUBLIC_SITE_URL}/redefinir-senha">REDEFINIR SENHA</a>.</p>
                <p>Se você não solicitou esta redefinição, por favor ignore este e-mail.</p>
                <p>Atenciosamente,</p>
                <p>${process.env.NEXT_PUBLIC_SITE_NAME}</p>`,
  };

  try {
    const htmlMessage = GeneralMessage({ form });
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/sendmail`, {
      method: 'POST',
      body: JSON.stringify({
        to: form.to,
        from: form.from,
        subject: form.subject,
        message: htmlMessage,
        internal: true, // Indica que é uma chamada interna, não requer autenticação
      }),
    });

    const { data, success, error } = await res.json();

    if (!success) {
      return ApiResponse.internalServerError('Erro ao enviar o e-mail.', {
        details: error.message || data || 'Erro desconhecido',
      });
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
