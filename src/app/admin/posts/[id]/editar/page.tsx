'use client';

import Link from 'next/link';
import { use, useState } from 'react';

import { featMap } from '@/app/admin/components/sidebar';
import { SidebarHeader } from '@/app/admin/components/sidebar-header';
import PostsForm from '@/app/admin/posts/components/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { PostTypesMap } from '@/types/post';
import { Post } from '@prisma/client';
import { toast } from 'sonner';

// Função para atualizar o post
const updatePost = async (id: number, formData: FormData) => {
  const response = await fetch(`/api/posts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: formData.get('title'),
      slug: formData.get('slug'),
      type: formData.get('type'),
      content: formData.get('content'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      image: formData.get('image'),
      highlight: formData.get('highlight') === 'true',
      userId: formData.get('userId') ? Number(formData.get('userId')) : null,
    }),
  });

  const { data, success, error } = await response.json();
  if (!success) throw new Error(error.message || 'Erro ao atualizar o post');
  return { data, success };
};

export default function AdminPostsEditPage({ params }: { params: Promise<{ id: number }> }) {
  const Feature = featMap.posts;
  const { id } = use(params);
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);

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

    updatePost(id, formData)
      .then(({ success }) => {
        if (success) {
          toast.success('Post atualizado com sucesso!');
          setRefresh(new Date());
        }
      })
      .catch((error) => {
        toast.error(error.message || 'Erro ao atualizar o post');
      });
  };

  // Função para receber o valor do type do componente filho
  const [type, setType] = useState('');
  const handleTypeChange = (newType: string) => {
    setType(newType);
  };

  return (
    <>
      <SidebarHeader breadcrumbs={breadcrumbs} />
      {!post && (
        <div className="bg-background/80 absolute inset-0 z-10 flex h-screen items-center justify-center p-20">
          Carregando...
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 p-8">
        <div className="col-span-1">
          <div className="flex justify-between">
            <h1 className="mb-4 text-2xl font-bold">
              <small className="text-sm">Editar {type && PostTypesMap[type].name}</small>
              <br />
              <Feature.icon className="mr-2 inline-block" /> {post?.title ?? Feature.name}
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
              <PostsForm
                id={id}
                formData={formData}
                refresh={refresh}
                handleType={handleTypeChange}
                postData={setPost}
              />
            </CardContent>
            <CardFooter className="mt-6 flex justify-end gap-2">
              <Link href={`${Feature.url}/${id}`} className="ml-2">
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
