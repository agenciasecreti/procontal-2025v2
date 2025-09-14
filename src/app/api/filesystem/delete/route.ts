import ApiResponse from '@/lib/api-response';
import { verifyAuth } from '@/lib/auth';

import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';

const s3 = new S3Client({
  region: process.env.S3_REGION!,
  endpoint: `https://${process.env.S3_REGION}.digitaloceanspaces.com`,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

/**
 * Rota para gerenciar uploads de arquivos.
 * Permite listar todos os arquivos e criar um novo upload.
 * @param req
 * @returns NextResponse com a lista de arquivos ou o arquivo criado.
 */

// @route DELETE /api/filesystem
// Remove um arquivo através da sua chave (key).
export async function DELETE(req: NextRequest) {
  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  let res;
  try {
    res = await req.json();
  } catch (error) {
    return ApiResponse.validationError('Erro ao ler os dados da requisição.', {
      details: error instanceof Error ? error.message : error,
    });
  }
  const { key } = res;

  if (!key) {
    return ApiResponse.validationError('Chave do arquivo não fornecida.');
  }

  //verifica se o arquivo existe
  const commandFind = new ListObjectsV2Command({
    Bucket: process.env.S3_BUCKET_NAME!,
    Prefix: key,
  });

  const findResult = await s3.send(commandFind);
  console.log('findResult', findResult);
  if (!findResult.Contents || findResult.Contents.length === 0) {
    return ApiResponse.badRequest('Arquivo não encontrado.', {
      details: 'Por favor, verifique se a chave do arquivo está correta.',
    });
  }

  try {
    // Use DeleteObjectCommand para remover arquivos
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
    });

    await s3.send(command);

    return ApiResponse.success({ message: 'Arquivo removido com sucesso.' });
  } catch (error) {
    return ApiResponse.internalServerError('Erro ao remover arquivo.', {
      details: error instanceof Error ? error.message : error,
    });
  }
}
