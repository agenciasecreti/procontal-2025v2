'use client';

import * as React from 'react';

import { NavUser } from '@/app/admin/components/nav-user';
import { IconPosts } from '@/app/admin/posts/components/utils';
import { NavAdmin } from '@/app/admin/components/nav-admin';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { horseHead } from '@lucide/lab';
import {
  Cog,
  Icon,
  Images,
  Plus,
  Presentation,
  ShieldUserIcon,
  UserPen,
  Users,
} from 'lucide-react';
import Link from 'next/link';

const featAdmin = (process.env.NEXT_PUBLIC_ADMIN_FEATURES || '').split(',').map((f) => f.trim());

export const featMap = {
  posts: {
    name: 'Posts',
    icon: IconPosts,
    url: '/admin/posts',
  },
  courses: {
    name: 'Cursos',
    icon: Presentation,
    url: '/admin/cursos',
  },
  teachers: {
    name: 'Professores',
    icon: UserPen,
    url: '/admin/professores',
  },
  banners: {
    name: 'Banners',
    icon: Images,
    url: '/admin/banners',
  },
  users: {
    name: 'Usuários',
    icon: Users,
    url: '/admin/usuarios',
  },
  creators: {
    name: 'Criadores',
    icon: ShieldUserIcon,
    url: '/admin/criadores',
  },
  horses: {
    name: 'Cavalos',
    icon: (props: { className?: string; size?: number }) => (
      <Icon iconNode={horseHead} {...props} />
    ),
    url: '/admin/cavalos',
  },
  config: {
    name: 'Configurações',
    icon: Cog,
    url: '/admin/config',
  },
} as const;

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const itemsTypes = [];

  if (featAdmin.includes('posts')) {
    itemsTypes.push({
      name: featMap.posts.name,
      url: featMap.posts.url,
      icon: featMap.posts.icon,
      childrens: [
        {
          name: 'Criar',
          url: `${featMap.posts.url}/criar`,
          icon: Plus,
        },
      ],
    });
  }

  if (featAdmin.includes('courses')) {
    itemsTypes.push({
      name: featMap.courses.name,
      url: featMap.courses.url,
      icon: featMap.courses.icon,
      childrens: [
        {
          name: 'Criar',
          url: `${featMap.courses.url}/criar`,
          icon: Plus,
        },
      ],
    });
  }
  if (featAdmin.includes('teachers')) {
    itemsTypes.push({
      name: featMap.teachers.name,
      url: featMap.teachers.url,
      icon: featMap.teachers.icon,
      childrens: [
        {
          name: 'Criar',
          url: `${featMap.teachers.url}/criar`,
          icon: Plus,
        },
      ],
    });
  }
  if (featAdmin.includes('banners')) {
    itemsTypes.push({
      name: featMap.banners.name,
      url: featMap.banners.url,
      icon: featMap.banners.icon,
      childrens: [
        {
          name: 'Criar',
          url: `${featMap.banners.url}/criar`,
          icon: Plus,
        },
      ],
    });
  }
  if (featAdmin.includes('creators')) {
    itemsTypes.push({
      name: featMap.creators.name,
      url: featMap.creators.url,
      icon: featMap.creators.icon,
      childrens: [
        {
          name: 'Criar',
          url: `${featMap.creators.url}/criar`,
          icon: Plus,
        },
      ],
    });
  }
  if (featAdmin.includes('horses')) {
    itemsTypes.push({
      name: featMap.horses.name,
      url: featMap.horses.url,
      icon: featMap.horses.icon,
      childrens: [
        {
          name: 'Criar',
          url: `${featMap.horses.url}/criar`,
          icon: Plus,
        },
      ],
    });
  }

  const itemsConfig = [];

  if (featAdmin.includes('users')) {
    itemsConfig.push({
      name: featMap.users.name,
      url: featMap.users.url,
      icon: featMap.users.icon,
      childrens: [
        {
          name: 'Criar',
          url: `${featMap.users.url}/criar`,
          icon: Plus,
        },
      ],
    });
  }

  if (featAdmin.includes('config')) {
    itemsConfig.push({
      name: featMap.config.name,
      url: featMap.config.url,
      icon: featMap.config.icon,
    });
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link href="/">
                <span className="text-base font-semibold text-balance">
                  {process.env.NEXT_PUBLIC_SITE_SHORTNAME}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavAdmin title="Administração" items={itemsTypes} />
        <NavAdmin title="Configurações" items={itemsConfig} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
