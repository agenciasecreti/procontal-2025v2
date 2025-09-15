'use client';

import { Card, CardDescription, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { VisibilityTracker } from '@/components/analytics/visibility-tracker';
import { trackView } from '@/lib/tracking';

const fetchCourses = async () => {
  const res = await fetch('/api/courses?select=id,title,slug,content,workload,active,modules', {
    method: 'GET',
    cache: 'no-store',
  });

  const { success, data, error } = await res.json();
  if (!success) throw new Error('Failed to fetch courses: ' + error.message);

  return data || [];
};

type CourseType = {
  id: number;
  title: string;
  slug: string;
  content: string;
  workload: number;
  active: boolean;
  modules?: {
    id: number;
    title: string;
    slug: string;
    content: string;
    workload: number;
    active: boolean;
  }[];
};

export default function Courses() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<CourseType[]>([]);

  useEffect(() => {
    setLoading(true);
    fetchCourses()
      .then((courses) => {
        setCourses(courses);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Erro ao buscar cursos:', error);
        setCourses([]);
        setLoading(false);
      });
  }, []);

  return (
    <>
      {courses.length > 0 && (
        <section id="cursos" className="bg-tertiary/10 bg-1 w-full py-15 lg:py-20">
          <div className="mx-auto grid max-w-7xl grid-cols-1 px-10">
            <div>
              <Tabs defaultValue={courses[0]?.slug ?? undefined}>
                <div className="flex flex-col items-center justify-center gap-1 lg:flex-row lg:justify-between lg:gap-6">
                  <h2 className="text-primary dark:text-tertiary text-2xl font-bold">
                    Cursos e Treinamentos
                  </h2>
                  {!loading && (
                    <div className="flex flex-col items-center">
                      <span className="text-tertiary-foreground mb-3 flex w-full items-center justify-center gap-1 text-sm font-bold lg:mb-1 lg:justify-end">
                        Faça a sua escolha
                      </span>
                      <TabsList className="my-5 flex flex-col gap-2 bg-transparent lg:my-0 lg:flex-row">
                        {courses.length > 0 &&
                          courses.map((course, index) => (
                            <TabsTrigger
                              key={index}
                              value={course.slug}
                              className="bg-secondary/20 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-tertiary dark:data-[state=active]:text-tertiary-foreground px-8"
                            >
                              {course.title} {course.workload && `(${course.workload}hr)`}
                            </TabsTrigger>
                          ))}
                      </TabsList>
                    </div>
                  )}
                </div>
                <Separator className="border-primary dark:border-tertiary mb-10 border-t-3" />
                {loading ? (
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    <div className="col-span-4">
                      <Skeleton className="h-10 w-1/3" />
                    </div>
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index}>
                        <Skeleton className="h-100 space-y-2 p-8 shadow-lg">
                          <div className="bg-foreground/20 h-5 rounded-md" />
                          <div className="bg-foreground/20 mb-8 h-5 w-2/3 rounded-md" />
                          <div className="space-y-4">
                            <div className="bg-foreground/20 h-3 w-4/5 rounded-md" />
                            <div className="bg-foreground/20 h-3 w-4/5 rounded-md" />
                            <div className="bg-foreground/20 h-3 w-4/5 rounded-md" />
                            <div className="bg-foreground/20 h-3 w-4/5 rounded-md" />
                            <div className="bg-foreground/20 h-3 w-4/5 rounded-md" />
                            <div className="bg-foreground/20 h-3 w-4/5 rounded-md" />
                          </div>
                        </Skeleton>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {courses.length > 0 &&
                      courses.map((course, index) => (
                        <TabsContent key={index} value={course?.slug}>
                          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                            <div className="col-span-4">
                              <h1 className="text-primary dark:text-tertiary text-center text-4xl font-bold lg:text-left">
                                {course.title} {course.workload && `(${course.workload}hr)`}
                              </h1>
                            </div>
                            {course.modules?.map((module, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ x: -20, opacity: 0 }}
                                whileInView={{ x: 0, opacity: 1 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{
                                  delay: idx ? idx * 0.1 : 0,
                                  duration: 0.5,
                                  ease: 'easeInOut',
                                }}
                                whileHover={{ scale: 1.05 }}
                                className="col-span-4 lg:col-span-1"
                              >
                                <VisibilityTracker
                                  onVisible={() =>
                                    trackView(`${course.title} - ${module.title}`, 'course')
                                  }
                                >
                                  <Card className="flex h-full justify-between shadow-lg">
                                    <div>
                                      <CardHeader className="text-primary dark:text-tertiary mb-4 font-bold">
                                        {module.title} {module.workload && module.workload + 'hr'}
                                      </CardHeader>
                                      <CardDescription className="cardDesc text-muted-foreground dark:text-muted-foreground max-h-80 overflow-scroll">
                                        <div dangerouslySetInnerHTML={{ __html: module.content }} />
                                      </CardDescription>
                                    </div>
                                  </Card>
                                </VisibilityTracker>
                              </motion.div>
                            ))}
                          </div>
                        </TabsContent>
                      ))}
                  </>
                )}
              </Tabs>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
