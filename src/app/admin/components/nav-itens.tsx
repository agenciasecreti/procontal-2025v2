'use client';

import { featMap } from '@/app/admin/components/sidebar';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

const NavItens = () => {
  const features = (process.env.NEXT_PUBLIC_ADMIN_FEATURES || '').split(',');

  return (
    <>
      {features.includes('posts') && (
        <Link href={featMap.posts.url}>
          <Card className="col-span-1 py-10">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-3 text-3xl">
                <featMap.posts.icon className="inline-block" size={24} />
                Posts
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>
      )}
      {features.includes('courses') && (
        <Link href={featMap.courses.url}>
          <Card className="col-span-1 py-10">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-3 text-3xl">
                <featMap.courses.icon className="inline-block" size={24} />
                Cursos
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>
      )}
      {features.includes('teachers') && (
        <Link href={featMap.teachers.url}>
          <Card className="col-span-1 py-10">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-3 text-3xl">
                <featMap.teachers.icon className="inline-block" size={24} />
                Professores
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>
      )}
      {features.includes('banners') && (
        <Link href={featMap.banners.url}>
          <Card className="col-span-1 py-10">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-3 text-3xl">
                <featMap.banners.icon className="inline-block" size={24} />
                Banners
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>
      )}
      {features.includes('creators') && (
        <Link href={featMap.creators.url}>
          <Card className="col-span-1 py-10">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-3 text-3xl">
                <featMap.creators.icon className="inline-block" size={24} />
                Criadores
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>
      )}
      {features.includes('horses') && (
        <Link href={featMap.horses.url}>
          <Card className="col-span-1 py-10">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-3 text-3xl">
                <featMap.horses.icon className="inline-block" size={24} />
                Cavalos
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>
      )}
      {features.includes('users') && (
        <Link href={featMap.users.url}>
          <Card className="col-span-1 py-10">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-3 text-3xl">
                <featMap.users.icon className="inline-block" size={24} />
                Usuários
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>
      )}
      {features.includes('config') && (
        <Link href={featMap.config.url}>
          <Card className="col-span-1 py-10 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-3 text-3xl">
                <featMap.config.icon className="inline-block" size={24} />
                Configurações
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>
      )}
    </>
  );
};

export default NavItens;
