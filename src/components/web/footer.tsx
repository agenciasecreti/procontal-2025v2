'use client';

import { NavLink } from '@/components/nav-link';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { Separator } from '@/components/ui/separator';
import { useContactConfig, useSiteConfig } from '@/contexts/config-context';
import { trackClickButton } from '@/lib/tracking';
import { SiWhatsapp } from '@icons-pack/react-simple-icons';
import { Phone } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  const { whatsapp, phone, address } = useContactConfig();
  const { title } = useSiteConfig();

  const menu = [
    { href: '/#inicio', label: 'Início', highlight: false },
    { href: '/sobre', label: 'Sobre', highlight: false },
    { href: '/#cursos', label: 'Cursos', highlight: false },
    { href: '/#professores', label: 'Professores', highlight: false },
    { href: '/#estrutura', label: 'Estrutura', highlight: false },
    { href: '/#empresas', label: 'Empresas', highlight: false },
    { href: '/#contato', label: 'Contato', highlight: false },
    { href: '/area-do-aluno', label: 'Área do Aluno', highlight: true },
  ];

  return (
    <footer className="from-primary dark:from-quaternary bg-gradient-to-b to-blue-950 text-white/80">
      <div className="mx-auto max-w-7xl px-10 py-15">
        <div className="grid grid-cols-1 items-center justify-center gap-10 lg:grid-cols-3">
          <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
            <Image
              src="/logo-l.webp"
              alt="Procontal Treinamentos"
              width={160}
              height={40}
              className="h-auto w-50"
              priority={true}
            />
            <p className="text-center text-sm text-balance lg:text-start">
              A Procontal Treinamentos oferece formações presenciais de alta qualidade, focadas no
              desenvolvimento de profissionais, empresas e estudantes das áreas contábil, fiscal,
              pessoal, financeira e de gestão. Nossos cursos são estruturados para preparar você e
              sua equipe para os desafios do mercado, com conteúdo atualizado e aplicado à prática
              do dia a dia.
            </p>
          </div>
          <div className="flex w-full flex-col items-center gap-8 text-center lg:items-center">
            <p className="text-balance">{address}</p>
            <Button className="bg-secondary text-secondary-foreground hover:bg-tertiary/90 dark:bg-tertiary dark:hover:bg-quaternary/90 dark:text-tertiary-foreground transition-colors duration-300">
              <Link
                href="https://maps.app.goo.gl/X3VeHK2hRhy5SS4a8"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClickButton('footer-map', 'Footer')}
              >
                COMO CHEGAR?
              </Link>
            </Button>
            <p className="space-y-3">
              <Phone className="mr-1 inline-block" /> Telefone: {phone}
              <br />
              <SiWhatsapp className="mr-1 inline-block" /> Whatsapp: {whatsapp}
            </p>
          </div>
          <div>
            <h3 className="text-secondary dark:text-tertiary text-center font-bold lg:text-end">
              MENU
            </h3>
            <Separator className="border-secondary dark:border-tertiary mt-2 mb-4 border" />
            <NavigationMenu viewport={false}>
              <NavigationMenuList className="flex flex-wrap items-center justify-center gap-x-5">
                {menu.map((item) => (
                  <NavigationMenuItem key={item.href} className="min-w-20">
                    <NavigationMenuLink
                      asChild
                      className={`dark:hover:text-primary focus:bg-tertiary focus:text-tertiary-foreground dark:focus:bg-secondary dark:focus:text-secondary-foreground active:bg-tertiary active:text-tertiary-foreground dark:active:bg-secondary dark:active:text-secondary-foreground hover:text-quaternary cursor-pointer text-lg font-semibold text-shadow-lg hover:bg-transparent focus:text-shadow-none active:text-shadow-none ${item.highlight ? 'text-tertiary dark:text-secondary' : ''} `}
                    >
                      <NavLink href={item.href}>{item.label}</NavLink>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
      </div>
      <div className="bg-secondary dark:bg-tertiary w-full text-white/50">
        <div className="mx-auto flex max-w-7xl flex-col justify-between px-4 py-4 text-xs lg:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {title}. Todos os direitos reservados.
          </p>
          <p>
            <Link href="/politica-de-privacidade">Política de Privacidade</Link>
            <span className="mx-1">|</span>
            <Link href="/termos-de-uso">Termos de Uso</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
