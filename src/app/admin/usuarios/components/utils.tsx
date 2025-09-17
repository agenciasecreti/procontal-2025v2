'use client';

import { DeleteDialog } from '@/app/admin/components/delete-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatPhone } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, PenBoxIcon, Trash2, Users } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export const IconUsers = Users;

// Define o tipo de dados do usuário
export type UserData = {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  cpf: string;
  role: {
    id: string;
    name: string;
  };
};

// Define os nomes dos cargos
export const RolesNames: Record<string, { id: number; name: string }> = {
  super: { id: 1, name: 'Super Admin' },
  admin: { id: 2, name: 'Admin' },
  user: { id: 3, name: 'Usuário' },
  guest: { id: 4, name: 'Visitante' },
  teacher: { id: 5, name: 'Professor' },
  student: { id: 6, name: 'Aluno' },
  creator: { id: 7, name: 'Criador' },
  client: { id: 8, name: 'Cliente' },
};

// Componente para ações da linha
function UserActions({ user, refresh }: { user: UserData; refresh?: () => void }) {
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
              <Link href={`/admin/usuarios/${user.id}/editar`} className="flex items-center gap-3">
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
        id={Number(user.id)}
        open={deleteDialogOpen}
        table="users"
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
export const columns = (refresh?: () => void): ColumnDef<UserData>[] => [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'name',
    header: () => <div>Nome</div>,
    cell: ({ row }: { row: { original: UserData } }) => {
      const user = row.original;
      return (
        <Link href={`/admin/usuarios/${user.id}`} className="text-secondary hover:text-primary">
          {user.name}
        </Link>
      );
    },
  },
  {
    accessorKey: 'email',
    header: () => <div>E-mail</div>,
  },
  {
    accessorKey: 'phone',
    header: () => <div>Contatos</div>,
    cell: ({ row }: { row: { original: UserData } }) => {
      const user = row.original;
      const phone = user.phone ? formatPhone(String(user.phone)) : '';
      const whatsapp = user.whatsapp ? formatPhone(String(user.whatsapp)) : '';
      return (
        <span className="flex flex-col">
          {whatsapp && <span>{whatsapp}</span>}
          {phone && <span>{phone}</span>}
        </span>
      );
    },
  },
  {
    accessorKey: 'cpf',
    header: () => <div className="text-center">CPF</div>,
  },
  {
    accessorKey: 'role.name',
    header: () => <div className="text-center">Cargo</div>,
    cell: ({ row }: { row: { original: UserData } }) => {
      const user = row.original;
      return (
        <div className="text-center">{RolesNames[user.role.name]?.name || user.role.name}</div>
      );
    },
  },
  {
    accessorKey: 'actions',
    header: () => <div className="text-center">Ações</div>,
    cell: ({ row }: { row: { original: UserData } }) => {
      const user = row.original;
      return <UserActions user={user} refresh={refresh} />;
    },
  },
];
