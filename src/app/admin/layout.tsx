import { AdminSidebar } from '@/app/admin/components/sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function Page({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 52)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AdminSidebar variant="inset" />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
