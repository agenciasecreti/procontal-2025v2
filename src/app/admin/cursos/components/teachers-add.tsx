'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronsUpDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type Teacher = {
  id: string;
  name: string;
};

const updateAddTeacher = async (courseId: number, teacher: Teacher) => {
  const res = await fetch(`/api/courses/${courseId}/teachers`, {
    method: 'POST',
    body: JSON.stringify({ teacher_id: teacher.id }),
  });

  if (!res.ok)
    toast.error((await res.json()).error.message || 'Erro ao adicionar o professor ao curso.');
  else {
    toast.success(`Professor ${teacher.name} adicionado ao curso com sucesso.`);
    return res.json();
  }
};

export default function AddTeacher({
  courseId,
  onComplete,
}: {
  courseId: number;
  onComplete: (status: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setTeachers([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/teachers/search?search=${encodeURIComponent(query.trim())}`);
        const { data, success, error } = await res.json();
        if (!success) {
          console.error('Erro ao buscar professores:', error);
          setTeachers([]);
          return;
        }
        setTeachers(data);
      } catch (err) {
        console.error('Erro ao buscar professors:', err);
        setTeachers([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelect = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setOpen(false);
    setTeachers([]);
    setQuery('');
    updateAddTeacher(courseId, teacher)
      .then(() => {
        onComplete(true);
      })
      .catch(() => {
        onComplete(false);
      });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[250px] justify-between">
          {selectedTeacher ? selectedTeacher.name : 'Adicione um professor'}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[250px] p-2">
        <Input
          placeholder="Pesquisar professor..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="mt-2 max-h-48 overflow-y-auto rounded border">
          {loading && <p className="text-muted-foreground p-2 text-sm">Carregando...</p>}

          {!loading && teachers?.length === 0 && query && (
            <p className="text-muted-foreground p-2 text-sm">Nenhum professor encontrado</p>
          )}

          {!loading &&
            Array.isArray(teachers) &&
            teachers.map((teacher) => (
              <div
                key={teacher.id}
                onClick={() => handleSelect(teacher)}
                className="hover:bg-accent hover:text-accent-foreground cursor-pointer px-3 py-2 transition-colors"
              >
                {teacher.name}
              </div>
            ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
