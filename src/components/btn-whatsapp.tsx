'use client';

import { motion } from 'framer-motion';
import { SiWhatsapp } from '@icons-pack/react-simple-icons';
import { useContactConfig } from '@/contexts/config-context';
import { trackClickWhatsapp } from '@/lib/tracking';

export default function BtnWhatsapp() {
  const { whatsapp } = useContactConfig();

  // Limpa o número de WhatsApp para remover caracteres especiais
  const cleanWhatsapp = whatsapp.replace(/\D/g, '');
  const whatsappUrl = `https://api.whatsapp.com/send/?phone=+55${cleanWhatsapp}&text=Olá! Tenho interesse nos cursos da Procontal Treinamentos`;

  const handleClick = () => {
    trackClickWhatsapp('whatsapp-floating', 'Contato via WhatsApp');
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed right-4 bottom-4 z-50 lg:right-8 lg:bottom-8">
      <button onClick={handleClick} aria-label="Contato via WhatsApp" className="block">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, delay: 1 }}
          className="h-12 w-12 rounded-full bg-green-600 p-3 text-white shadow-lg transition-shadow duration-300 hover:shadow-xl"
        >
          <SiWhatsapp />
        </motion.div>
      </button>
    </div>
  );
}
