'use client';

import Link from 'next/link';
import { use, useState } from 'react';

import { featMap } from '@/app/admin/components/sidebar';
import { SidebarHeader } from '@/app/admin/components/sidebar-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Course } from '@prisma/client';
import { toast } from 'sonner';
import CoursesForm from '../../components/form';

// Função para atualizar o curso
const updateCourse = async (id: number, formData: FormData) => {
  const response = await fetch(`/api/courses/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: formData.get('title'),
      slug: formData.get('slug'),
      workload: formData.get('workload') ? Number(formData.get('workload')) : null,
      content: formData.get('content'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      image: formData.get('image'),
    }),
  });

  const { data, success, error } = await response.json();
  return { data, success, error };
};

export default function AdminCoursesEditPage({ params }: { params: Promise<{ id: number }> }) {
  const Feature = featMap.courses;
  const { id } = use(params);
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);

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

    formData.append('userId', user ? String(user.id) : '');

    updateCourse(id, formData)
      .then(({ success, error }) => {
        if (success) {
          toast.success('Curso atualizado com sucesso!');
          setRefresh(new Date());
        } else {
          toast.error(error.message || 'Erro ao atualizar o curso');
        }
      })
      .catch((error) => {
        toast.error(error.message || 'Erro ao atualizar o curso');
      });
  };

  return (
    <>
      <SidebarHeader breadcrumbs={breadcrumbs} />
      <div className="relative grid grid-cols-1 gap-4 p-8">
        {!course && (
          <div className="bg-background/80 absolute inset-0 z-10 flex h-screen items-center justify-center p-20">
            Carregando...
          </div>
        )}
        <div className="col-span-1">
          <div className="flex justify-between">
            <h1 className="mb-4 text-2xl font-bold">
              <small className="text-sm">Editar Curso</small>
              <br />
              <Feature.icon className="mr-2 inline-block" /> {course?.title ?? Feature.name}
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
            <CardContent>
              <CoursesForm id={id} formData={formData} refresh={refresh} courseData={setCourse} />
            </CardContent>
            <CardFooter className="mt-6 flex justify-end gap-2">
              <Link href={`/admin/cursos/${id}`} className="ml-2">
                <Button variant="outline">Voltar</Button>
              </Link>
              <Button variant="secondary">Salvar</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  );
}
