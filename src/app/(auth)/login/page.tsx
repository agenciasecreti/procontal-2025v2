import LoginForm from '@/app/(auth)/login/components/form';
import Terms from '@/components/auth/terms';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Login - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
  description: 'Página de login do sistema.',
};

const LoginPage = () => {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-md">
        <LoginForm />
        <Terms />
      </div>
    </div>
  );
};

export default LoginPage;
