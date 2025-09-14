import Terms from '@/components/auth/terms';
import { Metadata } from 'next';
import RegisterForm from './components/form';

export const metadata: Metadata = {
  title: `Cadastro - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
  description: 'Página de cadastro do sistema.',
};

const RegisterPage = () => {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-lg">
        <RegisterForm />
        <Terms />
      </div>
    </div>
  );
};

export default RegisterPage;
