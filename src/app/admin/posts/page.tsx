'use client';

import { featMap } from '@/app/admin/components/sidebar';
import { SidebarHeader } from '@/app/admin/components/sidebar-header';
import { columns } from '@/app/admin/posts/components/utils';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PostData } from '@/types/post';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

type FetchParams = {
  page: number;
  search?: string;
  limit?: number;
  active?: boolean;
};

// Função para buscar posts com base na página e na pesquisa
const fetchPosts = async ({ page, search = '', limit = 10, active }: FetchParams) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    search: search,
  });

  if (typeof active === 'boolean') {
    params.append('active', String(active));
  }

  const response = await fetch(`/api/posts/search?${params.toString()}`);
  const { data, pagination, success, error } = await response.json();
  if (!success) throw new Error(error.message || 'Erro ao buscar posts');
  return { data, pagination };
};

export default function AdminPostsPage() {
  const Feature = featMap.posts;
  const [posts, setPosts] = useState<PostData[]>([]);
  const [search, setSearch] = useState<string>('');
  const [pagination, setPagination] = useState({
    loading: false,
    total: 0,
    limit: 10,
    pages: 0,
    page: 1,
  });

  const breadcrumbs = [
    { name: 'Admin', href: '/admin' },
    { name: Feature.name, active: true },
  ];

  // Função para carregar posts
  const loadPosts = useCallback(() => {
    setPagination((prev) => ({ ...prev, loading: true }));
    fetchPosts({ page: pagination.page, search, limit: pagination.limit })
      .then(({ data, pagination }) => {
        setPosts(data);
        setPagination((prev) => ({ ...prev, ...pagination, loading: false }));
      })
      .catch((error) => {
        console.error('Erro ao buscar posts:', error);
      })
      .finally(() => {
        setPagination((prev) => ({ ...prev, loading: false }));
      });
  }, [pagination.page, pagination.limit, search]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  return (
    <>
      <SidebarHeader breadcrumbs={breadcrumbs} />
      <div className="grid grid-cols-3 gap-4 p-8">
        <div className="col-span-3">
          <div className="flex justify-between">
            <h1 className="mb-4 text-2xl font-bold">
              <Feature.icon className="mr-2 inline-block" /> {Feature.name}
            </h1>
          </div>
        </div>
        <Card className="@container/card col-span-3">
          <CardHeader>
            <CardTitle>Lista de Posts</CardTitle>
            <CardDescription>Lista de todos os posts.</CardDescription>
            <CardAction>
              <Link href={`${Feature.url}/criar`}>
                <Button variant="secondary">Criar</Button>
              </Link>
            </CardAction>
          </CardHeader>
        </Card>
        <div className="col-span-3">
          <DataTable
            data={posts}
            columns={columns(() => {
              loadPosts();
            })}
            pagination={pagination}
            switchPage={(page) => {
              setPagination((prev) => ({ ...prev, page: page }));
            }}
            switchLimit={(value) => {
              setPagination((prev) => ({ ...prev, page: 1 }));
              setPagination((prev) => ({ ...prev, limit: value }));
            }}
            makeSearch={(value) => {
              setSearch(value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
          />
        </div>
      </div>
    </>
  );
}
