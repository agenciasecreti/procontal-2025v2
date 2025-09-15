import { env } from 'process';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: env.NEXT_PUBLIC_CDN_URL?.replace(/https?:\/\//, ''),
        port: '',
        pathname: '/**',
      },
    ],
    // Configurações de cache para otimização
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Qualidades de imagem suportadas
    qualities: [50, 75, 85, 90, 95, 100],
  },
  async headers() {
    return [
      {
        // Aplica headers CORS para todas as rotas da API
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS' },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-API-Key',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
