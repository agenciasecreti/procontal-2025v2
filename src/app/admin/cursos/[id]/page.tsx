'use client';

import { ActiveBtn } from '@/app/admin/components/active-btn';
import { featMap } from '@/app/admin/components/sidebar';
import { SidebarHeader } from '@/app/admin/components/sidebar-header';
import { FilesList } from '@/app/admin/cursos/components/files-list';
import { UsersList } from '@/app/admin/cursos/components/students-list';
import { TeachersList } from '@/app/admin/cursos/components/teachers-list';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Course, CourseModule } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';

type CourseDetail = Course & { modules?: CourseModule[] };

const fetchCourse = async (id: string) => {
  const response = await fetch(`/api/courses/${id}?join=modules`);
  const { data, success, error } = await response.json();
  if (!success) throw new Error(error.message || 'Erro ao buscar curso');
  return data;
};

export default function ShowPage({ params }: { params: Promise<{ id: string }> }) {
  const Feature = featMap.courses;
  const { id } = use(params);
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourse(id)
      .then(setCourse)
      .finally(() => setLoading(false));
  }, [id]);

  const breadcrumbs = [
    { name: 'Admin', href: '/admin' },
    { name: Feature.name, href: Feature.url },
    { name: course?.title || 'Carregando...', active: true },
  ];

  return (
    <>
      <SidebarHeader breadcrumbs={breadcrumbs} />
      {(!course || loading) && (
        <div className="bg-background/80 absolute inset-0 z-10 flex h-screen items-center justify-center p-20">
          Carregando...
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 p-8">
        <div className="col-span-1">
          <div className="flex justify-between">
            <h1 className="mb-4 text-2xl font-bold">
              <small className="text-sm">Detalhes do Curso</small>
              <br />
              <Feature.icon className="mr-2 inline-block" /> {course?.title}
            </h1>
            <div className="flex gap-2">
              <Link href={`${Feature.url}/${id}/editar`}>
                <Button variant="secondary" size="sm">
                  Editar
                </Button>
              </Link>
            </div>
          </div>
        </div>
        {course && (
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="bg-foreground/5 flex h-10 w-full justify-between gap-1">
              <TabsTrigger value="details" className="text-xs">
                INFO
              </TabsTrigger>
              <TabsTrigger value="arquivos" className="text-xs">
                ARQUIVOS
              </TabsTrigger>
              <TabsTrigger value="professores" className="text-xs">
                PROFESSORES
              </TabsTrigger>
              <TabsTrigger value="alunos" className="text-xs">
                ALUNOS
              </TabsTrigger>
            </TabsList>
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
                          __html: course.content || '<p>Sem descrição</p>',
                        }}
                      />
                    </div>
                    {course.modules && course.modules.length > 0 && (
                      <div>
                        <p className="mb-2">
                          <strong>Módulos:</strong>
                        </p>
                        <div className="prose rounded-lg border p-5">
                          {course.modules?.map((module, index) => (
                            <ul key={index} className="mx-10 list-disc">
                              <li>{module.title}</li>
                            </ul>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-5 lg:w-1/4 lg:text-end">
                    <div>
                      {course.image && (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_CDN_URL}/${course.image}`}
                          alt={course.title || 'Imagem do Curso'}
                          className="w-full rounded-lg"
                          width={175}
                          height={300}
                        />
                      )}
                    </div>
                    <div>
                      <strong>Ativo:</strong>
                      <p>
                        <span className="inline-flex items-center gap-2">
                          <ActiveBtn
                            id={Number(course.id)}
                            active={course.active}
                            table="courses"
                            onChange={() => {
                              setLoading(true);
                              fetchCourse(id)
                                .then(setCourse)
                                .finally(() => setLoading(false));
                            }}
                          />
                          {course.active ? 'Sim' : 'Não'}
                        </span>
                      </p>
                    </div>
                    <div>
                      <strong>Carga Horária:</strong>
                      <br />
                      {course.workload} horas
                    </div>
                    <div>
                      <strong>Período:</strong>
                      <p className="text-sm text-balance">
                        {course.start_date && new Date(course.start_date).toLocaleDateString()}
                        {course.end_date && ` a  ${new Date(course.end_date).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="arquivos">
              <Card>
                <CardContent>{course && <FilesList course_id={course.id} />}</CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="professores">
              <Card>
                <CardContent>
                  <TeachersList course_id={Number(id)} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="alunos">
              <Card>
                <CardContent>
                  <UsersList course_id={Number(id)} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </>
  );
}
