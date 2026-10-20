import { humanHeroes } from './humanHeroes';
import { angelHeroes } from './angelHeroes';
import { demonHeroes } from './demonHeroes';
import { Hero } from '@/shared/types/hero';

export const allHeroes: Hero[] = [...humanHeroes, ...angelHeroes, ...demonHeroes];
