import { SidebarHeader } from '@/app/admin/components/sidebar-header';
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard } from 'lucide-react';
import NavItens from './components/nav-itens';

export default function AdminPage() {
  const breadcrumbs = [{ name: 'Admin', href: '/admin' }];

  return (
    <>
      <SidebarHeader breadcrumbs={breadcrumbs} />
      <div className="grid grid-cols-1 gap-4 p-8 lg:grid-cols-3">
        <div className="col-span-1 lg:col-span-3">
          <div className="flex justify-between">
            <h1 className="mb-4 text-2xl font-bold">
              <LayoutDashboard className="mr-2 inline-block" /> Dashboard
            </h1>
          </div>
        </div>
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Painel de Administração</CardTitle>
            <CardDescription>
              Aqui você pode gerenciar todos os aspectos do seu site.
            </CardDescription>
            <CardAction></CardAction>
          </CardHeader>
        </Card>
        <NavItens />
      </div>
    </>
  );
}
