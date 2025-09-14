'use client';

import { featMap } from '@/app/admin/components/sidebar';
import { SidebarHeader } from '@/app/admin/components/sidebar-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import CoursesForm from '../components/form';

// Função para criar um novo curso
const createCourse = async (formData: FormData) => {
  // Validações
  if (!formData.get('title')) {
    throw new Error('O título é obrigatório');
  }

  if (!formData.get('slug')) {
    throw new Error('O slug é obrigatório');
  }

  const response = await fetch('/api/courses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: formData.get('title'),
      slug: formData.get('slug'),
      content: formData.get('content'),
      workload: formData.get('workload'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      image: formData.get('image'),
    }),
  });

  const { data, success, error } = await response.json();
  return { data, success, error };
};
// Página para criar novos cursos
export default function AdminCoursesNewPage() {
  const Feature = featMap.courses;
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

    formData.append('userId', user ? String(user.id) : '');

    createCourse(formData)
      .then(({ data, success, error }) => {
        if (success) {
          toast.success('Curso criado com sucesso!');
          router.push(`${Feature.url}/${data.id}/editar`);
        } else {
          toast.error(error.message || 'Erro ao criar o curso');
        }
      })
      .catch((error) => {
        toast.error(error.message || 'Erro ao criar o curso');
      });
  };

  return (
    <>
      <SidebarHeader breadcrumbs={breadcrumbs} />
      <div className="grid grid-cols-1 gap-4 p-8">
        <div className="col-span-1">
          <div className="flex justify-between">
            <h1 className="mb-4 text-2xl font-bold">
              <small className="text-sm">Criar Curso</small>
              <br />
              <Feature.icon className="mr-2 inline-block" /> {Feature.name}
            </h1>
            <Link href="/admin/cursos">
              <Button variant="outline">Voltar</Button>
            </Link>
          </div>
        </div>
        <Card className="@container/card">
          <form onSubmit={(e) => handleSubmit(e)}>
            <CardContent>
              <CoursesForm formData={formData} refresh={new Date()} />
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
