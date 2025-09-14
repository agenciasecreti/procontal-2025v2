import Link from 'next/link';

const Terms = () => {
  return (
    <div className="text-muted-foreground *:[a]:hover:text-primary mt-4 text-center text-xs text-balance lg:max-w-lg *:[a]:underline *:[a]:underline-offset-4">
      Ao clicar em continuar, você concorda com nossos{' '}
      <Link href="/termos-de-uso">Termos de Uso</Link> e{' '}
      <Link href="/politica-de-privacidade">Política de Privacidade</Link>.
    </div>
  );
};

export default Terms;
