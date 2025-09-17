'use client';

import { NavLink } from '@/components/nav-link';
import { motion } from 'framer-motion';

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import ModeToggle from '@/components/web/mode-toggle';
import SidebarMenu from '@/components/web/sidebar-menu';
import { useContactConfig } from '@/contexts/config-context';
import { trackClickWhatsapp } from '@/lib/tracking';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Header({ bar = false }: { bar?: boolean }) {
  const { whatsapp } = useContactConfig();

  //limpa o número de WhatsApp para remover caracteres especiais
  const cleanWhatsapp = whatsapp.replace(/\D/g, '');
  const whatsappUrl = `https://api.whatsapp.com/send/?phone=+55${cleanWhatsapp}&text=Olá! Tenho interesse nos cursos da Procontal Treinamentos`;

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

  // Header visivel de forma fixa após o scroll em 100px
  const [isHeaderVisible, setIsHeaderVisible] = useState(bar ?? false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsHeaderVisible(true);
      } else {
        setIsHeaderVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`${isHeaderVisible || bar ? 'bg-secondary/95 dark:bg-tertiary/95 fixed text-white' : 'relative py-4'} top-0 right-0 left-0 z-50`}
    >
      <div className="mx-auto max-w-md py-3 md:max-w-7xl">
        <div className="flex items-center justify-between gap-5 px-10">
          <div>
            <Link href="/">
              <motion.img
                alt="Procontal Treinamentos"
                src="/logo-3.webp"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
                className="h-auto w-40 min-w-40"
              />
            </Link>
          </div>
          <div className="flex items-center gap-5">
            <NavigationMenu viewport={false} className="hidden lg:block">
              <NavigationMenuList className="flex items-center justify-between gap-5">
                {menu.map((item) => (
                  <NavigationMenuItem key={item.href}>
                    <NavigationMenuLink
                      asChild
                      className={`dark:hover:text-primary focus:bg-tertiary focus:text-tertiary-foreground dark:focus:bg-secondary dark:focus:text-secondary-foreground active:bg-tertiary active:text-tertiary-foreground dark:active:bg-secondary dark:active:text-secondary-foreground hover:text-quaternary cursor-pointer items-start font-bold text-shadow-lg hover:bg-transparent focus:text-shadow-none active:text-shadow-none ${item.highlight ? 'text-tertiary dark:text-secondary' : ''} `}
                    >
                      <NavLink href={item.href}>{item.label}</NavLink>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
            <ModeToggle />
            <SidebarMenu items={menu} />
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.8 }}
              className="bg-tertiary hover:bg-quaternary dark:bg-secondary dark:hover:bg-primary hidden h-10 rounded-lg px-8 font-bold lg:block"
            >
              <NavLink
                href={whatsappUrl}
                onClick={() => trackClickWhatsapp('whatsapp-header', 'Contato via WhatsApp')}
              >
                Adquira Agora
              </NavLink>
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
}
