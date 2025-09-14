'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronsUpDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type User = {
  id: string;
  name: string;
};

const updateAddUser = async (courseId: number, user: User) => {
  const res = await fetch(`/api/courses/${courseId}/users`, {
    method: 'POST',
    body: JSON.stringify({ userId: user.id }),
  });

  if (!res.ok)
    toast.error((await res.json()).error.message || 'Erro ao adicionar o aluno ao curso.');
  else {
    toast.success(`Aluno ${user.name} adicionado ao curso com sucesso.`);
    return res.json();
  }
};

export default function AddUser({
  courseId,
  onComplete,
}: {
  courseId: number;
  onComplete: (status: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/search?search=${encodeURIComponent(query.trim())}`);
        const { data } = await res.json();
        setUsers(data);
      } catch (err) {
        console.error('Erro ao buscar alunos:', err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelect = (user: User) => {
    setSelectedUser(user);
    setOpen(false);
    setUsers([]);
    setQuery('');
    updateAddUser(courseId, user)
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
          {selectedUser ? selectedUser.name : 'Adicione um aluno'}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[250px] p-2">
        <Input
          placeholder="Pesquisar aluno..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="mt-2 max-h-48 overflow-y-auto rounded border">
          {loading && <p className="text-muted-foreground p-2 text-sm">Carregando...</p>}

          {!loading && users?.length === 0 && query && (
            <p className="text-muted-foreground p-2 text-sm">Nenhum aluno encontrado</p>
          )}

          {!loading &&
            Array.isArray(users) &&
            users.map((user) => (
              <div
                key={user.id}
                onClick={() => handleSelect(user)}
                className="hover:bg-accent hover:text-accent-foreground cursor-pointer px-3 py-2 transition-colors"
              >
                {user.name}
              </div>
            ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
