'use client';

import { Eye, EyeClosed } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type ActiveBtnProps = {
  id: number;
  table: string;
  active: boolean;
  onChange?: () => void;
};

export function ActiveBtn({ id, table, active, onChange }: ActiveBtnProps) {
  const [loading, setLoading] = useState(false);

  const handleActive = () => {
    setLoading(true);
    fetch(`/api/${table}/${id}/active`, {
      method: 'PUT',
      body: JSON.stringify({ active: !active ? true : false }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Erro ao alterar o status do registro');
        }
        return response.json();
      })
      .then((res) => {
        toast.success(`${res.data.message}`);
        if (onChange) onChange();
      })
      .catch((error) => {
        console.error('Erro ao alterar o status do registro:', error);
        toast.error(
          'Ocorreu um erro ao alterar o status do registro. Por favor, tente novamente mais tarde.'
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <span className="flex justify-center" onClick={handleActive}>
      {loading ? (
        <span>...</span>
      ) : (
        <>{active ? <Eye className="text-green-600" /> : <EyeClosed className="text-red-600" />}</>
      )}
    </span>
  );
}
