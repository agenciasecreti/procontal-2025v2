import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatPhone } from '@/lib/utils';
import { Course, CourseUser, User } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';
import { ThumbsDown, ThumbsUp, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import AddUser from './students-add';

type UsersListProps = User & {
  courses: (CourseUser & {
    course: Course;
  })[];
};

type FetchParams = {
  id: number;
  page: number;
  search?: string;
  limit?: number;
};

// Função para buscar cursos com base na página e na pesquisa
const fetchUsersCourse = async ({ id, page, search = '', limit = 10 }: FetchParams) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    search: search,
  });

  const response = await fetch(`/api/courses/${id}/users?${params.toString()}`);
  const { data, pagination, success, error } = await response.json();
  if (!success) toast.error(error.message || 'Erro ao buscar usuários do curso.');
  else return { data, pagination };
};

const removeUsersCourse = async (id: number, user: User) => {
  const res = await fetch(`/api/courses/${id}/users`, {
    method: 'DELETE',
    body: JSON.stringify({ userId: user.id }),
  });

  if (!res.ok) toast.error((await res.json()).error.message || 'Erro ao remover usuario do curso.');
  else {
    toast.success(`Aluno ${user.name} removido do curso com sucesso.`);
    return res.json();
  }
};

const editUsersCourse = async (courseId: number, user: User, active: boolean) => {
  const res = await fetch(`/api/courses/${courseId}/users`, {
    method: 'PUT',
    body: JSON.stringify({ userId: user.id, active: active }),
  });

  if (!res.ok) toast.error((await res.json()).error.message || 'Erro ao liberar aluno no curso.');

  toast.success(`Aluno ${user.name} ${active ? 'liberado' : 'bloqueado'} no curso com sucesso.`);
  return res.json();
};

export function UsersList({ course_id }: { course_id: number }) {
  const [users, setUsers] = useState<UsersListProps[]>([]);
  const [search, setSearch] = useState<string>('');
  const [pagination, setPagination] = useState({
    loading: false,
    total: 0,
    limit: 10,
    pages: 0,
    page: 1,
  });

  const columns: ColumnDef<UsersListProps>[] = [
    {
      accessorKey: 'name',
      header: 'Nome',
      cell: ({ row }) => {
        const name = row.original.name;
        return (
          <Link
            href={`/admin/usuarios/${row.original.id}`}
            className="text-secondary hover:text-primary"
          >
            {name || 'Não informado'}
          </Link>
        );
      },
    },
    {
      accessorKey: 'email',
      header: 'E-mail',
    },
    {
      accessorKey: 'phone',
      header: 'Telefone',
      cell: ({ row }) => {
        const phone = row.getValue('phone');
        return <span>{phone ? formatPhone(String(phone)) : 'Não informado'}</span>;
      },
    },
    {
      accessorKey: 'situation',
      header: 'Situação',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditUser(user, user.courses[0].active === true ? false : true)}
            >
              {user.courses[0].active ? (
                <ThumbsUp className="h-4 w-4 text-green-600" />
              ) : (
                <ThumbsDown className="h-4 w-4 text-red-600" />
              )}
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: 'actions',
      header: 'Ações',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button variant="destructive" size="sm" onClick={() => handleRemoveUser(user)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const handleGetUsers = useCallback(async () => {
    try {
      const res = await fetchUsersCourse({
        id: course_id,
        page: pagination.page,
        search: search,
        limit: pagination.limit,
      });
      if (!res) return;
      setUsers(res.data);
      setPagination((prev) => ({
        ...prev,
        total: res.pagination.total,
        pages: res.pagination.pages,
        loading: false,
      }));
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      setPagination((prev) => ({ ...prev, loading: false }));
    }
  }, [course_id, pagination.page, search, pagination.limit]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, loading: true }));
    handleGetUsers();
  }, [course_id, pagination.page, search, pagination.limit, handleGetUsers]);

  const handleRemoveUser = async (user: User) => {
    try {
      await removeUsersCourse(course_id, user);
    } finally {
      handleGetUsers();
    }
  };

  const handleEditUser = async (user: User, active: boolean) => {
    try {
      await editUsersCourse(course_id, user, active);
    } finally {
      handleGetUsers();
    }
  };

  return (
    <>
      <div className="space-y-4">
        <DataTable
          data={users}
          columns={columns}
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
        <Separator className="col-span-3" />
        <AddUser
          courseId={course_id}
          onComplete={(status) => {
            if (status) handleGetUsers();
          }}
        />
      </div>
    </>
  );
}
