'use client';

import ContactMessage from '@/components/mail/contact-message';
import { Button } from '@/components/ui/button';
import { trackFormSubmit } from '@/lib/tracking';
import { SiFacebook, SiInstagram, SiWhatsapp, SiYoutube } from '@icons-pack/react-simple-icons';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { useState } from 'react';

export default function Contact() {
  const [form, setForm] = useState({
    subject: '[Procontal Treinamentos] Formulário Entre em contato',
    to: 'contato@procontaltreinamentos.com.br',
    from: '',
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    //bloqueia o botão de envio
    setLoading(true);

    try {
      const htmlMessage = ContactMessage({ form });
      const res = await fetch('/api/sendmail', {
        method: 'POST',
        body: JSON.stringify({
          subject: form.subject,
          to: form.to,
          from: form.email,
          name: form.name,
          phone: form.phone,
          email: form.email,
          message: htmlMessage,
        }),
      });

      const { success, data, error } = await res.json();

      if (success) {
        trackFormSubmit('contact-form', true);
        setStatus({
          message: data.message || 'Mensagem enviada com sucesso!',
          type: 'success',
        });
        setLoading(false);
        setForm({ ...form, name: '', phone: '', email: '', message: '', from: '' }); // Limpa o formulário após o envio
      } else {
        trackFormSubmit('contact-form', false);
        setLoading(false);
        setStatus({
          message: error.message || 'Erro ao enviar mensagem. Tente novamente.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      trackFormSubmit('contact-form', false);
      setLoading(false);
      setStatus({ message: 'Erro ao enviar mensagem. Tente novamente.', type: 'error' });
    }
  };

  return (
    <div id="contato" className="w-full">
      <h1 className="dark:text-quaternary -mb-3 hidden px-10 text-center text-6xl font-semibold text-stone-200 lg:-mb-6 lg:block lg:text-9xl">
        Entre em Contato
      </h1>
      <div className="dark:from-quaternary dark:to-tertiary/20 bg-gradient-to-b from-stone-200 from-5% to-stone-50 to-40% px-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col-reverse items-center justify-between gap-10 py-10 lg:flex-row lg:gap-20">
            <form action={handleSubmit} className="w-full lg:w-1/2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex w-full flex-col gap-4"
              >
                <input
                  key="name"
                  type="text"
                  name="name"
                  placeholder={'Nome Completo'}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="border-foreground/20 focus:border-primary w-full border-0 border-b-2 border-solid bg-transparent px-3 py-2"
                  required
                />
                <input
                  key="phone"
                  type="text"
                  name="phone"
                  placeholder={'Telefone'}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="border-foreground/20 focus:border-primary w-full border-0 border-b-2 border-solid bg-transparent px-3 py-2"
                  required
                />
                <input
                  key="email"
                  type="email"
                  name="email"
                  placeholder={'E-mail'}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="border-foreground/20 focus:border-primary w-full border-0 border-b-2 border-solid bg-transparent px-3 py-2"
                  required
                />
                <textarea
                  key="message"
                  name="message"
                  placeholder={'Sua Mensagem'}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="border-foreground/20 focus:border-primary h-30 w-full border-0 border-b-2 border-solid bg-transparent px-3 py-2"
                  required
                />
                {status && (
                  <p
                    className={`mt-4 border text-center ${status.type === 'error' ? 'border-red-600 bg-red-600/50' : 'border-green-600 bg-green-600/50'} rounded-xl p-2 text-balance text-white`}
                  >
                    {status.message}
                  </p>
                )}

                {loading ? (
                  <Button
                    variant="default"
                    className="mt-4 h-12 w-full rounded-3xl text-lg font-bold lg:w-2/3"
                    disabled
                  >
                    Enviando...
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    className="mt-4 h-12 w-full rounded-3xl text-lg font-bold lg:w-2/3"
                  >
                    Enviar Solicitação
                  </Button>
                )}
              </motion.div>
            </form>
            <div className="text-foreground/60 w-full py-10 lg:w-1/2">
              <motion.p
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-2 text-xl font-bold"
              >
                Fale Conosco!
              </motion.p>
              <motion.p
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mb-10 max-w-xl text-4xl text-balance lg:mb-20"
              >
                Nossa equipe está pronta para lhe{' '}
                <span className="text-primary">ajudar a escolher o curso ideal!</span>
              </motion.p>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mb-4 flex flex-col items-start gap-6 lg:flex-row lg:gap-10"
              >
                <div className="flex items-center gap-4">
                  <SiWhatsapp className="h-auto w-6 lg:h-auto lg:w-5" />
                  <span className="lg:text-md text-sm">Nosso WhatsApp</span>
                </div>
                <div className="flex items-center gap-4">
                  <SiInstagram className="h-auto w-6 lg:h-auto lg:w-5" />
                  <SiFacebook className="h-auto w-6 lg:h-auto lg:w-5" />
                  <SiYoutube className="h-auto w-6 lg:h-auto lg:w-5" />
                  <span className="lg:text-md text-sm">Redes Sociais</span>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="flex items-center gap-4"
              >
                <Mail className="h-auto w-6 lg:h-auto lg:w-5" />
                <span className="lg:text-md text-sm">contato@procontaltreinamentos.com.br</span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
