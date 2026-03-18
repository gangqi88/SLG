import type { Hero } from '@/features/hero/types/Hero';
import { HeroLogic } from '@/features/hero/logic/HeroLogic';

export const computeHeroPower = (hero: Hero) => {
  const s = HeroLogic.getStats(hero);
  return s.command * 4 + s.strength * 3 + s.strategy * 3 + s.defense * 2;
};

export const computeTeamPower = (heroes: Hero[]) => {
  return heroes.reduce((sum, h) => sum + computeHeroPower(h), 0);
};

export const computeGatherRates = (heroes: Hero[]) => {
  const size = heroes.length;
  const power = computeTeamPower(heroes);
  const woodPerMin = Math.max(0, Math.floor(20 + size * 8 + power / 500));
  const orePerMin = Math.max(0, Math.floor(12 + size * 5 + power / 800));
  const progressPerSec = Math.max(1, Math.min(12, Math.floor(2 + size + power / 8000)));
  return { woodPerMin, orePerMin, progressPerSec, power };
};

