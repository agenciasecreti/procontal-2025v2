import { ApiResponse } from '@/lib/api-response';
import { verifyAuth } from '@/lib/auth';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

const s3 = new S3Client({
  region: process.env.S3_REGION!,
  endpoint: `https://${process.env.S3_REGION}.digitaloceanspaces.com`,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

// @route POST /api/filesystem/upload
// Envia um arquivo para o DigitalOcean Spaces e retorna a URL do arquivo.
export async function POST(req: NextRequest) {
  // Verifica a autenticação do usuário
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const formData = await req.formData();
  const files = formData.getAll('file') as File[];
  const folder = (formData.get('folder') as string) || '';

  if (!files || files.length === 0) {
    return ApiResponse.validationError('Arquivo(s) não encontrado(s).', {
      details: 'Por favor, verifique se os arquivos estão corretos.',
    });
  }

  const uploadResults = await Promise.all(
    files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      let fileName = file.name;
      let contentType = file.type;
      let fileSize = file.size;

      // Verifica se é imagem PNG, JPG ou BMP e converte para WebP
      const isImage =
        file.type === 'image/png' ||
        file.type === 'image/jpeg' ||
        file.type === 'image/jpg' ||
        file.type === 'image/bmp';

      if (isImage) {
        try {
          // Converte para WebP com compressão de 90%
          const newBuffer = await sharp(buffer).webp({ quality: 90 }).toBuffer();

          // Altera a extensão do arquivo para .webp
          const nameWithoutExtension = fileName.replace(/\.(png|jpg|jpeg|bmp)$/i, '');
          fileName = `${nameWithoutExtension}.webp`;
          contentType = 'image/webp';
          fileSize = newBuffer.length; // Atualiza o tamanho do arquivo convertido
        } catch (error) {
          console.error('Erro ao converter imagem para WebP:', error);
          // Se der erro na conversão, mantém o arquivo original
        }
      }

      const key = folder ? `${folder.replace(/\/$/, '')}/${fileName}` : fileName;

      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ACL: 'public-read',
      });

      await s3.send(command);

      const url = `https://${process.env.S3_BUCKET_NAME}.${process.env.S3_REGION}.cdn.digitaloceanspaces.com/${key}`;

      return {
        url: url,
        key: key,
        lastModified: new Date(),
        size: fileSize, // Usar fileSize atualizado
        type: contentType, // Usar contentType atualizado
        name: key.split('/').pop(),
        originalName: file.name,
        converted: isImage,
      };
    })
  );

  return ApiResponse.success(uploadResults);
}
