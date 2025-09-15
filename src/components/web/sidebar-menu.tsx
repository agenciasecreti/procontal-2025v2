'use client';

import { NavLink } from '@/components/nav-link';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export default function SidebarMenu({
  items = [],
}: {
  items?: { href: string; label: string; highlight: boolean }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button>
            <Menu />
          </button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="bg-primary dark:bg-quaternary text-primary-foreground dark:text-quaternary-foreground w-full border-0"
        >
          <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
          <div className="pt-10">
            <Image
              src="/logo-3.webp"
              alt="Procontal Treinamentos"
              width={160}
              height={40}
              className="mx-auto mb-4"
            />
          </div>
          <Separator className="border-accent/50 my-3" />
          <NavigationMenu viewport={false} className="items-start px-10">
            <NavigationMenuList className="grid h-full grid-cols-1 gap-1">
              {items.map((item) => (
                <NavigationMenuItem key={item.href} className="min-w-20">
                  <NavigationMenuLink
                    asChild
                    className={`dark:hover:text-primary focus:bg-tertiary focus:text-tertiary-foreground dark:focus:bg-secondary dark:focus:text-secondary-foreground active:bg-tertiary active:text-tertiary-foreground dark:active:bg-secondary dark:active:text-secondary-foreground hover:text-quaternary cursor-pointer text-lg font-semibold text-shadow-lg hover:bg-transparent focus:text-shadow-none active:text-shadow-none ${item.highlight ? 'text-tertiary dark:text-secondary' : ''} `}
                  >
                    <NavLink href={item.href} onClick={() => setOpen(false)}>
                      {item.label}
                    </NavLink>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </SheetContent>
      </Sheet>
    </div>
  );
}
