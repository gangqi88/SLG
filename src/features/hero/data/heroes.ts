import { humanHeroes } from './humanHeroes';
import { angelHeroes } from './angelHeroes';
import { demonHeroes } from './demonHeroes';
import { Hero } from '@/features/hero/types/Hero';

export const allHeroes: Hero[] = [...humanHeroes, ...angelHeroes, ...demonHeroes];
