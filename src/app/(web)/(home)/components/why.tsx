'use client';

import { CheckCheckIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Why() {
  const vantagens = [
    { text: 'Cursos atualizados e focados na prática profissional' },
    { text: 'Instrutores com ampla experiência no mercado contábil e fiscal' },
    { text: 'Estrutura completa e ambiente de alto padrão' },
    { text: 'Conteúdo voltado para demandas reais' },
    { text: 'Capacitação diferenciada para impulsionar a carreira' },
    { text: 'Cursos presenciais com foco em networking e troca de experiências' },
  ];

  return (
    <section id="porque" className="overflow-hidden text-white">
      <div className="flex w-full flex-col-reverse items-end justify-center px-10 lg:max-w-7xl lg:flex-row">
        <motion.img
          alt="Procontal Treinamentos"
          src="/images/alunos.webp"
          initial={{ opacity: 0, y: 150 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="mt-10 w-full lg:mt-0 lg:max-w-lg"
        />
        <div className="pt-20 lg:py-15">
          <div className="text-center">
            <p className="text-xl font-bold">Por que escolher a</p>
            <h2 className="text-quaternary dark:text-primary mb-10 text-4xl font-bold">
              Procontal Treinamentos?
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-0">
            {vantagens.map((vantagem, index) => (
              <motion.div
                key={index}
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index ? index * 0.1 : 0, duration: 0.5, ease: 'easeInOut' }}
                whileHover={{ scale: 1.2 }}
                className="hover:text-primary flex items-start gap-6 rounded-lg text-center hover:border hover:border-white/20 hover:bg-white/95 hover:shadow-lg hover:shadow-white/20 lg:p-6 lg:text-start"
              >
                <p className="text-shadow text-lg lg:flex">
                  <CheckCheckIcon className="text-quaternary dark:text-primary mr-3 inline-block lg:block" />
                  {vantagem.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
