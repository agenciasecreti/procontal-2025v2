'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useContactConfig } from '@/contexts/config-context';
import { trackClickWhatsapp } from '@/lib/tracking';

export default function Companies() {
  const { whatsapp } = useContactConfig();
  //limpa o número de WhatsApp para remover caracteres especiais
  const cleanWhatsapp = whatsapp.replace(/\D/g, '');
  const whatsappUrl = `https://api.whatsapp.com/send/?phone=+55${cleanWhatsapp}&text=Olá! Tenho interesse nos cursos da Procontal Treinamentos`;

  return (
    <section id="empresas" className="text-tertiary dark:secondary lg:py-20">
      <div className="bg-tertiary mx-auto max-w-6xl overflow-hidden shadow-xl lg:rounded-4xl">
        <div className="border-secondary flex flex-col items-center justify-between gap-6 px-10 lg:flex-row lg:border-l-20">
          <div className="flex flex-col items-start justify-center gap-12 p-10 lg:max-w-[550px]">
            <span className="max-w-xl">
              <motion.p
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-secondary mb-4 text-xl font-bold text-balance"
              >
                Leve sua empresa para outro nível de trabalho!
              </motion.p>
              <motion.p
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-4xl text-white"
              >
                Desconto especial pra <b>VOCÊ</b> que quer
                <span className="text-secondary"> investir na capacitação do seu time </span>
              </motion.p>
            </span>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Button className="bg-secondary text-secondary-foreground hover:bg-primary/90 rounded-2xl py-7 pr-15 pl-8 text-lg transition-colors duration-300">
                <Link
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackClickWhatsapp('whatsapp-companies', 'Contato via WhatsApp')}
                >
                  Quero treinar meu time!
                </Link>
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Image
                alt="Procontal Treinamentos"
                src="/icon-line-l.webp"
                width={70}
                height={70}
                className="mt-4 h-auto w-20"
              />
            </motion.div>
          </div>
          <div className="flex w-lg items-center justify-center lg:px-10">
            <video
              className="h-auto w-100 lg:w-full lg:max-w-[300px]"
              autoPlay
              loop
              muted
              playsInline
              poster="/procontal.webp"
            >
              <source src="/procontal.webm" type="video/webm" />
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}
