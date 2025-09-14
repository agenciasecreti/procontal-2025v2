'use client';

import { featMap } from '@/app/admin/components/sidebar';
import { SidebarHeader } from '@/app/admin/components/sidebar-header';
import UsersForm from '@/app/admin/usuarios/components/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { User } from '@prisma/client';
import Link from 'next/link';
import { use, useState } from 'react';
import { toast } from 'sonner';

type BodyType = {
  name: string | null;
  email: string | null;
  cpf: string | null;
  birth_date: string | null;
  phone: string | null;
  whatsapp: string | null;
  avatar?: string | null;
  role_id: number | null;
  password?: string | null;
  confirmPassword?: string | null;
};

// Função para atualizar o usuário
const updateUser = async (id: number, formData: FormData) => {
  let body: BodyType = {
    name: formData.get('name') as string | null,
    email: formData.get('email') as string | null,
    cpf: formData.get('cpf') as string | null,
    birth_date: formData.get('birth_date') as string | null,
    phone: formData.get('phone') as string | null,
    whatsapp: formData.get('whatsapp') as string | null,
    role_id: Number(formData.get('role_id')) || null,
  };

  if (formData.get('password'))
    body = {
      ...body,
      password: formData.get('password')?.toString() ?? null,
      confirmPassword: formData.get('confirmPassword')?.toString() ?? null,
    };

  if (formData.get('avatar')) {
    body = { ...body, avatar: formData.get('avatar')?.toString() ?? null };
  }

  const response = await fetch(`/api/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok)
    throw new Error((await response.json()).error.message || 'Erro ao atualizar o usuário.');

  return await response.json();
};

export default function EditPage({ params }: { params: Promise<{ id: number }> }) {
  const Feature = featMap.users;
  const { id } = use(params);
  const [user, setUser] = useState<User | null>(null);

  const breadcrumbs = [
    { name: 'Admin', href: '/admin' },
    { name: '...' },
    { name: Feature.name, href: Feature.url },
    { name: 'Editar', active: true },
  ];

  const formData = new FormData();
  const [refresh, setRefresh] = useState(new Date());

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    updateUser(id, formData)
      .then(() => {
        toast.success('Usuário atualizado com sucesso!');
        setRefresh(new Date());
      })
      .catch((error) => {
        console.error('Erro ao atualizar o usuário:', error);
        toast.error(error.message || 'Erro ao atualizar o usuário');
      });
  };

  return (
    <>
      <SidebarHeader breadcrumbs={breadcrumbs} />
      <div className="grid grid-cols-1 gap-4 p-8">
        <div className="col-span-1">
          <div className="flex justify-between">
            <h1 className="mb-4 text-2xl font-bold">
              <small className="text-sm">Editar Usuário</small>
              <br />
              <Feature.icon className="mr-2 inline-block" /> {user?.name ?? Feature.name}
            </h1>
            <div className="flex flex-col gap-2 lg:flex-row">
              <Link href={`${Feature.url}/${id}`}>
                <Button variant="outline">Voltar</Button>
              </Link>
            </div>
          </div>
        </div>
        <Card className="@container/card">
          <form onSubmit={(e) => handleSubmit(e)}>
            <CardContent className="flex flex-col items-center gap-10 lg:flex-row">
              <UsersForm id={id} formData={formData} refresh={refresh} userData={setUser} />
            </CardContent>
            <CardFooter className="mt-6 flex justify-end gap-2">
              <Link href={`/admin/usuarios/${id}`} className="ml-2">
                <Button variant="outline">Fechar</Button>
              </Link>
              <Button variant="secondary">Salvar</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  );
}
