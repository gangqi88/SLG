import { describe, it, expect, beforeEach } from 'vitest';
import { BattleSystem } from '../game/logic/BattleSystem';
import { humanHeroes } from '../data/humanHeroes';
import { demonHeroes } from '../data/demonHeroes';

describe('BattleSystem Animation Integration', () => {
  let battleSystem: BattleSystem;

  beforeEach(() => {
    // Setup 1v1 battle
    const attacker = humanHeroes.slice(0, 1);
    const defender = demonHeroes.slice(0, 1);
    battleSystem = new BattleSystem(attacker, defender);
  });

  it('should emit attack events on update', () => {
    // Simulate enough time for an attack (assumed random chance in logic)
    // We need to force an attack or run multiple updates
    
    let eventFound = false;
    for (let i = 0; i < 100; i++) {
      battleSystem.update(0.1); // 0.1s steps
      const events = battleSystem.getEvents();
      if (events.some(e => e.type === 'attack')) {
        eventFound = true;
        break;
      }
    }
    
    expect(eventFound).toBe(true);
  });

  it('should emit death event when unit hp reaches 0', () => {
    // Cheat: set defender HP to 1
    battleSystem.units[1].currentHp = 1;
    
    // Force damage
    // We can't easily force damage from outside without exposing methods,
    // but we can simulate updates until it dies.
    // Or we can mock the damage calculation.
    
    // Let's run updates until death
    let deathEventFound = false;
    for (let i = 0; i < 200; i++) {
      battleSystem.update(0.1);
      const events = battleSystem.getEvents();
      if (events.some(e => e.type === 'death')) {
        deathEventFound = true;
        break;
      }
    }
    
    expect(deathEventFound).toBe(true);
  });
});
