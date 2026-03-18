import type { BattleEvent } from '@/features/battle/types/BattleTypes';

export type BattleWinner = 'attacker' | 'defender' | 'draw';

export type BattleSideStats = {
  damage: number;
  heal: number;
  deaths: number;
};

export type HeroBattleStats = {
  heroId: string;
  name: string;
  side: 'attacker' | 'defender';
  damage: number;
  heal: number;
  kills: number;
  deaths: number;
};

export type BattleResult = {
  battleId: string;
  mode: string;
  winner: BattleWinner;
  durationSec: number;
  endedAtMs: number;
  attacker: { names: string[] };
  defender: { names: string[] };
  stats: { attacker: BattleSideStats; defender: BattleSideStats };
  heroes: HeroBattleStats[];
};

export const emptySideStats = (): BattleSideStats => ({ damage: 0, heal: 0, deaths: 0 });

export type BattleStatsAccumulator = {
  sides: { attacker: BattleSideStats; defender: BattleSideStats };
  heroes: Record<string, HeroBattleStats>;
  lastHitByTargetUnitId: Record<string, string>;
};

export const createBattleAccumulator = () => {
  return {
    sides: { attacker: emptySideStats(), defender: emptySideStats() },
    heroes: {},
    lastHitByTargetUnitId: {},
  } satisfies BattleStatsAccumulator;
};

export const ensureHeroInAccumulator = (
  acc: BattleStatsAccumulator,
  hero: { heroId: string; name: string; side: 'attacker' | 'defender' },
) => {
  const existing = acc.heroes[hero.heroId];
  if (existing) return;
  acc.heroes[hero.heroId] = {
    heroId: hero.heroId,
    name: hero.name,
    side: hero.side,
    damage: 0,
    heal: 0,
    kills: 0,
    deaths: 0,
  };
};

export const accumulateFromEvents = (
  acc: BattleStatsAccumulator,
  events: BattleEvent[],
  sideByUnitId: Map<string, 'attacker' | 'defender'>,
  heroIdByUnitId: Map<string, string>,
) => {
  events.forEach((e) => {
    const sourceSide = e.sourceId ? sideByUnitId.get(e.sourceId) : undefined;
    const sourceHeroId = e.sourceId ? heroIdByUnitId.get(e.sourceId) : undefined;
    const targetHeroId = e.targetId ? heroIdByUnitId.get(e.targetId) : undefined;

    if (e.type === 'attack' || e.type === 'skill') {
      if (sourceSide) acc.sides[sourceSide].damage += e.value;
      if (sourceHeroId && acc.heroes[sourceHeroId]) acc.heroes[sourceHeroId].damage += e.value;
      if (e.targetId && e.sourceId) acc.lastHitByTargetUnitId[e.targetId] = e.sourceId;
      return;
    }

    if (e.type === 'heal') {
      if (sourceSide) acc.sides[sourceSide].heal += e.value;
      if (sourceHeroId && acc.heroes[sourceHeroId]) acc.heroes[sourceHeroId].heal += e.value;
      if (e.targetId && e.sourceId) acc.lastHitByTargetUnitId[e.targetId] = e.sourceId;
      return;
    }

    if (e.type === 'death') {
      const targetSide = e.targetId ? sideByUnitId.get(e.targetId) : undefined;
      if (targetSide) acc.sides[targetSide].deaths += 1;
      if (targetHeroId && acc.heroes[targetHeroId]) acc.heroes[targetHeroId].deaths += 1;
      if (e.targetId) {
        const lastSourceUnitId = acc.lastHitByTargetUnitId[e.targetId];
        const killerHeroId = lastSourceUnitId ? heroIdByUnitId.get(lastSourceUnitId) : undefined;
        if (killerHeroId && acc.heroes[killerHeroId]) acc.heroes[killerHeroId].kills += 1;
      }
    }
  });
};
