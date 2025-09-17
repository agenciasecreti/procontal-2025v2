import ApiResponse from '@/lib/api-response';
import { NextRequest } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  const { to, from, subject, message, internal } = await req.json();

  // Verifica a autenticação apenas se não for uma chamada interna
  // if (!internal) {
  //   const authResult = await verifyAuth(req);
  //   if (authResult instanceof NextResponse) return authResult;
  // }
  console.log(to, from, subject, message, internal);

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
