'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { HorseBreedMap, HorseData } from '@/types/horse';
import { Separator } from '@radix-ui/react-dropdown-menu';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const Welcome = () => {
  const [horses, setHorses] = useState<HorseData[]>([]);

  // Fetch horses data from an API or other source
  // and update the state using setHorses
  useEffect(() => {
    const fetchHorses = async () => {
      try {
        const response = await fetch('/api/horses');
        const { data } = await response.json();
        if (Array.isArray(data)) setHorses(data);
      } catch (error) {
        console.error('Error fetching horses:', error);
      }
    };

    fetchHorses();
  }, []);

  return (
    <div className="container mx-auto p-4">
      {horses.length > 0 ? (
        <div className="mx-auto flex flex-auto flex-wrap items-center justify-center gap-4 p-4">
          <div className="w-full text-center">
            <h1 className="text-3xl font-bold">{process.env.NEXT_PUBLIC_SITE_NAME}</h1>
            <p className="text-muted-foreground">
              Temos o garanhão perfeito para formar a sua tropa.
            </p>
            <Separator className="my-4" />
          </div>
          {horses.map((horse) => (
            <Card key={horse.id} className="p-0">
              <Image
                src={
                  `${process.env.NEXT_PUBLIC_CDN_URL}/${horse.image}` ||
                  '/images/horse-placeholder.png'
                }
                alt={horse.name}
                width={300}
                height={500}
                className="h-80 w-full rounded-t-md object-cover"
              />
              <CardHeader>
                <CardTitle className="text-2xl">{horse.name}</CardTitle>
                <CardDescription className="px-10 text-lg">
                  {horse.stallion && 'Garanhão'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>{horse.bio}</p>
                <p className="font-xs text-muted-foreground">
                  <b>{horse.breed && HorseBreedMap[String(horse.breed)]?.name}</b>
                  <br />
                  {horse.registry || 'N/A'}
                </p>
              </CardContent>
              <CardFooter className="p-0">
                <Button className="h-10 w-full rounded-t-none text-lg">Saiba Mais</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2 p-8 text-center">
          <p className="text-muted-foreground text-xl font-bold">Bem-vindo ao</p>
          <h1 className="text-3xl font-bold">{process.env.NEXT_PUBLIC_SITE_NAME}</h1>
        </div>
      )}
    </div>
  );
};

export default Welcome;
