'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { toast } from 'sonner';

type DeleteDialogProps = {
  id: number;
  open: boolean;
  table: string;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
};

export function DeleteDialog({ id, open, table, onOpenChange, onDeleted }: DeleteDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = () => {
    setLoading(true);
    fetch(`/api/${table}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Erro ao excluir o registro');
        }
        return response.json();
      })
      .then(() => {
        toast.success(`Registro excluído com sucesso`);
        onOpenChange(false);
        if (onDeleted) onDeleted();
      })
      .catch((error) => {
        console.error('Erro ao excluir o registro:', error);
        toast.error(
          'Ocorreu um erro ao tentar excluir o registro. Por favor, tente novamente mais tarde.'
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir Registro</DialogTitle>
          <DialogDescription>
            Você tem certeza que deseja excluir? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
