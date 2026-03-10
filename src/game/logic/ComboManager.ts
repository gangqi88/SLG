import { Hero, Race } from '../../types/Hero';
import { BattleUnit, BattleEvent, Buff } from '../../types/BattleTypes';

export interface ComboSkill {
  id: string;
  name: string;
  description: string;
  execute: (units: BattleUnit[], emitEvent: (event: BattleEvent) => void) => void;
  side: 'attacker' | 'defender';
}

interface ComboDefinition {
  id: string;
  name: string;
  description: string;
  race: Race;
  count: number;
  effect: (units: BattleUnit[], side: 'attacker' | 'defender', emitEvent: (event: BattleEvent) => void) => void;
}

export class ComboManager {
  private static definitions: ComboDefinition[] = [
    {
      id: 'human_unity',
      name: 'Human Unity',
      description: 'Heals 10% HP and adds Shield (10% Max HP) to all allies.',
      race: Race.HUMAN,
      count: 3,
      effect: (units, side, emitEvent) => {
        const allies = units.filter(u => u.side === side && !u.isDead);
        const affectedIds: string[] = [];
        
        allies.forEach(ally => {
          // Heal 10%
          const healAmount = Math.floor(ally.maxHp * 0.1);
          ally.currentHp = Math.min(ally.maxHp, ally.currentHp + healAmount);
          
          // Shield 10% (stacking)
          const shieldAmount = Math.floor(ally.maxHp * 0.1);
          ally.shield = (ally.shield || 0) + shieldAmount;
          
          affectedIds.push(ally.uniqueId);
        });

        if (affectedIds.length > 0) {
          emitEvent({
            type: 'combo',
            skillId: 'human_unity',
            timestamp: Date.now(),
            comboName: 'Human Unity',
            affectedUnitIds: affectedIds,
            value: 0
          });
        }
      }
    },
    {
      id: 'divine_light',
      name: 'Divine Light',
      description: 'Purifies debuffs and increases Attack by 20% for 10s.',
      race: Race.ANGEL,
      count: 3,
      effect: (units, side, emitEvent) => {
        const allies = units.filter(u => u.side === side && !u.isDead);
        const affectedIds: string[] = [];

        allies.forEach(ally => {
          // Purify
          if (ally.buffs) {
            ally.buffs = ally.buffs.filter(b => !b.isDebuff);
          }

          // Atk Buff (10s)
          const buffId = `divine_light_atk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const buff: Buff = {
            id: buffId,
            name: 'Divine Light',
            duration: 10,
            effect: (u) => {}, 
            onRemove: (u) => {
               u.currentStats.strength /= 1.2;
               u.currentStats.strategy /= 1.2;
            }
          };
          
          // Apply initial effect
          ally.currentStats.strength *= 1.2;
          ally.currentStats.strategy *= 1.2;
          
          ally.buffs.push(buff);
          affectedIds.push(ally.uniqueId);
        });

        if (affectedIds.length > 0) {
            emitEvent({
                type: 'combo',
                skillId: 'divine_light',
                timestamp: Date.now(),
                comboName: 'Divine Light',
                affectedUnitIds: affectedIds
            });
        }
      }
    },
    {
      id: 'hellfire',
      name: 'Hellfire',
      description: 'Grants Lifesteal (20%) and Attack Speed (20%) for 10s.',
      race: Race.DEMON,
      count: 3,
      effect: (units, side, emitEvent) => {
        const allies = units.filter(u => u.side === side && !u.isDead);
        const affectedIds: string[] = [];

        allies.forEach(ally => {
            const buffId = `hellfire_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const buff: Buff = {
                id: buffId,
                name: 'Hellfire',
                duration: 10,
                effect: (u) => {}, 
                onRemove: (u) => {
                    u.lifesteal = (u.lifesteal || 0) - 0.2;
                    u.attackSpeed = (u.attackSpeed || 1.0) - 0.2;
                }
            };
            
            ally.lifesteal = (ally.lifesteal || 0) + 0.2;
            ally.attackSpeed = (ally.attackSpeed || 1.0) + 0.2;
            
            ally.buffs.push(buff);
            affectedIds.push(ally.uniqueId);
        });

        if (affectedIds.length > 0) {
            emitEvent({
                type: 'combo',
                skillId: 'hellfire',
                timestamp: Date.now(),
                comboName: 'Hellfire',
                affectedUnitIds: affectedIds
            });
        }
      }
    }
  ];

  static checkCombos(heroes: Hero[], side: 'attacker' | 'defender'): ComboSkill[] {
    const raceCounts = new Map<Race, number>();
    heroes.forEach(h => {
      raceCounts.set(h.race, (raceCounts.get(h.race) || 0) + 1);
    });

    const activeCombos: ComboSkill[] = [];
    
    this.definitions.forEach(def => {
      const count = raceCounts.get(def.race) || 0;
      if (count >= def.count) {
        activeCombos.push({
          id: def.id,
          name: def.name,
          description: def.description,
          side,
          execute: (units, emitEvent) => def.effect(units, side, emitEvent)
        });
      }
    });

    return activeCombos;
  }
}
