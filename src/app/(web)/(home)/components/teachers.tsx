'use client';

import { FlipCard } from '@/components/flip-card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { MoveRight } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const fetchTeachers = async () => {
  const res = await fetch('/api/teachers', {
    method: 'GET',
    cache: 'no-store',
  });

  const { success, data, error } = await res.json();
  if (!success) throw new Error('Failed to fetch teachers: ' + error.message);

  return data || [];
};

type TeachersType = {
  id: number;
  name: string;
  fullName: string;
  genre: string;
  prefix: string;
  image: string;
  bio: string;
  active: boolean;
};

export default function Teachers() {
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<TeachersType[]>([]);

  useEffect(() => {
    setLoading(true);
    fetchTeachers()
      .then(function (teachers) {
        setTeachers(teachers);
        setLoading(false);
      })
      .catch(function () {
        setTeachers([]);
        setLoading(false);
      });
  }, []);

  return (
    <>
      {teachers.length > 0 ? (
        <section
          id="professores"
          className="from-primary/20 to-primary-0 dark:from-tertiary/20 dark:to-secondary/20 overflow-hidden bg-gradient-to-br from-50%"
        >
          <div className="mx-auto flex w-full flex-col items-center justify-center gap-0 px-10 pt-20 lg:max-w-7xl">
            <div>
              <p className="text-secondary mb-6 text-center text-2xl font-bold text-balance">
                Conheça os professores que vão transformar a sua carreira
              </p>
              <Separator className="bg-primary mx-auto max-w-40 lg:mb-10" />
              <p className="text-tertiary-foreground/30 mt-5 flex items-center justify-center gap-1 text-center text-xs text-balance lg:hidden">
                Clique no card para ver o minicurrículo. Arraste para o lado para conhecer mais
                professores <MoveRight />
              </p>
            </div>
            {!loading && (
              <Carousel opts={{ loop: true, align: 'start' }} className="h-full w-full">
                <CarouselContent className="pt-4 pb-15">
                  {teachers.map((teacher, index) => (
                    <CarouselItem key={index} className="basis-full px-6 lg:basis-1/4">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0.8 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="relative h-full"
                      >
                        <FlipCard
                          height="h-[430px]"
                          front={
                            <div className="from-secondary to-primary hover:to-tertiary text-primary-foreground dark:from-tertiary dark:to-quaternary dark:hover:to-primary dark:text-primary-foreground relative flex h-full flex-col justify-end overflow-hidden rounded-lg bg-gradient-to-br px-3 text-center shadow-md shadow-stone-500 lg:px-0">
                              <Image
                                src={`${process.env.NEXT_PUBLIC_CDN_URL}/${teacher.image}`}
                                alt={`${teacher.prefix} ${teacher.name}`}
                                width={300}
                                height={160}
                                className="transition-transform duration-300 ease-in-out hover:scale-105 lg:grayscale lg:hover:grayscale-0"
                              />
                              <h3 className="from-secondary to-secondary/0 dark:from-quaternary dark:to-quaternary/0 dark:text-tertiary-foreground absolute -bottom-2 left-0 z-100 mb-2 w-full bg-gradient-to-t p-8 text-xl font-semibold text-shadow-lg">
                                {teacher.prefix} {teacher.name}
                              </h3>
                            </div>
                          }
                          back={
                            <div className="">
                              <p className="mb-4 text-2xl font-bold">
                                {teacher.prefix} {teacher.name}
                              </p>
                              <div
                                className="list text-xs"
                                dangerouslySetInnerHTML={{ __html: teacher.bio }}
                              />
                            </div>
                          }
                        />
                      </motion.div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden border-0 shadow-none lg:inline-block" />
                <CarouselNext className="hidden border-0 shadow-none lg:inline-block" />
              </Carousel>
            )}
          </div>
        </section>
      ) : (
        <></>
      )}
    </>
  );
}
