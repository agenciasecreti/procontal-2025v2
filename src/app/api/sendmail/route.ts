import ApiResponse from '@/lib/api-response';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  const body = await request.json();

  const { to, from, subject, message } = body;
  if (!to || !from || !subject || !message) {
    return ApiResponse.validationError(
      'Campos obrigatórios faltando. Por favor, verifique se todos os campos obrigatórios estão preenchidos.'
    );
  }

  // Configura seu transporte SMTP (Mailtrap)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER, // coloque no .env
      pass: process.env.SMTP_PASSWORD, // coloque no .env
    },
  });

  try {
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      replyTo: from,
      to,
      subject,
      text: message.replace(/<[^>]+>/g, ''), //converte para texto simples
      html: message,
    });
    return ApiResponse.success({ message: 'E-mail enviado com sucesso.' });
  } catch (error) {
    return ApiResponse.internalServerError('Erro ao enviar email', {
      details: error instanceof Error ? error.message : error,
    });
  }
}
