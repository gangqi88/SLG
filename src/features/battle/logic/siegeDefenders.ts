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
  const max = city.defenseState?.max ?? city.defense;
  const cur = city.defenseState?.cur ?? max;
  const ratio = max > 0 ? Math.max(0, Math.min(1, cur / max)) : 1;
  const effectiveDefense = city.defense * (0.6 + 0.4 * ratio);
  const defenseFactor = 1 + effectiveDefense / 1200;
  const wallFactor = levelFactor * defenseFactor * (0.7 + 0.3 * ratio);

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
    const f = (1 + city.level * 0.08) * (0.85 + 0.15 * ratio);
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
