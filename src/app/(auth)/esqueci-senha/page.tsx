import ResetForm from '@/app/(auth)/esqueci-senha/components/form';
import Terms from '@/components/auth/terms';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Esqueci Senha - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
  description: 'Página de recuperação de senha do sistema.',
};

const ResetPage = () => {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-md">
        <ResetForm />
        <Terms />
      </div>
    </div>
  );
};

export default ResetPage;
