'use client';

import { featMap } from '@/app/admin/components/sidebar';
import { SidebarHeader } from '@/app/admin/components/sidebar-header';
import { RolesNames } from '@/app/admin/usuarios/components/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatCpf, formatDateTime, formatPhone } from '@/lib/utils';
import { User } from '@prisma/client';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';

type UserDetails = User & {
  role: {
    name: string;
    display_name: string;
  };
};

const fetchUser = async (id: number) => {
  const response = await fetch(`/api/users/${id}?join=role`);
  const { data, success, error } = await response.json();
  if (!success) throw new Error(error.message || 'Erro ao buscar usuário');
  data.role.display_name = RolesNames[data.role.name].name || data.role.name;
  return data as UserDetails;
};

export default function ShowPage({ params }: { params: Promise<{ id: number }> }) {
  const Feature = featMap.users;
  const { id } = use(params);
  const [user, setUser] = useState<UserDetails | null>(null);

  useEffect(() => {
    fetchUser(id).then(setUser).catch(console.error);
  }, [id]);

  const breadcrumbs = [
    { name: 'Admin', href: '/admin' },
    { name: Feature.name, href: Feature.url },
    { name: user?.name || 'Carregando...', active: true },
  ];

  return (
    <>
      <SidebarHeader breadcrumbs={breadcrumbs} />
      {!user ? (
        <div className="bg-background/80 absolute inset-0 z-10 flex h-screen items-center justify-center p-20">
          Carregando...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 p-8">
          <div className="col-span-1">
            <div className="flex justify-between">
              <h1 className="mb-4 text-2xl font-bold">
                <small className="text-sm">Detalhes do Usuário</small>
                <br />
                <Feature.icon className="mr-2 inline-block" /> {user.name}
              </h1>
              <div className="flex flex-col gap-2 lg:flex-row">
                <Link href={Feature.url}>
                  <Button variant="outline">Voltar</Button>
                </Link>
                <Link href={`${Feature.url}/${user.id}/editar`}>
                  <Button variant="secondary">Editar</Button>
                </Link>
              </div>
            </div>
          </div>
          <div className="w-full">
            <Card>
              <CardHeader>
                <CardContent className="flex flex-col items-center gap-10 lg:flex-row">
                  <div className="grid w-full grid-cols-1 gap-10 lg:col-span-3 lg:grid-cols-3">
                    <div>
                      <p className="mb-2">
                        <strong>Nome:</strong>
                      </p>
                      <p>{user.name}</p>
                    </div>
                    <div>
                      <p className="mb-2">
                        <strong>E-mail:</strong>
                      </p>
                      <p>{user.email}</p>
                    </div>
                    <div>
                      <p className="mb-2">
                        <strong>CPF:</strong>
                      </p>
                      <p>{user.cpf ? formatCpf(String(user.cpf)) : 'Não informado'}</p>
                    </div>
                    <div>
                      <p className="mb-2">
                        <strong>Telefone:</strong>
                      </p>
                      <p>{user.phone ? formatPhone(String(user.phone)) : 'Não informado'}</p>
                    </div>
                    <div>
                      <p className="mb-2">
                        <strong>Whatsapp:</strong>
                      </p>
                      <p>{user.whatsapp ? formatPhone(String(user.whatsapp)) : 'Não informado'}</p>
                    </div>
                    <div>
                      <p className="mb-2">
                        <strong>Aniversário:</strong>
                      </p>
                      <p>{user.birth_date && formatDateTime(user.birth_date, 'dd/MM/yyyy')}</p>
                    </div>
                  </div>
                  <div className="text-center">
                    {user.avatar ? (
                      <Avatar className="bg-foreground/5 m-auto mb-4 h-60 w-60 rounded-full">
                        <AvatarImage
                          src={`${process.env.NEXT_PUBLIC_CDN_URL}/${user.avatar}`}
                          className="w-full object-cover object-top"
                          alt={user.name}
                        />
                        <AvatarFallback className="text-foreground/20 rounded-lg text-9xl font-bold">
                          {user.name?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <Avatar className="bg-foreground/5 m-auto mb-4 h-60 w-60 rounded-full">
                        <AvatarFallback className="text-foreground/20 rounded-lg text-9xl font-bold">
                          {user.name?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <p className="text-secondary text-lg font-bold">{user.role.display_name}</p>
                  </div>
                </CardContent>
              </CardHeader>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
