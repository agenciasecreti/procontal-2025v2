'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input, InputPwd } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IMaskInput } from 'react-imask';
import { toast } from 'sonner';

const RegisterForm = ({ className, ...props }: React.ComponentProps<'div'>) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();
  const { user, isAuthenticated, isLoading, checkAuth } = useAuth();

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      //verifica se é admin
      if (user?.role === 'admin' || user?.role === 'super') {
        router.push('/admin');
      } else if (user?.role === 'client') {
        router.push('/painel');
      } else {
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, router, user]);

  // Não renderizar o formulário se estiver carregando ou já autenticado
  if (isLoading) {
    return (
      <div className={cn('flex flex-col gap-6', className)} {...props}>
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0">
            <div className="p-6 text-center md:p-8">
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Não renderizar nada enquanto redireciona
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, whatsapp, cpf, password, confirmPassword }),
      });

      await response.json();

      // Verifica auth após login bem-sucedido
      await checkAuth();
    } catch (error) {
      toast.error('Erro ao fazer registro', {
        description: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="flex flex-col items-center text-center lg:col-span-12">
                <Link href="/" className="text-2xl font-bold">
                  <h1 className="mb-2">{process.env.NEXT_PUBLIC_SITE_NAME}</h1>
                </Link>
                <p className="text-muted-foreground text-sm text-balance">
                  Olá, cadastre-se para continuar.
                </p>
              </div>
              <div className="grid gap-3 lg:col-span-12">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome Completo"
                  required
                />
              </div>
              <div className="grid gap-3 lg:col-span-12">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@gmail.com"
                  required
                />
              </div>
              <div className="grid gap-3 lg:col-span-6">
                <Label htmlFor="whatsapp">Whatsapp</Label>
                <IMaskInput
                  id="whatsapp"
                  type="text"
                  value={whatsapp}
                  onAccept={(value) => setWhatsapp(value)}
                  mask="(00) 00000-0000"
                  className="dark:bg-muted w-full rounded-md border-1 bg-transparent px-3 py-2 text-sm"
                  required
                />
              </div>
              <div className="grid gap-3 lg:col-span-6">
                <Label htmlFor="cpf">CPF</Label>
                <IMaskInput
                  id="cpf"
                  type="text"
                  value={cpf}
                  onAccept={(value) => setCpf(value)}
                  mask="000.000.000-00"
                  className="dark:bg-muted w-full rounded-md border-1 bg-transparent px-3 py-2 text-sm"
                />
              </div>
              <div className="grid gap-3 lg:col-span-6">
                <Label htmlFor="password">Senha</Label>
                <InputPwd
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-3 lg:col-span-6">
                <Label htmlFor="confirm-password">Confirmar Senha</Label>
                <InputPwd
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <div className="text-center lg:col-span-12">
                <Button type="submit" className="w-full lg:w-2/3">
                  Cadastrar
                </Button>
              </div>
            </div>
            <div className="text-muted-foreground py-3 text-center text-sm">
              Já possui uma conta?{' '}
              <Link href="/login" className="text-primary hover:text-secondary">
                Faça login aqui
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterForm;
