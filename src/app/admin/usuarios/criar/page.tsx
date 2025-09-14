'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { featMap } from '@/app/admin/components/sidebar';
import { SidebarHeader } from '@/app/admin/components/sidebar-header';
import UsersForm from '@/app/admin/usuarios/components/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { randomPassword } from '@/lib/utils';
import { AuthUserType } from '@/types/auth';
import { toast } from 'sonner';

// Função para criar um novo user
const createUser = async (user: AuthUserType | null, formData: FormData) => {
  // Validações
  if (!formData.get('name')) {
    throw new Error('O nome é obrigatório');
  }

  if (!formData.get('email')) {
    throw new Error('O email é obrigatório');
  }

  //Caso não tenha passado password e nem confirmPassword
  if (!formData.get('password') && !formData.get('confirmPassword')) {
    const randPwd = randomPassword(20);
    console.log('Senha gerada:', randPwd);
    formData.set('password', randPwd);
    formData.set('confirmPassword', randPwd);
  }

  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: formData.get('name'),
      email: formData.get('email'),
      cpf: formData.get('cpf'),
      birth_date: formData.get('birth_date'),
      phone: formData.get('phone'),
      whatsapp: formData.get('whatsapp'),
      avatar: formData.get('avatar'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    }),
  });

  const { data, success, error } = await response.json();
  if (!success) throw new Error(error.message || 'Erro ao criar usuário.');
  return data;
};

// Página para criar novos usuários
export default function AdminUsersNewPage() {
  const Feature = featMap.users;
  const router = useRouter();
  const { user } = useAuth();

  const breadcrumbs = [
    { name: 'Admin', href: '/admin' },
    { name: '...' },
    { name: Feature.name, href: Feature.url },
    { name: 'Criar', active: true },
  ];

  const formData = new FormData();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    createUser(user, formData)
      .then((data) => {
        // console.log('User criado com sucesso:', data);
        toast.success('User criado com sucesso!');
        router.push(`${Feature.url}/${data.id}/editar`);
      })
      .catch((error) => {
        // console.error('Erro ao criar o user:', error);
        toast.error(error.message || 'Erro ao criar o user');
      });
  };

  return (
    <>
      <SidebarHeader breadcrumbs={breadcrumbs} />
      <div className="grid grid-cols-1 gap-4 p-8">
        <div className="col-span-1">
          <div className="flex justify-between">
            <h1 className="mb-4 text-2xl font-bold">
              <small className="text-sm">Criar Usuário</small>
              <br />
              <Feature.icon className="mr-2 inline-block" /> {Feature.name}
            </h1>
            <Link href="/admin/usuarios">
              <Button variant="outline">Voltar</Button>
            </Link>
          </div>
        </div>
        <Card className="@container/card">
          <form onSubmit={(e) => handleSubmit(e)}>
            <CardContent>
              <UsersForm formData={formData} refresh={new Date()} />
            </CardContent>
            <CardFooter className="mt-6 flex justify-end gap-2">
              <Button variant="secondary">Criar</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  );
}
