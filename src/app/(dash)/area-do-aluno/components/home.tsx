'use client';

import LogoutBtn from '@/components/logout-btn';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import CoursesDrives from './courses-drives';

export const HomeAreaAluno = () => {
  const { user } = useAuth();

  return (
    <>
      <div className="flex justify-between text-center lg:text-start">
        <div>
          <h1 className="text-secondary text-3xl font-bold">Área do Aluno</h1>
          <p className="text-md text-foreground/50 italic">
            Olá {user?.name}, Aqui você pode acessar informações importantes sobre seus cursos.
          </p>
        </div>
        <LogoutBtn text={true} />
      </div>
      <Separator className="my-4" />
      <CoursesDrives />
    </>
  );
};
