// Define o tipo de dados do criador
// Este tipo é usado para tipar os dados que serão exibidos na tabela
// e também para garantir que as colunas estejam corretas.
export type CreatorData = {
  id: string;
  userId: string | null;
  name: string;
  cnpj: string | null;
  bio: string | null;
  image: string | null;
  active: boolean;
};
