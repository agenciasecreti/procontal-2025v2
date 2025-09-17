'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { InputPwd } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const ChangeForm = ({ className, ...props }: React.ComponentProps<'div'>) => {
  const [code, setCode] = useState('');
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
      const res = await fetch('/api/auth/change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, password, confirmPassword }),
      });

      const { success, data } = await res.json();
      if (success) {
        toast.success(data.message || 'Senha redefinida com sucesso! Você já pode fazer login.');
      }

      //redireciona para o login
      router.push('/login');

      // Limpa os campos
      setPassword('');
      setConfirmPassword('');
      setCode('');

      // Verifica auth após login bem-sucedido
      await checkAuth();
    } catch (error) {
      toast.error('Erro ao redefinir senha.', {
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
                  Insira o código de redefinição enviado para seu e-mail e sua nova senha.
                </p>
              </div>
              <div className="flex w-full flex-col items-center gap-3">
                <Label htmlFor="code" className="text-lg font-medium">
                  Código de Redefinição
                </Label>
                <div className="space-y-2">
                  <InputOTP maxLength={6} value={code} onChange={(value) => setCode(value)}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="p-5 text-xl" />
                      <InputOTPSlot index={1} className="p-5 text-xl" />
                      <InputOTPSlot index={2} className="p-5 text-xl" />
                      <InputOTPSlot index={3} className="p-5 text-xl" />
                      <InputOTPSlot index={4} className="p-5 text-xl" />
                      <InputOTPSlot index={5} className="p-5 text-xl" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
              <div className="grid gap-3 lg:col-span-6">
                <Label htmlFor="password">Nova Senha</Label>
                <InputPwd
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-3 lg:col-span-6">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <InputPwd
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Redefinir Senha
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangeForm;
