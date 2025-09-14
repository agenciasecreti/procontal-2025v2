'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Link as ScrollLink } from 'react-scroll';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  target?: string;
  rel?: string;
}

function NavLink({ href, children, className, onClick, target, rel }: NavLinkProps) {
  const pathname = usePathname();

  // Detecta se é um link com hash (#) para âncora
  const isAnchorLink = href.startsWith('/#');

  // Se for link com âncora, extrai a hash (ex: formulario)
  const anchorId = isAnchorLink ? href.split('#')[1] : null;

  // Detecta se estamos na página alvo (antes da hash)
  const targetPath = isAnchorLink ? href.split('#')[0] || '/' : href;
  const estaNaPagina = pathname === targetPath;

  if (isAnchorLink && anchorId && estaNaPagina) {
    // Já estamos na página → usar react-scroll
    return (
      <ScrollLink
        to={anchorId}
        smooth={true}
        duration={500}
        offset={-50}
        className={className}
        onClick={
          onClick ||
          (() => {
            // Se for um link de âncora, rola suavemente para o elemento
            const element = document.getElementById(anchorId);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          })
        }
      >
        {children}
      </ScrollLink>
    );
  } else {
    // Link normal → usa next/link
    return (
      <Link href={href} className={className} onClick={onClick} target={target} rel={rel}>
        {children}
      </Link>
    );
  }
}

export { NavLink };
