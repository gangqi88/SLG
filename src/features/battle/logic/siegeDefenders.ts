import type { Hero } from '@/features/hero/types/Hero';
import { Quality } from '@/features/hero/types/Hero';
import { WALL_HERO, STREET_FIGHT_DEFENDERS } from '@/features/hero/data/siegeHeroes';
import type { WorldCity } from '@/features/alliance/logic/WorldMap';

export type SiegeDefenderProfile = {
  cityName: string;
  wall: Hero;
  defenders: Hero[];
};

const scaleStat = (v: number, factor: number) => Math.max(0, Math.floor(v * factor));

const qualityByLevel = (level: number) => {
  if (level >= 8) return Quality.RED;
  if (level >= 5) return Quality.ORANGE;
  return Quality.PURPLE;
};

export const createSiegeDefenderProfile = (city: WorldCity): SiegeDefenderProfile => {
  const levelFactor = 1 + city.level * 0.12;
  const defenseFactor = 1 + city.defense / 1200;
  const wallFactor = levelFactor * defenseFactor;

  const wall: Hero = {
    ...WALL_HERO,
    name: `${city.name} 城墙`,
    quality: qualityByLevel(city.level),
    level: Math.max(1, city.level),
    stats: {
      command: scaleStat(WALL_HERO.stats.command, wallFactor),
      strength: WALL_HERO.stats.strength,
      strategy: WALL_HERO.stats.strategy,
      defense: scaleStat(WALL_HERO.stats.defense, defenseFactor),
    },
  };

  const defenders = STREET_FIGHT_DEFENDERS.map((h) => {
    const f = 1 + city.level * 0.08;
    return {
      ...h,
      name: `${city.name} ${h.name}`,
      quality: qualityByLevel(city.level),
      level: Math.max(1, h.level + city.level * 2),
      stats: {
        command: scaleStat(h.stats.command, f),
        strength: scaleStat(h.stats.strength, f),
        strategy: scaleStat(h.stats.strategy, f),
        defense: scaleStat(h.stats.defense, f),
      },
    } satisfies Hero;
  });

  return { cityName: city.name, wall, defenders };
};

