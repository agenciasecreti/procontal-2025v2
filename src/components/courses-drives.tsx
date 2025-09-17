'use client';

import { useAuth } from '@/hooks/use-auth';
import { Download } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

type FileType = {
  url: string;
  name: string;
  size: number;
  type: string;
  lastModified: string;
  key: string;
};

type CoursePivot = {
  active: boolean;
  course: {
    id: number;
    title: string;
    slug: string;
  };
};

// Função para buscar dados do usuário via nossa API segura
const fetchUser = async (id: number) => {
  try {
    const res = await fetch(`/api/users/${id}?join=courses`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      redirect: 'follow',
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const { data, success, error } = await res.json();
    if (!success) {
      throw new Error(error?.message || 'Failed to fetch user data');
    }
    return data;
  } catch (err) {
    console.error('Erro na fetchUser:', err);
    throw err;
  }
};

// Função para buscar arquivos do curso via nossa API segura
const fetchFilesCourse = async (folder: string) => {
  try {
    const res = await fetch(`/api/filesystem?folder=${encodeURIComponent(folder.trim())}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      redirect: 'follow',
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const { data, success, error } = await res.json();
    if (!success) {
      throw new Error(error?.message || 'Failed to fetch course files');
    }
    return data;
  } catch (err) {
    console.error('Erro na fetchFilesCourse:', err);
    throw err;
  }
};

export default function CoursesDrives() {
  const { user } = useAuth(); // Removido accessToken pois não é mais necessário
  const [files, setFiles] = useState<FileType[]>([]);
  const [userDetails, setUserDetails] = useState<{ courses: CoursePivot[] }>({ courses: [] });
  const [loading, setLoading] = useState(true);

  const handleTabChange = useCallback(async (courseId: number) => {
    try {
      const data = await fetchFilesCourse(`courses/${courseId}/files`);
      setFiles(data.files || []);
    } catch (err) {
      console.error('Erro ao buscar arquivos:', err);
      setFiles([]);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const getUserAndFiles = async () => {
      setLoading(true);
      try {
        const userData = await fetchUser(Number(user.id));
        setUserDetails(userData);

        const firstActiveCourse = userData.courses.find((c: CoursePivot) => c.active);
        if (firstActiveCourse) {
          await handleTabChange(firstActiveCourse.course.id);
        } else {
          setFiles([]);
        }
      } catch (err) {
        console.error('Erro ao buscar dados do usuário:', err);
        setUserDetails({ courses: [] });
        setFiles([]);
      } finally {
        setLoading(false);
      }
    };

    getUserAndFiles();
  }, [user, handleTabChange]);

  return (
    <>
      {loading ? (
        <p className="text-center">Carregando...</p>
      ) : (
        <>
          {userDetails.courses?.length > 0 &&
          userDetails.courses.some((course) => course.active) ? (
            <div className="space-y-4 px-5 py-4 text-center lg:px-10">
              <Tabs defaultValue={userDetails.courses[0]?.course.slug} className="mb-6 w-full">
                <TabsList className="flex w-full justify-center gap-2 p-10">
                  {userDetails.courses.map((pivot) => (
                    <TabsTrigger
                      key={pivot.course.id}
                      value={pivot.course.slug}
                      onClick={() => handleTabChange(pivot.course.id)}
                      className="p-8 text-2xl font-bold"
                    >
                      {pivot.course.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {userDetails.courses.map((pivot) => (
                  <TabsContent key={pivot.course.id} value={pivot.course.slug} className="py-10">
                    {files.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {files.map((file) => (
                          <div
                            key={file.key}
                            className="bg-background flex flex-col items-center space-y-2 rounded-lg p-4 shadow-xl transition-colors duration-200"
                          >
                            <Link
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex w-full items-center gap-3 text-left font-bold"
                            >
                              <Download className="text-foreground h-10 w-10" />
                              <span className="text-primary">
                                <p className="text-foreground/50 text-sm">
                                  {new Date(file.lastModified).toLocaleDateString()}
                                </p>
                                {file.name}
                                <br />
                                <span className="text-foreground/50 text-sm">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                              </span>
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center">Nenhum arquivo encontrado.</p>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          ) : (
            <div className="space-y-4 px-5 py-4 lg:px-10">
              <p className="text-balance">Entre em contato com o suporte para mais informações.</p>
            </div>
          )}
        </>
      )}
    </>
  );
}
