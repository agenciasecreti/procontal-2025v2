import ChangeForm from '@/app/(auth)/redefinir-senha/components/form';
import Terms from '@/components/auth/terms';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Redefinir Senha - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
  description: 'Página de redefinição de senha do sistema.',
};

const ResetPage = () => {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-md">
        <ChangeForm />
        <Terms />
      </div>
    </div>
  );
};

export default ResetPage;
