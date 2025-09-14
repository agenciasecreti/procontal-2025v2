const DashboardPage = () => {
  return (
    <div id="content" className="flex-1 px-4 py-10">
      <h1 className="text-2xl font-bold">Área do Cliente</h1>
      <p className="text-muted-foreground mt-2">Bem-vindo ao painel!</p>
      <div className="text-muted-foreground mb-4 text-sm">
        Você está na área do cliente. Aqui você pode gerenciar suas informações e acessar os
        serviços disponíveis.
      </div>
      <div className="text-muted-foreground mb-4 text-sm">
        Caso precise de ajuda, entre em contato com o suporte através do e-mail suporte@exemplo.com
      </div>
    </div>
  );
};

export default DashboardPage;
