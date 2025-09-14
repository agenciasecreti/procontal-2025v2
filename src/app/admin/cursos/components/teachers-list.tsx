import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatPhone } from '@/lib/utils';
import { Course, CourseTeacher, Teacher, User } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import AddTeacher from './teachers-add';

type TeachersListProps = Teacher & {
  courses: (CourseTeacher & {
    course: Course;
  })[];
  user?: User;
};

type FetchParams = {
  courseId: number;
  page: number;
  search?: string;
  limit?: number;
};

// Função para buscar cursos com base na página e na pesquisa
const fetchTeachersCourse = async ({ courseId, page, search = '', limit = 10 }: FetchParams) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    search: search,
  });

  const response = await fetch(`/api/courses/${courseId}/teachers?${params.toString()}`);
  const { data, pagination, success, error } = await response.json();
  if (!success) toast.error(error.message || 'Erro ao buscar professores.');
  else return { data, pagination };
};

const removeTeachersCourse = async (courseId: number, teacher: Teacher) => {
  const res = await fetch(`/api/courses/${courseId}/teachers`, {
    method: 'DELETE',
    body: JSON.stringify({ teacher_id: teacher.id }),
  });

  if (!res.ok) toast.error((await res.json()).error.message || 'Erro ao remover usuario do curso.');
  else {
    toast.success(`Professor ${teacher.name} removido do curso com sucesso.`);
    return res.json();
  }
};

export function TeachersList({ course_id }: { course_id: number }) {
  const [teachers, setTeachers] = useState<TeachersListProps[]>([]);
  const [search, setSearch] = useState<string>('');
  const [pagination, setPagination] = useState({
    loading: false,
    total: 0,
    limit: 10,
    pages: 0,
    page: 1,
  });

  const columns: ColumnDef<TeachersListProps>[] = [
    {
      accessorKey: 'name',
      header: 'Nome',
    },
    {
      accessorKey: 'email',
      header: 'E-mail',
      cell: ({ row }) => {
        const email = row.original.user?.email as string | undefined;
        return <span>{email || 'Não informado'}</span>;
      },
    },
    {
      accessorKey: 'phone',
      header: 'Telefone',
      cell: ({ row }) => {
        const phone = row.original.user?.phone as string | undefined;
        return <span>{phone ? formatPhone(String(phone)) : 'Não informado'}</span>;
      },
    },
    {
      accessorKey: 'actions',
      header: 'Ações',
      cell: ({ row }) => {
        const teacher = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button variant="destructive" size="sm" onClick={() => handleRemoveTeacher(teacher)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const handleGetTeachers = useCallback(async () => {
    try {
      const res = await fetchTeachersCourse({
        courseId: course_id,
        page: pagination.page,
        search: search,
        limit: pagination.limit,
      });
      if (!res) return;
      setTeachers(res.data);
      setPagination((prev) => ({
        ...prev,
        total: res.pagination.total,
        pages: res.pagination.pages,
        loading: false,
      }));
    } catch (error) {
      console.error('Erro ao buscar professors:', error);
      setPagination((prev) => ({ ...prev, loading: false }));
    }
  }, [course_id, pagination.page, search, pagination.limit]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, loading: true }));
    handleGetTeachers();
  }, [course_id, pagination.page, search, pagination.limit, handleGetTeachers]);

  const handleRemoveTeacher = async (teacher: Teacher) => {
    try {
      await removeTeachersCourse(course_id, teacher);
    } finally {
      handleGetTeachers();
    }
  };

  return (
    <>
      <div className="space-y-4">
        <DataTable
          data={teachers}
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
        <AddTeacher
          courseId={course_id}
          onComplete={(status) => {
            if (status) handleGetTeachers();
          }}
        />
      </div>
    </>
  );
}
