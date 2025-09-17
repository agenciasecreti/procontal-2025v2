import ApiResponse from '@/lib/api-response';
import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { NextRequest } from 'next/server';

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

// @route GET /api/filesystem
// Retorna a lista de arquivos em uma determinada pasta.
export async function GET(req: NextRequest) {
  // Rota protegida pelo middleware CORS - permite acesso apenas do próprio app

  // Obtém o nome da pasta a partir dos parâmetros de busca (?folder=...)
  const folder = req.nextUrl.searchParams.get('folder') || '';
  const recursive = req.nextUrl.searchParams.get('recursive') === 'true';

  const prefix = folder ? (folder.endsWith('/') ? folder : folder + '/') : '';
  const command = new ListObjectsV2Command({
    Bucket: process.env.S3_BUCKET_NAME!,
    Prefix: prefix,
    Delimiter: recursive ? undefined : '/', // Se recursive for true, não define Delimiter (busca recursiva)
  });

  try {
    const response = await s3.send(command);
    const files =
      response.Contents?.map((item) => {
        const isFolder = item.Key && item.Key.split('.').pop()?.includes('/');
        return {
          url: item.Key
            ? `https://${process.env.S3_BUCKET_NAME}.${process.env.S3_REGION}.cdn.digitaloceanspaces.com/${item.Key}`
            : null,
          key: item.Key,
          lastModified: item.LastModified,
          size: item.Size,
          type: isFolder ? 'folder' : item.Key?.split('.').pop(),
          name: isFolder ? item.Key?.split('/').slice(-2, -1)[0] : item.Key?.split('/').pop(),
        };
      }) || [];

    // Também pode listar subpastas diretas, se desejar:
    // const folders = response.CommonPrefixes?.map((item) => item.Prefix) || []

    return ApiResponse.success({ files });
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    return ApiResponse.internalServerError('Erro ao listar arquivos.', {
      details: error instanceof Error ? error.message : error,
    });
  }
}
