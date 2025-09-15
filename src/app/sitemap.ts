import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://procontaltreinamentos.com.br';
  const currentDate = new Date().toISOString();

  // URLs estáticas principais
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/sobre`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/area-do-aluno`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.6,
    },
  ];

  try {
    // Buscar posts dinâmicos
    // const posts = await fetchPosts();
    // const postRoutes: MetadataRoute.Sitemap = posts.map((post: { slug: string; updatedAt: string }) => ({
    //     url: `${baseUrl}/posts/${post.slug}`,
    //     lastModified: post.updatedAt || currentDate,
    //     changeFrequency: 'monthly' as const,
    //     priority: 0.7,
    // }));

    // Buscar cursos dinâmicos
    // const courses = await fetchCourses();
    // const courseRoutes: MetadataRoute.Sitemap = courses.map((course: { slug: string; updatedAt: string }) => ({
    //     url: `${baseUrl}/cursos/${course.slug}`,
    //     lastModified: course.updatedAt || currentDate,
    //     changeFrequency: 'weekly' as const,
    //     priority: 0.8,
    // }));

    // Combinar todas as rotas
    return [...staticRoutes];
    // return [...staticRoutes, ...postRoutes, ...courseRoutes];
  } catch (error) {
    console.error('Erro ao gerar sitemap:', error);
    // Em caso de erro, retornar apenas rotas estáticas
    return staticRoutes;
  }
}
