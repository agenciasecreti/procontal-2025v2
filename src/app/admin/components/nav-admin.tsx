'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { CircleChevronRight, SquarePen } from 'lucide-react';
import Link from 'next/link';

export function NavAdmin({
  title,
  items,
}: {
  title: string;
  items: {
    name: string;
    url: string;
    icon: React.ElementType | undefined;
    childrens?: { name: string; url: string; icon: React.ElementType | undefined }[];
  }[];
}) {
  const { isMobile } = useSidebar();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((Feature) => (
          <SidebarMenuItem key={Feature.name}>
            <SidebarMenuButton asChild>
              <Link href={Feature.url}>
                {Feature.icon ? <Feature.icon /> : <SquarePen className="h-4 w-4" />}
                <span>{Feature.name}</span>
              </Link>
            </SidebarMenuButton>
            {Feature.childrens && Feature.childrens.length > 0 && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuAction
                      showOnHover
                      className="data-[state=open]:bg-accent rounded-sm"
                    >
                      <CircleChevronRight className="h-4 w-4" />
                      <span className="sr-only">Mais</span>
                    </SidebarMenuAction>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-24 rounded-lg"
                    side={isMobile ? 'bottom' : 'right'}
                    align={isMobile ? 'end' : 'start'}
                  >
                    {Feature.childrens.map((child) => (
                      <DropdownMenuItem key={child.name} asChild>
                        <Link href={child.url}>
                          {child.icon ? <child.icon /> : <SquarePen className="h-4 w-4" />}
                          <span>{child.name}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
