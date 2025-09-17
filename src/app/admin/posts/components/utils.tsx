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
import { PostData, PostTypesMap } from '@/types/post';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, NotebookPen, PenBoxIcon, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export const IconPosts = NotebookPen;

// Componente para ações da linha
function PostActions({ post, refresh }: { post: PostData; refresh?: () => void }) {
  const Feature = featMap.posts;
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
              <Link href={`${Feature.url}/${post.id}/editar`} className="flex items-center gap-3">
                <PenBoxIcon /> Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDeleteDialogOpen(true);
              }}
              className="flex items-center gap-3 text-red-600 focus:text-red-600"
            >
              <Trash2 className="text-red-600" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DeleteDialog
        id={Number(post.id)}
        open={deleteDialogOpen}
        table="posts"
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
export const columns = (refresh?: () => void): ColumnDef<PostData>[] => [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'title',
    header: () => <div>Título</div>,
    cell: ({ row }: { row: { original: PostData } }) => {
      const post = row.original;
      return (
        <Link href={`/admin/posts/${post.id}`} className="text-secondary hover:text-primary">
          {post.title}
        </Link>
      );
    },
  },
  {
    accessorKey: 'type',
    header: () => <div className="text-center">Tipo</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center">{PostTypesMap[row.getValue('type') as string]?.name}</div>
      );
    },
  },
  {
    accessorKey: 'active',
    header: () => <div className="text-center">Visível</div>,
    cell: ({ row }) => {
      const post = row.original;
      return (
        <ActiveBtn
          id={Number(post.id)}
          table="posts"
          active={post.active}
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
    cell: ({ row }: { row: { original: PostData } }) => {
      const post = row.original;
      return <PostActions post={post} refresh={refresh} />;
    },
  },
];
