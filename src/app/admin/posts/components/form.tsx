'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import slugify from 'slugify';
import { toast } from 'sonner';

import { ToggleImage } from '@/app/admin/components/filesystem/toggle-img';
import CalendarDatetime from '@/components/calendar-datetime';
import Ckeditor5Form from '@/components/ckeditor5-editor';
import { PostTypesMap } from '@/types/post';
import { Post } from '@prisma/client';

// Função para buscar o post pelo ID
const fetchPost = async (id: number) => {
  const response = await fetch(`/api/posts/${id}`);
  const { data, success, error } = await response.json();
  if (!success) throw new Error(error.message || 'Erro ao buscar o post');
  return data;
};

// Componente de formulário para edição de posts
export default function PostsForm({
  id,
  formData,
  handleType,
  refresh,
  postData,
}: {
  id?: number;
  formData: FormData;
  handleType: (type: string) => void;
  refresh: Date;
  postData?: (data: Post) => void;
}) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [type, setType] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchPost(id)
      .then((data) => {
        setTitle(data.title);
        setSlug(data.slug || '');
        setType(data.type);
        setContent(data.content || '');
        setStartDate(data.start_date ? new Date(data.start_date) : undefined);
        setEndDate(data.end_date ? new Date(data.end_date) : undefined);
        setImage(data.image || '');
        setHighlight(data.highlight || false);
        postData?.(data);
      })
      .catch((error) => {
        toast.error(error.message || 'Erro ao carregar o post');
      });
  }, [id, refresh, postData]);

  useEffect(() => {
    formData.set('title', title);
    formData.set('slug', slug || slugify(title, { lower: true, strict: true }));
    formData.set('type', type);
    formData.set('content', content);
    formData.set('startDate', startDate ? startDate.toISOString() : '');
    formData.set('endDate', endDate ? endDate.toISOString() : '');
    formData.set('image', image ? image : '');
    formData.set('highlight', highlight ? 'true' : 'false');
    handleType(type);

    //Na primeira chamada se type nao existir seta como o primeiro elemento
    if (!type) {
      setType(Object.entries(PostTypesMap)[0][0]);
    }
  }, [title, slug, type, content, startDate, endDate, image, highlight, formData, handleType]);

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
              {slug &&
                type &&
                `${process.env.NEXT_PUBLIC_SITE_URL}/${Object.entries(PostTypesMap).find(([key]) => key === type)?.[1].slug}/${slug}`}
            </p>
          </div>

          <div className="space-y-3 lg:col-span-3">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PostTypesMap).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              folder={`posts${id ? `/${id}` : ''}`}
              onChange={setContent}
            />
          </div>

          <div className="flex items-center space-x-2 lg:col-span-4">
            <Switch checked={highlight} onCheckedChange={setHighlight} />
            <Label>Destacar na página inicial</Label>
          </div>
        </div>
        <div className="col-span-4 mt-10 space-y-4 lg:col-span-1 lg:mt-0">
          <Label>Imagem de Capa</Label>
          <ToggleImage
            imageUrl={image}
            folder={id ? `posts/${id}` : 'posts'}
            alt={title !== '' ? title : 'st'}
            width={1000}
            ratio={16 / 9}
            setImage={setImage}
          />
        </div>
      </div>
    </>
  );
}
