'use client';

import { ActiveBtn } from '@/app/admin/components/active-btn';
import { DeleteDialog } from '@/app/admin/components/delete-dialog';
import { featMap } from '@/app/admin/components/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, NotebookPen, PenBoxIcon, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export const IconCourses = NotebookPen;

// Define o tipo de dados do curso
// Este tipo é usado para tipar os dados que serão exibidos na tabela
// e também para garantir que as colunas estejam corretas.
export type CourseData = {
  id: string;
  title: string;
  active: boolean;
};

// Componente para ações da linha
function CourseActions({ course, refresh }: { course: CourseData; refresh?: () => void }) {
  const Feature = featMap.courses;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <>
      <div className="flex justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Ações</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Link href={`${Feature.url}/${course.id}/editar`} className="flex items-center gap-3">
                <PenBoxIcon /> Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDeleteDialogOpen(true);
              }}
              className="text-red-600 focus:text-red-600 flex items-center gap-3"
            >
              <Trash2 className="text-red-600" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DeleteDialog
        id={Number(course.id)}
        open={deleteDialogOpen}
        table="courses"
        onOpenChange={setDeleteDialogOpen}
        onDeleted={() => {
          setDeleteDialogOpen(false);
          refresh?.();
        }}
      />
    </>
  );
}

// Define as colunas da tabela
export const columns = (refresh?: () => void): ColumnDef<CourseData>[] => [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'title',
    header: () => <div>Título</div>,
    cell: ({ row }: { row: { original: CourseData } }) => {
      const course = row.original;
      return (
        <Link href={`/admin/cursos/${course.id}`} className="text-secondary hover:text-primary">
          {course.title}
        </Link>
      );
    },
  },
  {
    accessorKey: 'active',
    header: () => <div className="text-center">Visível</div>,
    cell: ({ row }) => {
      const course = row.original;
      return (
        <ActiveBtn
          id={Number(course.id)}
          table="courses"
          active={course.active}
          onChange={() => {
            refresh?.();
          }}
        />
      );
    },
  },
  {
    accessorKey: 'actions',
    header: () => <div className="text-center">Ações</div>,
    cell: ({ row }: { row: { original: CourseData } }) => {
      const course = row.original;
      return <CourseActions course={course} refresh={refresh} />;
    },
  },
];
