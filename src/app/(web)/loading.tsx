'use client';

import { motion } from 'motion/react';
import Image from 'next/image';

export default function Loading() {
  return (
    <div className="bg-tertiary/10 bg-1 flex min-h-screen items-center justify-center">
      <div className="rtelative flex h-screen flex-col items-center justify-center gap-3">
        <motion.div
          className="border-divider border-t-primary absolute h-[100px] w-[100px] rounded-full border-4 will-change-transform"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        ></motion.div>
        <Image
          src="/icon-1.webp"
          alt="Procontal Treinamentos"
          width={50}
          height={50}
          className="h-auto w-full"
        />
      </div>
    </div>
  );
}
