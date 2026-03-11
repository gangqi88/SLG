import { humanHeroes } from './humanHeroes';
import { angelHeroes } from './angelHeroes';
import { demonHeroes } from './demonHeroes';
import { Hero } from '@/features/hero/types/Hero';

export const allHeroes: Hero[] = [...humanHeroes, ...angelHeroes, ...demonHeroes];

export const getHeroesByRace = (race: string): Hero[] => {
  return allHeroes.filter((hero) => hero.race === race);
};

export const getHeroById = (id: string): Hero | undefined => {
  return allHeroes.find((hero) => hero.id === id);
};
