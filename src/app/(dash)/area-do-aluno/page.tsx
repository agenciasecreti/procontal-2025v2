import Footer from '@/components/web/footer';
import Header from '@/components/web/header';
import { generateSEOMetadata } from '@/lib/seo';
import { Metadata } from 'next';
import { HomeAreaAluno } from './components/home';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: `Área do Aluno`,
    description: `Acesse sua Área do Aluno na ${process.env.NEXT_PUBLIC_SITE_TITLE} para gerenciar seus cursos e informações.`,
    type: 'website',
  });
}

export default function Page() {
  return (
    <div className="bg-tertiary/10 bg-1 flex min-h-full w-full flex-col justify-between">
      <div>
        <Header bar={true} />
        <div className="w-full px-10 py-30 lg:py-40">
          <div className="mx-auto max-w-full lg:max-w-6xl">
            <HomeAreaAluno />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
