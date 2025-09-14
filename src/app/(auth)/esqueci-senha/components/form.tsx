'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const ResetForm = ({ className, ...props }: React.ComponentProps<'div'>) => {
  const [email, setEmail] = useState('');
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
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const { success, data } = await res.json();
      if (success) {
        toast.success(
          data.message || 'Redefinição de senha solicitada com sucesso. Verifique seu e-mail.'
        );
      }

      setEmail('');

      // Verifica auth após login bem-sucedido
      await checkAuth();
    } catch (error) {
      toast.error('Erro ao solicitar redefinição de senha', {
        description: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <Link href="/" className="text-2xl font-bold">
                  <h1 className="mb-2">{process.env.NEXT_PUBLIC_SITE_NAME}</h1>
                </Link>
                <p className="text-muted-foreground text-sm text-balance">
                  Insira seu e-mail para redefinir sua senha.
                </p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Seu e-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@gmail.com"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Solicitar Redefinição
              </Button>
            </div>
            <div className="text-muted-foreground py-3 text-center text-sm">
              <Link href="/login" className="text-primary hover:text-secondary">
                Voltar para o login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetForm;
