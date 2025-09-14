'use client';

import { HardDriveDownload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';

// Função para salvar configuração
const saveConfig = async (id: number, key: string, value: string) => {
  const response = await fetch(`/api/admin/config/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ key, value }),
  });

  if (!response.ok)
    throw new Error((await response.json()).error.message || 'Erro ao salvar configuração.');

  return await response.json();
};

export default function FormConfig({
  id,
  name,
  slug,
  value,
  onSave,
}: {
  id: number;
  name: string;
  slug: string;
  value: string;
  onSave: (value: string) => void;
}) {
  const [newValue, setNewValue] = useState<string>(value);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(newValue);
    saveConfig(id, slug, newValue)
      .then((response) => {
        toast.success('Configuração salva com sucesso!', {
          description: response.message as string,
        });
      })
      .catch((error) => {
        toast.error('Erro ao salvar configuração', {
          description: error.message,
        });
        console.error('Error saving config:', error);
      });

    console.log(`Config ${id} - ${slug} saved with value: ${newValue}`);
  };

  return (
    <>
      <Card className="w-full p-4">
        <form onSubmit={(e) => handleSave(e)}>
          <Label className="mb-3 font-bold">{name}</Label>
          <div className="flex items-center gap-1">
            <Input defaultValue={value} onChange={(e) => setNewValue(e.target.value)} />
            <Button variant="secondary" type="submit">
              <HardDriveDownload />
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}
