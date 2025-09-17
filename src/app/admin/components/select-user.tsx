'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronsUpDown } from 'lucide-react';
import { useEffect, useState } from 'react';

type User = {
  id: number | null;
  name: string;
};

export default function SelectUser({
  initialUserId,
  setUserId,
}: {
  initialUserId: number | null;
  setUserId: (id: number | null) => void;
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
        const res = await fetch(`/api/users?search=${encodeURIComponent(query.trim())}`);
        const { data } = await res.json();
        setUsers(data);
      } catch (err) {
        console.error('Erro ao buscar usuários:', err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [query]);

  // Carrega o usuário inicial, se houver
  useEffect(() => {
    if (!initialUserId) {
      setSelectedUser(null);
      return;
    }

    const fetchUser = async () => {
      const response = await fetch(`/api/users/${initialUserId}`);
      const { data, success, error } = await response.json();
      if (!success) throw new Error(error.message || 'Erro ao buscar usuário');
      setSelectedUser(data);
    };

    fetchUser();
  }, [initialUserId]);

  // Função para lidar com a seleção de um usuário
  const handleSelect = (user: User) => {
    setSelectedUser(user); //Atualiza o usuário selecionado
    setUserId(user.id); //Atualiza o ID do usuário no formulário pai
    setOpen(false);
    setUsers([]);
    setQuery('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[250px] justify-between">
          {selectedUser ? selectedUser.name : 'Adicione um usuário'}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[250px] p-2">
        <Input
          placeholder="Pesquisar usuário..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="mt-2 max-h-48 overflow-y-auto rounded border">
          {loading && <p className="text-muted-foreground p-2 text-sm">Carregando...</p>}

          {!loading && users?.length === 0 && query && (
            <p className="text-muted-foreground p-2 text-sm">Nenhum usuário encontrado</p>
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
