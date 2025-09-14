import Footer from '@/components/web/footer';
import Header from '@/components/web/header';
import { Separator } from '@/components/ui/separator';
import { generateSEOMetadata } from '@/lib/seo';
import { Metadata } from 'next';
import Image from 'next/image';

// Função para buscar dados diretamente da API externa (sem proxy)
const fetchPost = async ({ id }: { id: number | string }) => {
  try {
    const res = await fetch(`${process.env.API_URL}/posts/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.API_KEY!,
      },
    });

    if (!res.ok) {
      return null; // Retorna null se a requisição falhar
    }

    return res.json();
  } catch (error) {
    console.error(error);
    return null; // Retorna null em caso de erro
  }
};

// Metadata dinâmica baseada nos dados da API
export async function generateMetadata(): Promise<Metadata> {
  const post = await fetchPost({ id: 'quem-somos' });
  return generateSEOMetadata({
    title: post?.id ? post.title : undefined,
    description: post?.id ? post.lead : undefined,
    type: 'article',
  });
}

export default async function Page() {
  const post = await fetchPost({ id: 'quem-somos' });

  return (
    <div className="bg-tertiary/10 bg-1 flex min-h-full w-full flex-col justify-between">
      <div>
        <Header bar={true} />
        <div className="w-full px-10 py-40">
          {post && post.id ? (
            <div className="mx-auto max-w-full lg:max-w-7xl">
              <h1 className="text-secondary text-3xl font-bold">{post.title}</h1>
              <p className="text-md text-foreground/50 italic">{post.lead}</p>
              <Separator className="my-4" />
              <article
                className="space-y-7 px-5 py-4 text-justify text-lg lg:px-10"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
              <Separator className="my-10" />
              <div className="flex items-center gap-4">
                <Image
                  src="/icon-1.webp"
                  alt="Logo Procontal Treinamentos"
                  width={80}
                  height={80}
                />
                <p className="font-bold">
                  Obrigado por escolher a <br />
                  <span className="text-secondary text-2xl font-bold">Procontal Treinamentos</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-full lg:max-w-7xl">
              <h1 className="text-secondary text-3xl font-bold">Página não encontrada</h1>
              <p className="text-md text-foreground/50">
                Desculpe, não foi possível carregar o conteúdo desta página.
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
