'use client';

import { useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import slugify from 'slugify';
import { toast } from 'sonner';

import Ckeditor5Form from '@/components/ckeditor5-editor';
import { Course } from '@prisma/client';

// Função para buscar o módulo pelo ID
const fetchModule = async (id: number, moduleId: number) => {
  const response = await fetch(`/api/courses/${id}/modules/${moduleId}`);
  const { data, success, error } = await response.json();
  if (!success) throw new Error(error.message || 'Erro ao buscar o módulo');
  return data;
};

// Componente de formulário para edição de módulos
export default function ModulesForm({
  id,
  moduleId,
  formData,
  refresh,
  moduleData,
}: {
  id: number;
  moduleId?: number;
  formData: FormData;
  refresh: Date;
  moduleData?: (course: Course | null) => void;
}) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [workload, setWorkload] = useState<number | null>(null);

  useEffect(() => {
    if (!moduleId) return;
    fetchModule(id, moduleId)
      .then((data) => {
        setTitle(data.title);
        setSlug(data.slug || '');
        setContent(data.content || '');
        setWorkload(data.workload);
        moduleData?.(data);
      })
      .catch((error) => {
        toast.error(error.message || 'Erro ao carregar o módulo');
      });
  }, [id, moduleId, refresh, moduleData]);

  useEffect(() => {
    formData.set('courseId', id.toString());
    formData.set('title', title);
    formData.set('slug', slug || slugify(title, { lower: true, strict: true }));
    formData.set('content', content);
    formData.set('workload', workload?.toString() || '');
  }, [id, title, slug, content, workload, formData]);

  return (
    <>
      <div className="grid w-full grid-cols-4 gap-4">
        <div className="col-span-4 mx-auto grid w-full grid-cols-1 gap-8 lg:col-span-4 lg:max-w-5xl lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-8">
            <Label>Título</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => !slug && setSlug(slugify(title, { lower: true, strict: true }))}
            />
          </div>

          <div className="space-y-2 lg:col-span-4">
            <Label>Link Final</Label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              onBlur={() => setSlug(slugify(slug))}
            />
            <p className="text-muted-foreground text-xs">
              {slug && `${process.env.NEXT_PUBLIC_SITE_URL}/cursos/${slug}`}
            </p>
          </div>

          <div className="space-y-3 lg:col-span-3">
            <Label>Carga Horária</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={String(workload)}
                onChange={(e) => setWorkload(Number(e.target.value))}
                className="px-1 text-end"
              />{' '}
              horas
            </div>
          </div>

          <div className="space-y-3 lg:col-span-12">
            <Label>Conteúdo</Label>
            <Ckeditor5Form
              initialContent={content ?? ''}
              folder={`courses${id ? `/${id}` : ''}`}
              onChange={setContent}
            />
          </div>
        </div>
      </div>
    </>
  );
}
