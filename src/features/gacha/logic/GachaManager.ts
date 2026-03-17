import { Hero, Quality } from '@/features/hero/types/Hero';
import { allHeroes } from '@/features/hero/data/heroes';
import { newTroopHeroes } from '@/features/hero/data/newHeroes';

export interface GachaPool {
  id: string;
  name: string;
  description: string;
  type: 'Limited' | 'Standard';
  cost: { type: string; amount: number }; // e.g. { type: 'diamond', amount: 100 }
  upHeroes: string[]; // Hero IDs
  rates: {
    [key in Quality]: number; // e.g. { RED: 0.05, ORANGE: 0.15, PURPLE: 0.80 }
  };
  pityLimit: number; // e.g. 10 or 80
}

export interface GachaResult {
  hero: Hero;
  isNew: boolean;
  convertedItem?: { id: string; amount: number }; // If duplicate, convert to shards
}

export class GachaManager {
  private pools: GachaPool[];
  private pityCounter: { [poolId: string]: number } = {};
  private history: { poolId: string; heroName: string; timestamp: number }[] = [];

  // Combined hero list
  private availableHeroes: Hero[];

  constructor() {
    this.availableHeroes = [...allHeroes, ...newTroopHeroes];

    this.pools = [
      {
        id: 'standard_pool',
        name: '常驻池',
        description: '包含所有非限定英雄',
        type: 'Standard',
        cost: { type: 'diamond', amount: 160 },
        upHeroes: [],
        rates: {
          [Quality.RED]: 0.02,
          [Quality.ORANGE]: 0.1,
          [Quality.PURPLE]: 0.88,
        },
        pityLimit: 10, // Small pity for testing, usually 80
      },
      {
        id: 'limited_pool',
        name: '限定UP池',
        description: '新兵种英雄概率提升！',
        type: 'Limited',
        cost: { type: 'diamond', amount: 160 },
        upHeroes: ['archer_1', 'cavalry_1'], // Elara, Lancelot
        rates: {
          [Quality.RED]: 0.02,
          [Quality.ORANGE]: 0.1,
          [Quality.PURPLE]: 0.88,
        },
        pityLimit: 10,
      },
    ];
  }

  public getPools(): GachaPool[] {
    return this.pools;
  }

  public getHistory() {
    return this.history;
  }

  public draw(poolId: string, count: number = 1): GachaResult[] {
    const pool = this.pools.find((p) => p.id === poolId);
    if (!pool) throw new Error('Pool not found');

    const results: GachaResult[] = [];

    for (let i = 0; i < count; i++) {
      results.push(this.drawOne(pool));
    }

    return results;
  }

  private drawOne(pool: GachaPool): GachaResult {
    this.pityCounter[pool.id] = (this.pityCounter[pool.id] || 0) + 1;

    let quality = Quality.PURPLE;
    const rand = Math.random();

    // Check Pity
    // Simplified: if reach limit, guarantee Orange+ (or Red?)
    // Usually pity guarantees highest tier. Let's say Red.
    // Or soft pity. Here we implement hard pity for Red at limit.
    // Actually, usually 10-pull guarantees purple, 80-pull red.
    // Let's implement: 10 count guarantees at least Orange for demo.

    if (this.pityCounter[pool.id] >= pool.pityLimit) {
      quality = Quality.ORANGE; // Guaranteed Orange+
      this.pityCounter[pool.id] = 0;
      // Re-roll for Red chance within this guaranteed slot?
      if (Math.random() < 0.2) quality = Quality.RED;
    } else {
      // Normal Rates
      if (rand < pool.rates[Quality.RED]) {
        quality = Quality.RED;
        this.pityCounter[pool.id] = 0; // Reset on hit
      } else if (rand < pool.rates[Quality.RED] + pool.rates[Quality.ORANGE]) {
        quality = Quality.ORANGE;
      } else {
        quality = Quality.PURPLE;
      }
    }

    const hero = this.selectHeroByQuality(pool, quality);

    // Log
    this.history.unshift({
      poolId: pool.id,
      heroName: hero.name,
      timestamp: Date.now(),
    });
    if (this.history.length > 50) this.history.pop();

    return {
      hero,
      isNew: true, // In real app, check if owned
    };
  }

  private selectHeroByQuality(pool: GachaPool, quality: Quality): Hero {
    // Filter heroes by quality
    const candidates = this.availableHeroes.filter((h) => h.quality === quality);

    // Handle UP logic
    const upCandidates = candidates.filter((h) => pool.upHeroes.includes(h.id));
    const normalCandidates = candidates.filter((h) => !pool.upHeroes.includes(h.id));

    if (upCandidates.length > 0) {
      // 50% chance to get UP hero if available in this quality
      if (Math.random() < 0.5) {
        return upCandidates[Math.floor(Math.random() * upCandidates.length)];
      }

      if (normalCandidates.length > 0) {
        return normalCandidates[Math.floor(Math.random() * normalCandidates.length)];
      }
    }

    if (candidates.length === 0) {
      // Fallback if no heroes of this quality (shouldn't happen with full data)
      return this.availableHeroes[0];
    }

    return candidates[Math.floor(Math.random() * candidates.length)];
  }
}
