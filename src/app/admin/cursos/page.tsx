'use client';

import { featMap } from '@/app/admin/components/sidebar';
import { SidebarHeader } from '@/app/admin/components/sidebar-header';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { columns, CourseData } from './components/utils';

type FetchParams = {
  page: number;
  search?: string;
  limit?: number;
  active?: boolean;
};

// Função para buscar cursos com base na página e na pesquisa
const fetchCourses = async ({ page, search = '', limit = 10, active }: FetchParams) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    search: search,
  });

  if (typeof active === 'boolean') {
    params.append('active', String(active));
  }

  const response = await fetch(`/api/courses?${params.toString()}`);
  const { data, pagination, success, error } = await response.json();
  if (!success) throw new Error(error.message || 'Erro ao buscar cursos');
  return { data, pagination };
};

export default function AdminCoursesPage() {
  const Feature = featMap.courses;
  const [courses, setCourses] = useState<CourseData[]>([]);
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

  // Função para carregar cursos
  const loadCourses = useCallback(() => {
    setPagination((prev) => ({ ...prev, loading: true }));
    fetchCourses({ page: pagination.page, search, limit: pagination.limit })
      .then(({ data, pagination }) => {
        setCourses(data);
        setPagination((prev) => ({ ...prev, ...pagination, loading: false }));
      })
      .catch((error) => {
        console.error('Erro ao buscar curos:', error);
      })
      .finally(() => {
        setPagination((prev) => ({ ...prev, loading: false }));
      });
  }, [pagination.page, pagination.limit, search]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

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
            <CardTitle>Lista de Cursos</CardTitle>
            <CardDescription>Lista de todos os cursos.</CardDescription>
            <CardAction>
              <Link href={`${Feature.url}/criar`}>
                <Button variant="secondary">Criar</Button>
              </Link>
            </CardAction>
          </CardHeader>
        </Card>
        <div className="col-span-3">
          <DataTable
            data={courses}
            columns={columns(() => {
              loadCourses();
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
