// Define o tipo de dados do post
// Este tipo é usado para tipar os dados que serão exibidos na tabela
// e também para garantir que as colunas estejam corretas.
export type PostData = {
  id: string;
  title: string;
  slug: string;
  type: string;
  highlight: number;
  active: boolean;
};

// Define os nomes dos tipos de post
// Este objeto é usado para mapear os tipos de post para seus nomes legíveis
// que serão exibidos na tabela.
export const PostTypesMap: Record<string, { name: string; slug: string }> = {
  post: {
    name: 'Notícia',
    slug: 'noticias',
  },
  screen: {
    name: 'Tela',
    slug: '',
  },
  event: {
    name: 'Evento',
    slug: 'eventos',
  },
  article: {
    name: 'Artigo',
    slug: 'artigos',
  },
};
