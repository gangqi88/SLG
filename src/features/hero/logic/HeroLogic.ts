import { Hero, HeroStats } from '@/features/hero/types/Hero';
import InventoryManager from '@/features/resource/logic/InventoryManager';

export class HeroLogic {
  /**
   * Calculate final stats based on level and star rating.
   * Assumes hero.stats are the BASE stats at Level 1, Star 1.
   */
  static getStats(hero: Hero): HeroStats {
    const starMultiplier = 1 + (hero.starRating - 1) * 0.1; // 1.0, 1.1, 1.2, 1.3, 1.4
    const levelMultiplier = 1 + (hero.level - 1) * 0.05; // 1.0, 1.05, 1.1...

    const multiplier = starMultiplier * levelMultiplier;

    return {
      command: Math.floor(hero.stats.command * multiplier),
      strength: Math.floor(hero.stats.strength * multiplier),
      strategy: Math.floor(hero.stats.strategy * multiplier),
      defense: Math.floor(hero.stats.defense * multiplier),
    };
  }

  static getLevelUpCost(level: number): number {
    // Exponential growth: 100, 120, 144...
    return Math.floor(100 * Math.pow(1.2, level - 1));
  }

  static getStarUpCost(starRating: number): number {
    // Linear growth: 10, 20, 30, 40
    return starRating * 10;
  }

  static canLevelUp(hero: Hero): boolean {
    const cost = this.getLevelUpCost(hero.level);
    const items = InventoryManager.getItems();
    const expItem = items.find((i) => i.item.id === 'item_hero_exp');
    return (expItem?.quantity || 0) >= cost;
  }

  static canStarUp(hero: Hero): boolean {
    if (hero.starRating >= 5) return false;
    const cost = this.getStarUpCost(hero.starRating);
    const items = InventoryManager.getItems();
    const fragItem = items.find((i) => i.item.id === 'item_hero_fragment');
    return (fragItem?.quantity || 0) >= cost;
  }

  static levelUp(hero: Hero): boolean {
    if (!this.canLevelUp(hero)) return false;
    const cost = this.getLevelUpCost(hero.level);
    if (InventoryManager.removeItem('item_hero_exp', cost)) {
      hero.level++;
      return true;
    }
    return false;
  }

  static starUp(hero: Hero): boolean {
    if (!this.canStarUp(hero)) return false;
    const cost = this.getStarUpCost(hero.starRating);
    if (InventoryManager.removeItem('item_hero_fragment', cost)) {
      hero.starRating++;
      return true;
    }
    return false;
  }
}
