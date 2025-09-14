'use client';

import { ActiveBtn } from '@/app/admin/components/active-btn';
import { featMap } from '@/app/admin/components/sidebar';
import { SidebarHeader } from '@/app/admin/components/sidebar-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Post } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';

type PostDetail = Post;

const fetchPost = async (id: string) => {
  const response = await fetch(`/api/posts/${id}`);
  const { data, success, error } = await response.json();
  if (!success) throw new Error(error.message || 'Erro ao buscar Post');
  return data;
};

export default function ShowPage({ params }: { params: Promise<{ id: string }> }) {
  const Feature = featMap.posts;
  const { id } = use(params);
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost(id)
      .then(setPost)
      .finally(() => setLoading(false));
  }, [id]);

  const breadcrumbs = [
    { name: 'Admin', href: '/admin' },
    { name: Feature.name, href: Feature.url },
    { name: post?.title || 'Carregando...', active: true },
  ];

  return (
    <>
      <SidebarHeader breadcrumbs={breadcrumbs} />
      {(!post || loading) && (
        <div className="bg-background/80 absolute inset-0 z-10 flex h-screen items-center justify-center p-20">
          Carregando...
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 p-8">
        <div className="col-span-1">
          <div className="flex justify-between">
            <h1 className="mb-4 text-2xl font-bold">
              <small className="text-sm">Detalhes do Post</small>
              <br />
              <Feature.icon className="mr-2 inline-block" /> {post?.title}
            </h1>
            <Link href={`${Feature.url}/${id}/editar`}>
              <Button variant="secondary" size="sm">
                Editar
              </Button>
            </Link>
          </div>
        </div>
        {post && (
          <Tabs defaultValue="details" className="w-full">
            <TabsContent value="details">
              <Card>
                <CardContent className="flex flex-col justify-between gap-4 lg:flex-row lg:gap-10">
                  <div className="grid w-full grid-cols-2 gap-5 lg:grid-cols-4">
                    <div className="col-span-2 lg:col-span-4">
                      <p className="mb-2">
                        <strong>Descrição:</strong>
                      </p>
                      <div
                        className="prose rounded-lg border p-5"
                        dangerouslySetInnerHTML={{
                          __html: post.content || '<p>Sem descrição</p>',
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-5 lg:w-1/4 lg:text-end">
                    <div>
                      {post.image && (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_CDN_URL}/${post.image}`}
                          alt={post.title || 'Imagem do Post'}
                          className="w-full rounded-lg"
                          width={300}
                          height={175}
                        />
                      )}
                    </div>
                    <div>
                      <strong>Ativo:</strong>
                      <p>
                        <span className="inline-flex items-center gap-2">
                          <ActiveBtn
                            id={Number(post.id)}
                            active={post.active}
                            table="posts"
                            onChange={() => {
                              setLoading(true);
                              fetchPost(id)
                                .then(setPost)
                                .finally(() => setLoading(false));
                            }}
                          />
                          {post.active ? 'Sim' : 'Não'}
                        </span>
                      </p>
                    </div>
                    <div>
                      <strong>Destacada:</strong>
                      <p>{post.highlight ? 'Sim' : 'Não'}</p>
                    </div>
                    <div>
                      <strong>Período:</strong>
                      <p className="text-sm text-balance">
                        {post.start_date && new Date(post.start_date).toLocaleDateString()}
                        {post.end_date && ` a  ${new Date(post.end_date).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </>
  );
}
