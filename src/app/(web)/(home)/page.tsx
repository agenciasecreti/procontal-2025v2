import Footer from '@/components/web/footer';
import { generateSEOMetadata } from '@/lib/seo';
import { Metadata } from 'next';
import Companies from './components/companies';
import Contact from './components/contact';
import Courses from './components/courses';
import Hero from './components/hero';
import Structure from './components/structure';
import Teachers from './components/teachers';
import Why from './components/why';

// Metadata Padrão
export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    type: 'website',
  });
}

// Página Principal
export default function Page() {
  return (
    <div id="home">
      <Hero />
      <Courses />
      <Why />
      <Teachers />
      <Structure />
      <Companies />
      <Contact />
      <Footer />
    </div>
  );
}
