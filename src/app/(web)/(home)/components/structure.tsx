'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useContactConfig } from '@/contexts/config-context';
import Link from 'next/link';

export default function Structure() {
  const { whatsapp } = useContactConfig();
  //limpa o número de WhatsApp para remover caracteres especiais
  const cleanWhatsapp = whatsapp.replace(/\D/g, '');
  const whatsappUrl = `https://api.whatsapp.com/send/?phone=+55${cleanWhatsapp}&text=Olá! Tenho interesse nos cursos da Procontal Treinamentos`;

  const waapiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const waapiElement = waapiRef.current;

    if (!waapiElement) return;

    const waapiAnimation = waapiElement.animate(
      [
        { backgroundColor: '#263166' },
        { backgroundColor: '#506CE2' },
        { backgroundColor: '#8C500C' },
      ],
      {
        duration: 5000,
        iterations: Infinity,
        direction: 'alternate',
        easing: 'linear',
      }
    );

    return () => {
      waapiAnimation.cancel();
    };
  }, []);

  return (
    <section id="estrutura" className="swatch motion overflow-hidden text-white" ref={waapiRef}>
      <div className="mx-auto flex w-full flex-col items-center justify-between gap-10 px-10 py-20 lg:max-w-6xl lg:flex-row">
        <div className="connect-light dark:connect-dark hidden w-full grid-cols-1 gap-6 p-5 lg:grid lg:w-1/2 lg:grid-cols-2 lg:gap-10">
          <div className="space-y-6 lg:mt-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0 }}
              className="flex justify-center lg:justify-start"
            >
              <Image
                alt="Procontal Treinamentos"
                src="/images/structure-1.webp"
                width={500}
                height={500}
                className="h-auto w-full rounded-lg shadow-lg shadow-stone-500/50 transition-transform duration-300 ease-in-out hover:scale-105 lg:grayscale lg:hover:grayscale-0"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex justify-center lg:justify-start"
            >
              <Image
                alt="Procontal Treinamentos"
                src="/images/structure-2.webp"
                width={500}
                height={500}
                className="h-auto w-full rounded-lg shadow-lg shadow-stone-500/50 transition-transform duration-300 ease-in-out hover:scale-105 lg:grayscale lg:hover:grayscale-0"
              />
            </motion.div>
          </div>
          <div className="space-y-6 lg:mt-20">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex justify-center lg:justify-start"
            >
              <Image
                alt="Procontal Treinamentos"
                src="/images/structure-3.webp"
                width={500}
                height={500}
                className="h-auto w-full rounded-lg shadow-lg shadow-stone-500/50 transition-transform duration-300 ease-in-out hover:scale-105 lg:grayscale lg:hover:grayscale-0"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex justify-center lg:justify-start"
            >
              <Image
                alt="Procontal Treinamentos"
                src="/images/structure-4.webp"
                width={500}
                height={500}
                className="h-auto w-full rounded-lg shadow-lg shadow-stone-500/50 transition-transform duration-300 ease-in-out hover:scale-105 lg:grayscale lg:hover:grayscale-0"
              />
            </motion.div>
          </div>
        </div>
        <div className="max-w-md text-center lg:text-end">
          <motion.p
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-tertiary dark:text-primary mb-4 block text-4xl font-bold text-balance"
          >
            Um ambiente de excelência para o seu aprendizado
          </motion.p>
          <motion.p
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-6 block text-balance"
          >
            A Procontal Treinamentos oferece um espaço moderno, confortável e totalmente equipado
            para proporcionar uma experiência de aprendizado de alto nível. Cada detalhe foi pensado
            para garantir o melhor ambiente para aulas presenciais, com infraestrutura de ponta e
            recursos que estimulam o desenvolvimento profissional.
          </motion.p>
          <p className="block py-4 text-sm lg:hidden">Arraste pra conhecer mais</p>
          <Carousel opts={{ loop: true, align: 'start' }} className="h-full w-full lg:hidden">
            <CarouselContent className="py-5">
              <CarouselItem className="basis-full">
                <Image
                  src={'/images/structure-1.webp'}
                  alt={'Procontal Treinamentos'}
                  width={400}
                  height={300}
                  className="rounded-lg shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 lg:grayscale lg:hover:grayscale-0"
                />
              </CarouselItem>
              <CarouselItem className="basis-full">
                <Image
                  src={'/images/structure-2.webp'}
                  alt={'Procontal Treinamentos'}
                  width={400}
                  height={300}
                  className="rounded-lg shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 lg:grayscale lg:hover:grayscale-0"
                />
              </CarouselItem>
              <CarouselItem className="basis-full">
                <Image
                  src={'/images/structure-3.webp'}
                  alt={'Procontal Treinamentos'}
                  width={400}
                  height={300}
                  className="rounded-lg shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 lg:grayscale lg:hover:grayscale-0"
                />
              </CarouselItem>
              <CarouselItem className="basis-full">
                <Image
                  src={'/images/structure-4.webp'}
                  alt={'Procontal Treinamentos'}
                  width={400}
                  height={300}
                  className="rounded-lg shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 lg:grayscale lg:hover:grayscale-0"
                />
              </CarouselItem>
            </CarouselContent>
          </Carousel>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex justify-center lg:justify-end"
          >
            <Button className="bg-tertiary hover:bg-tertiary/80 dark:bg-quaternary hover:dark:bg-quaternary/80 px-10 py-5 text-lg text-white lg:pl-30">
              <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                Conheça Mais
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
