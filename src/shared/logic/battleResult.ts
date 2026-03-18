import type { BattleEvent } from '@/features/battle/types/BattleTypes';

export type BattleWinner = 'attacker' | 'defender' | 'draw';

export type BattleSideStats = {
  damage: number;
  heal: number;
  deaths: number;
};

export type BattleResult = {
  battleId: string;
  mode: string;
  winner: BattleWinner;
  durationSec: number;
  attacker: { names: string[] };
  defender: { names: string[] };
  stats: { attacker: BattleSideStats; defender: BattleSideStats };
};

export const emptySideStats = (): BattleSideStats => ({ damage: 0, heal: 0, deaths: 0 });

export const accumulateStatsFromEvents = (
  stats: { attacker: BattleSideStats; defender: BattleSideStats },
  events: BattleEvent[],
  sideByUnitId: Map<string, 'attacker' | 'defender'>,
) => {
  events.forEach((e) => {
    const sourceSide = e.sourceId ? sideByUnitId.get(e.sourceId) : undefined;
    if (e.type === 'attack' || e.type === 'skill') {
      if (sourceSide) stats[sourceSide].damage += e.value;
      return;
    }
    if (e.type === 'heal') {
      if (sourceSide) stats[sourceSide].heal += e.value;
      return;
    }
    if (e.type === 'death') {
      const targetSide = e.targetId ? sideByUnitId.get(e.targetId) : undefined;
      if (targetSide) stats[targetSide].deaths += 1;
    }
  });
};

