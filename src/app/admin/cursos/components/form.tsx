'use client';

import { useEffect, useState } from 'react';

import CalendarDatetime from '@/components/calendar-datetime';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import slugify from 'slugify';
import { toast } from 'sonner';

import { ToggleImage } from '@/app/admin/components/filesystem/toggle-img';
import Ckeditor5Form from '@/components/ckeditor5-editor';
import { Course } from '@prisma/client';

// Função para buscar o curso pelo ID
const fetchCourse = async (id: number) => {
  const response = await fetch(`/api/courses/${id}`);
  const { data, success, error } = await response.json();
  if (!success) throw new Error(error.message || 'Erro ao buscar o curso');
  return data;
};

// Componente de formulário para edição de cursos
export default function CoursesForm({
  id,
  formData,
  refresh,
  courseData,
}: {
  id?: number;
  formData: FormData;
  refresh: Date;
  courseData?: (course: Course | null) => void;
}) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [workload, setWorkload] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [image, setImage] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchCourse(id)
      .then((data) => {
        setTitle(data.title);
        setSlug(data.slug || '');
        setContent(data.content || '');
        setWorkload(data.workload);
        setStartDate(data.start_date ? new Date(data.start_date) : undefined);
        setEndDate(data.end_date ? new Date(data.end_date) : undefined);
        setImage(data.image || '');
        courseData?.(data);
      })
      .catch((error) => {
        toast.error(error.message || 'Erro ao carregar o curso');
      });
  }, [id, refresh, courseData]);

  useEffect(() => {
    formData.set('title', title);
    formData.set('slug', slug || slugify(title, { lower: true, strict: true }));
    formData.set('content', content);
    formData.set('workload', workload?.toString() || '');
    formData.set('startDate', startDate ? startDate.toISOString() : '');
    formData.set('endDate', endDate ? endDate.toISOString() : '');
    formData.set('image', image ? image : '');
  }, [title, slug, content, workload, image, startDate, endDate, formData]);

  return (
    <>
      <div className="grid w-full grid-cols-4 gap-4">
        <div className="col-span-4 mx-auto grid w-full grid-cols-1 gap-8 lg:col-span-3 lg:max-w-5xl lg:grid-cols-12">
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

          <div className="space-y-3 lg:col-span-4">
            <Label>Data de Início</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !startDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'dd/MM/yyyy HH:mm') : 'Escolher data'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="flex w-auto flex-col gap-2 p-0">
                <CalendarDatetime selected={startDate} onSelect={setStartDate} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-3 lg:col-span-4">
            <Label>Data de Fim</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !endDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'dd/MM/yyyy HH:mm') : 'Escolher data'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarDatetime selected={endDate} onSelect={setEndDate} />
              </PopoverContent>
            </Popover>
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
        <div className="col-span-4 mt-10 space-y-4 lg:col-span-1 lg:mt-0">
          <ToggleImage
            imageUrl={image}
            folder={id ? `courses/${id}` : 'courses'}
            alt={title !== '' ? title : 'st'}
            width={1000}
            ratio={9 / 16}
            setImage={setImage}
          />
        </div>
      </div>
    </>
  );
}
