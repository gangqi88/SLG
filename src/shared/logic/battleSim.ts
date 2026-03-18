import { BattleSystem } from '@/features/battle/logic/BattleSystem';
import type { BattleEvent } from '@/features/battle/types/BattleTypes';
import type { Hero } from '@/features/hero/types/Hero';

export type BattleWinner = 'attacker' | 'defender' | 'draw';

export type BattleSimResult = {
  winner: BattleWinner;
  durationSec: number;
  events: BattleEvent[];
  damage: { attacker: number; defender: number };
  heal: { attacker: number; defender: number };
  deaths: { attacker: number; defender: number };
};

export const simulateBattle = (attackerHeroes: Hero[], defenderHeroes: Hero[]) => {
  const system = new BattleSystem(attackerHeroes, defenderHeroes);
  const sideById = new Map<string, 'attacker' | 'defender'>();
  system.units.forEach((u) => sideById.set(u.uniqueId, u.side));

  const events: BattleEvent[] = [];
  const damage = { attacker: 0, defender: 0 };
  const heal = { attacker: 0, defender: 0 };
  const deaths = { attacker: 0, defender: 0 };

  const step = 0.2;
  const maxSec = 90;
  let t = 0;

  const isDone = () => {
    const attackersAlive = system.units.some((u) => u.side === 'attacker' && !u.isDead);
    const defendersAlive = system.units.some((u) => u.side === 'defender' && !u.isDead);
    return !attackersAlive || !defendersAlive;
  };

  while (t < maxSec && !isDone()) {
    system.update(step);
    t += step;
    const newEvents = system.getEvents();
    if (newEvents.length > 0) {
      newEvents.forEach((e) => {
        events.push(e);
        const sourceSide = e.sourceId ? sideById.get(e.sourceId) : undefined;
        if (e.type === 'attack' || e.type === 'skill') {
          if (sourceSide) damage[sourceSide] += e.value;
        } else if (e.type === 'heal') {
          if (sourceSide) heal[sourceSide] += e.value;
        } else if (e.type === 'death') {
          const targetSide = e.targetId ? sideById.get(e.targetId) : undefined;
          if (targetSide) deaths[targetSide] += 1;
        }
      });
    }
  }

  const attackersAlive = system.units.some((u) => u.side === 'attacker' && !u.isDead);
  const defendersAlive = system.units.some((u) => u.side === 'defender' && !u.isDead);
  const winner: BattleWinner = attackersAlive && !defendersAlive ? 'attacker' : !attackersAlive && defendersAlive ? 'defender' : 'draw';

  return {
    winner,
    durationSec: Math.round(t * 10) / 10,
    events,
    damage,
    heal,
    deaths,
  } satisfies BattleSimResult;
};

