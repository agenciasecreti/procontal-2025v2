'use client';

import { useEffect, useState } from 'react';

import { ToggleImage } from '@/app/admin/components/filesystem/toggle-img';
import { RolesNames } from '@/app/admin/usuarios/components/utils';
import CalendarDatetime from '@/components/calendar-datetime';
import { Button } from '@/components/ui/button';
import { Input, InputPwd } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { User } from '@prisma/client';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { IMaskInput } from 'react-imask';
import { toast } from 'sonner';

// Função para buscar o usuário pelo ID
const fetchUser = async (id: number) => {
  const response = await fetch(`/api/users/${id}`);
  const { data, success, error } = await response.json();
  if (!success) throw new Error(error.message || 'Erro ao buscar usuário');
  return data;
};

// Componente de formulário para edição de usuários
export default function UsersForm({
  id,
  formData,
  refresh,
  userData,
}: {
  id?: number;
  formData: FormData;
  refresh: Date;
  userData?: (data: User) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [birth_date, setBirthDate] = useState<Date | undefined>(undefined);
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [avatar, setAvatar] = useState('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [role_id, setRoleId] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchUser(id)
      .then((data) => {
        setName(data.name);
        setEmail(data.email || '');
        setCpf(data.cpf || '');
        setBirthDate(data.birth_date ? new Date(data.birth_date) : undefined);
        setPhone(data.phone || '');
        setWhatsapp(data.whatsapp || '');
        setAvatar(data.avatar || '');
        setRoleId(data.role_id || '');
        userData?.(data);
      })
      .catch((error) => {
        toast.error(error.message || 'Erro ao carregar o usuário');
      });
  }, [id, refresh, userData]);

  useEffect(() => {
    formData.set('name', name);
    formData.set('email', email);
    formData.set('cpf', cpf);
    formData.set('birth_date', birth_date ? birth_date.toISOString() : '');
    formData.set('phone', phone);
    formData.set('whatsapp', whatsapp);
    formData.set('avatar', avatar ? avatar : '');
    formData.set('password', password ? password : '');
    formData.set('confirmPassword', confirmPassword ? confirmPassword : '');
    formData.set('role_id', role_id);
  }, [
    name,
    email,
    cpf,
    birth_date,
    phone,
    whatsapp,
    avatar,
    password,
    confirmPassword,
    role_id,
    formData,
  ]);

  return (
    <>
      <div className="grid w-full grid-cols-4 gap-4">
        <div className="col-span-4 mx-auto grid w-full grid-cols-1 gap-8 lg:col-span-3 lg:max-w-5xl lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-8">
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="" />
          </div>

          <div className="space-y-2 lg:col-span-4">
            <Label>E-mail</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} className="" />
          </div>

          <div className="space-y-2 lg:col-span-4">
            <Label>CPF</Label>
            <IMaskInput
              mask="000.000.000-00"
              value={cpf}
              onAccept={(value) => setCpf(value)}
              className="dark:bg-muted w-full rounded-md border-1 bg-transparent px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2 lg:col-span-4">
            <Label>Telefone</Label>
            <IMaskInput
              mask={['(00) 0000-0000', '(00) 00000-0000']}
              value={phone}
              onAccept={(value) => setPhone(value)}
              className="dark:bg-muted w-full rounded-md border-1 bg-transparent px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2 lg:col-span-4">
            <Label>Whatsapp</Label>
            <IMaskInput
              mask={['(00) 0000-0000', '(00) 00000-0000']}
              value={whatsapp}
              onAccept={(value) => setWhatsapp(value)}
              className="dark:bg-muted w-full rounded-md border-1 bg-transparent px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2 lg:col-span-4">
            <Label className="mb-3">Data de Nascimento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !birth_date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {birth_date ? format(birth_date, 'dd/MM/yyyy') : 'Escolher data'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="flex w-auto flex-col gap-2 p-0">
                <CalendarDatetime selected={birth_date} time={false} onSelect={setBirthDate} />
              </PopoverContent>
            </Popover>
          </div>

          <Separator className="my-4 border lg:col-span-12" />

          <div className="space-y-3 lg:col-span-4">
            <Label>Senha</Label>
            <InputPwd onChange={(e) => setPassword(e.target.value)} />
          </div>

          <div className="space-y-3 lg:col-span-4">
            <Label>Confirmar Senha</Label>
            <InputPwd onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
        </div>
        <div className="col-span-4 mt-10 space-y-4 lg:col-span-1 lg:mt-0">
          <ToggleImage
            imageUrl={avatar}
            folder={id ? `users/${id}` : 'users'}
            alt={name !== '' ? name : 'st'}
            width={800}
            avatar={true}
            setImage={setAvatar}
          />
          <div className="flex w-full flex-col justify-center gap-2 p-6">
            <Select value={role_id} onValueChange={setRoleId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o Tipo" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(RolesNames).map(([key, role]) => (
                  <SelectItem key={key} value={role.id.toString()}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </>
  );
}
