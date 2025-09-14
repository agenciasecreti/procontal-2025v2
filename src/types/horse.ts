// Define o tipo de dados do cavalo
export type HorseData = {
  id: string;
  name: string;
  registry: string | null;
  breed: typeof HorseBreedMap | null;
  birthDate: Date | null;
  coat: string | null;
  genre: string | null;
  stallion: boolean;
  bio: string | null;
  image: string | null;
  active: boolean;
};

// Define os nomes dos tipos de raça
export const HorseBreedMap: Record<string, { name: string; slug: string }> = {
  quarterHorse: {
    name: 'Quarto de Milha',
    slug: 'quarto-de-milha',
  },
  paintHorse: {
    name: 'Paint Horse',
    slug: 'paint-horse',
  },
  appaloosa: {
    name: 'Appaloosa',
    slug: 'appaloosa',
  },
  arabian: {
    name: 'Árabe',
    slug: 'arabe',
  },
  creole: {
    name: 'Crioulo',
    slug: 'crioulo',
  },
  mangalarga: {
    name: 'Mangalarga',
    slug: 'mangalarga',
  },
  mestizo: {
    name: 'Mestiço',
    slug: 'mestico',
  },
  thoroughbred: {
    name: 'Puro Sangue',
    slug: 'puro-sangue',
  },
};

// Define os nomes das pelagens
export const HorseCoatMap: Record<string, { name: string; slug: string }> = {
  alazao: {
    name: 'Alazão',
    slug: 'alazao',
  },
  tostado: {
    name: 'Alazão Tostado',
    slug: 'alazao-tostado',
  },
  baio: {
    name: 'Baio',
    slug: 'baio',
  },
  castanho: {
    name: 'Castanho',
    slug: 'castanho',
  },
  lobuno: {
    name: 'Lobuno',
    slug: 'lobuno',
  },
  overo: {
    name: 'Overo',
    slug: 'overo',
  },
  palomino: {
    name: 'Palomino',
    slug: 'palomino',
  },
  tobiano: {
    name: 'Tobiano',
    slug: 'tobiano',
  },
  tordilho: {
    name: 'Tordilho',
    slug: 'tordilho',
  },
  tovero: {
    name: 'Tovero',
    slug: 'tovero',
  },
};
