import SiteFooter from '@/components/site/footer';
import SiteHeader from '@/components/site/header';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between">
      <SiteHeader />
      <div className="mx-auto h-auto w-full max-w-7xl flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
};

export default Layout;
