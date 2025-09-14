'use client';

import { SidebarHeader } from '@/app/admin/components/sidebar-header';
import FormConfig from '@/app/admin/config/components/form-config';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotebookPen } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs = [
  { name: 'Admin', href: '/admin' },
  { name: 'Configurações', active: true },
];

// Função para buscar configurações
const fetchConfigs = async () => {
  const response = await fetch(`/api/admin/config`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const { data, success, error } = await response.json();
  if (!success) throw new Error(error.message || 'Erro ao buscar configurações');
  return data;
};

export default function AdminUsersPage() {
  const [configs, setConfigs] = useState<
    { id: number; name: string; key: string; value: string }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);

  const tabs = [
    { value: 'site', label: 'Site' },
    { value: 'contact', label: 'Contatos' },
    { value: 'link', label: 'Links Úteis' },
  ];

  useEffect(() => {
    setLoading(true);
    fetchConfigs()
      .then((res) => {
        setConfigs(res);
      })
      .catch((error) => {
        console.error('Error fetching configs:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <>
      <SidebarHeader breadcrumbs={breadcrumbs} />
      <div className="grid grid-cols-3 gap-4 p-8">
        <div className="col-span-3">
          <div className="flex justify-between">
            <h1 className="mb-4 text-2xl font-bold">
              <NotebookPen className="mr-2 inline-block" /> Configurações
            </h1>
          </div>
        </div>
        {loading ? (
          <div className="col-span-3 flex items-center justify-center">
            <span>Carregando...</span>
          </div>
        ) : (
          <>
            <Tabs defaultValue="site" className="col-span-3 mb-6">
              <TabsList>
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {tabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value}>
                  <div className="flex flex-col gap-2">
                    {configs
                      .filter((config) => config.key.includes(`${tab.value}.`))
                      .map((config) => (
                        <FormConfig
                          key={config.id}
                          id={config.id}
                          name={config.name}
                          slug={config.key}
                          value={config.value}
                          onSave={(value) => {
                            console.log(`${config.key} saved with value: ${value}`);
                          }}
                        />
                      ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </>
        )}
      </div>
    </>
  );
}
