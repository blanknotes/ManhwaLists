
export interface Manhwa {
  id: string;
  title: string;
  synopsis: string;
  genres: string[];
  rating: number;
  image: string;
  author: string;
  status: 'Finished' | 'Publishing' | 'On Hiatus';
  episodes: number;
}

export const MANHWA_DATA: Manhwa[] = [
  {
    id: '1',
    title: 'Solo Leveling',
    synopsis: 'In a world where hunters, humans who possess magical abilities, must battle deadly monsters to protect the human race from certain annihilation, a notoriously weak hunter named Sung Jin-Woo finds himself in a seemingly endless struggle for survival.',
    genres: ['Action', 'Fantasy', 'Adventure'],
    rating: 8.9,
    image: 'https://picsum.photos/seed/manhwa-1/400/600',
    author: 'Chugong',
    status: 'Finished',
    episodes: 179
  },
  {
    id: '2',
    title: 'Tower of God',
    synopsis: 'What do you desire? Fortune? Glory? Power? Revenge? Or something that surpasses all others? Whatever you desire, "it" is here. Tower of God.',
    genres: ['Action', 'Fantasy', 'Mystery'],
    rating: 8.4,
    image: 'https://picsum.photos/seed/manhwa-2/400/600',
    author: 'SIU',
    status: 'Publishing',
    episodes: 550
  },
  {
    id: '3',
    title: 'The Beginning After The End',
    synopsis: 'King Grey has unrivaled strength, riches, and prestige in a world governed by martial ability. However, solitude lingers closely behind those with great power.',
    genres: ['Action', 'Fantasy', 'Isekai'],
    rating: 8.6,
    image: 'https://picsum.photos/seed/manhwa-3/400/600',
    author: 'TurtleMe',
    status: 'Publishing',
    episodes: 175
  },
  {
    id: '4',
    title: 'Omniscient Reader',
    synopsis: 'I was the only one who read the end of the world. One day our world finds itself in the world of the novel I was reading.',
    genres: ['Action', 'Fantasy', 'Adventure'],
    rating: 8.8,
    image: 'https://picsum.photos/seed/manhwa-4/400/600',
    author: 'Sing-Shong',
    status: 'Publishing',
    episodes: 140
  },
  {
    id: '5',
    title: 'Bastard',
    synopsis: 'There is a serial killer in my house. My father is a serial killer.',
    genres: ['Thriller', 'Horror', 'Mystery'],
    rating: 8.7,
    image: 'https://picsum.photos/seed/manhwa-5/400/600',
    author: 'Carnby Kim',
    status: 'Finished',
    episodes: 93
  },
  {
    id: '6',
    title: 'The Boxer',
    synopsis: 'Do you have the talent? A boy whose heart is as dead as stone. A genius of boxing finds him.',
    genres: ['Sports', 'Drama', 'Psychological'],
    rating: 8.5,
    image: 'https://picsum.photos/seed/manhwa-6/400/600',
    author: 'JH',
    status: 'Finished',
    episodes: 124
  },
  {
    id: '7',
    title: 'Wind Breaker',
    synopsis: 'Jay is the student council president of Taeyang High. Not only is he a smart student, but he is also an extreme bicycler with amazing technique.',
    genres: ['Sports', 'Drama', 'Action'],
    rating: 8.3,
    image: 'https://picsum.photos/seed/manhwa-7/400/600',
    author: 'Yongseok Jo',
    status: 'Publishing',
    episodes: 450
  },
  {
    id: '8',
    title: 'Lookism',
    synopsis: 'A miracle happens to an unattractive loner student. He suddenly wakes up in a different body that is incredibly handsome.',
    genres: ['Drama', 'Action', 'School'],
    rating: 8.1,
    image: 'https://picsum.photos/seed/manhwa-8/400/600',
    author: 'Taejun Pak',
    status: 'Publishing',
    episodes: 480
  },
  {
    id: '9',
    title: 'Eleceed',
    synopsis: 'Jiwoo is a kind-hearted young man who harnesses the lightning quick reflexes of a cat to secretly make the world a better place.',
    genres: ['Action', 'Comedy', 'Supernatural'],
    rating: 8.7,
    image: 'https://picsum.photos/seed/manhwa-9/400/600',
    author: 'Sohn Jeho',
    status: 'Publishing',
    episodes: 250
  },
  {
    id: '10',
    title: 'Legend of the Northern Blade',
    synopsis: 'For decades, the brave warriors of the Northern Heavenly Sect fought to keep the world safe from the evil Silent Night. But when the fourth generation leader is accused of colluding with the enemy, he is forced to disband the sect and commit suicide.',
    genres: ['Action', 'Adventure', 'Martial Arts'],
    rating: 8.8,
    image: 'https://picsum.photos/seed/manhwa-10/400/600',
    author: 'Woogack',
    status: 'Publishing',
    episodes: 160
  }
];

export const GENRES = [
  'Action', 'Fantasy', 'Adventure', 'Mystery', 'Isekai', 'Thriller', 'Horror', 'Sports', 'Drama', 'Psychological', 'Romance', 'Comedy'
];
