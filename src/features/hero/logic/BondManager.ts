import { Hero, Bond } from '@/features/hero/types/Hero';
import { BattleUnit } from '@/features/battle/types/BattleTypes';

export class BondManager {
  /**
   * Check which bonds are active for a given list of heroes.
   * Returns a list of active bonds.
   */
  static getActiveBonds(heroes: Hero[]): Bond[] {
    const heroIds = new Set(heroes.map((h) => h.id));
    const activeBonds: Bond[] = [];
    const processedBondIds = new Set<string>();

    heroes.forEach((hero) => {
      if (hero.bond && !processedBondIds.has(hero.bond.id)) {
        const isBondActive = hero.bond.requiredHeroes.every((reqId) => heroIds.has(reqId));
        if (isBondActive) {
          activeBonds.push(hero.bond);
          processedBondIds.add(hero.bond.id);
        }
      }
    });

    return activeBonds;
  }

  /**
   * Apply bond effects to battle units.
   * This parses the effect string and applies stat changes.
   * Currently supports:
   * - "攻击/武力+X%"
   * - "防御+X%"
   * - "血量+X%"
   * - "治疗+X%"
   */
  static applyBondEffects(units: BattleUnit[], activeBonds: Bond[]) {
    activeBonds.forEach((bond) => {
      // Parse effect string
      // e.g. "步兵血量+30%", "全队防御+20%", "苏墨+温竹+梁石 -> 建造速度+30%" (Ignore non-combat)

      const effect = bond.effect;
      let stat: 'strength' | 'defense' | 'strategy' | 'maxHp' | null = null;
      let value = 0;

      if (effect.includes('武力') || effect.includes('攻击') || effect.includes('伤害')) {
        stat = 'strength';
      } else if (effect.includes('防御')) {
        stat = 'defense';
      } else if (effect.includes('谋略') || effect.includes('治疗')) {
        stat = 'strategy';
      } else if (effect.includes('血量') || effect.includes('兵力')) {
        stat = 'maxHp';
      }

      if (stat) {
        // Extract percentage
        const match = effect.match(/(\d+)%/);
        if (match) {
          value = parseInt(match[1]) / 100;
        }
      }

      if (stat && value > 0) {
        // Apply to relevant units
        // If effect specifies "步兵", filter by troopType?
        // For simplicity, apply to all units involved in the bond.
        // Or all units in the team?
        // Usually bonds apply to the heroes in the bond.

        units.forEach((unit) => {
          if (bond.requiredHeroes.includes(unit.id.split('_').pop() || '')) {
            // Extract original ID from uniqueId
            // Apply buff
            if (stat === 'maxHp') {
              const bonus = unit.maxHp * value;
              unit.maxHp += bonus;
              unit.currentHp += bonus;
            } else if (stat === 'strength') {
              unit.currentStats.strength *= 1 + value;
            } else if (stat === 'defense') {
              unit.currentStats.defense *= 1 + value;
            } else if (stat === 'strategy') {
              unit.currentStats.strategy *= 1 + value;
            }
          }
        });

        console.log(`Applied Bond: ${bond.name} (${bond.effect})`);
      }
    });
  }
}
