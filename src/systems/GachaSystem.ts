import { Hero, HeroQuality } from '../types/slg/hero.types';
import { humanHeroes, angelHeroes, demonHeroes } from '../config/heroes';

export interface GachaPool {
  id: string;
  name: string;
  description: string;
  cost: number;
  currency: 'gold' | 'diamond' | 'voucher';
  pulls: number;
  guaranteedQuality?: HeroQuality;
  guaranteedPull?: number;
  pool: PoolEntry[];
}

export interface PoolEntry {
  heroId: string;
  weight: number;
  quality: HeroQuality;
}

export interface GachaResult {
  heroes: Hero[];
  totalValue: number;
  isGuaranteed: boolean;
  pullCount: number;
}

export interface DrawHistory {
  id: string;
  poolId: string;
  timestamp: number;
  heroes: string[];
  cost: number;
}

export class GachaSystem {
  private static instance: GachaSystem;
  
  private pools: Map<string, GachaPool> = new Map();
  private drawHistory: DrawHistory[] = [];

  private constructor() {
    this.initializePools();
  }

  static getInstance(): GachaSystem {
    if (!GachaSystem.instance) {
      GachaSystem.instance = new GachaSystem();
    }
    return GachaSystem.instance;
  }

  private initializePools(): void {
    const allHeroes = [...humanHeroes, ...angelHeroes, ...demonHeroes];

    const createPoolEntry = (hero: Hero): PoolEntry => ({
      heroId: hero.id,
      weight: hero.rarity,
      quality: hero.quality
    });

    const createQualityPool = (quality: HeroQuality): PoolEntry[] => {
      return allHeroes
        .filter(h => h.quality === quality)
        .map(createPoolEntry);
    };

    this.pools.set('normal', {
      id: 'normal',
      name: '普通招募',
      description: '消耗金币抽取紫/橙将',
      cost: 1000,
      currency: 'gold',
      pulls: 1,
      pool: [
        ...createQualityPool('purple').map(e => ({ ...e, weight: e.weight * 2 })),
        ...createQualityPool('orange').map(e => ({ ...e, weight: e.weight * 3 }))
      ]
    });

    this.pools.set('advanced', {
      id: 'advanced',
      name: '高级招募',
      description: '消耗钻石抽取橙/红将',
      cost: 280,
      currency: 'diamond',
      pulls: 1,
      guaranteedQuality: 'orange',
      guaranteedPull: 10,
      pool: [
        ...createQualityPool('orange').map(e => ({ ...e, weight: e.weight * 3 })),
        ...createQualityPool('red').map(e => ({ ...e, weight: e.weight * 5 }))
      ]
    });

    this.pools.set('limited', {
      id: 'limited',
      name: '限定卡池',
      description: '限定英雄UP池',
      cost: 300,
      currency: 'diamond',
      pulls: 1,
      guaranteedQuality: 'orange',
      guaranteedPull: 8,
      pool: [
        ...createQualityPool('orange').map(e => ({ ...e, weight: e.weight * 2 })),
        ...createQualityPool('red').map(e => ({ ...e, weight: e.weight * 8 }))
      ]
    });

    this.pools.set('multi_normal', {
      id: 'multi_normal',
      name: '普通十连',
      description: '十连抽取，必出橙将',
      cost: 9000,
      currency: 'gold',
      pulls: 10,
      guaranteedQuality: 'orange',
      pool: [
        ...createQualityPool('purple').map(e => ({ ...e, weight: e.weight * 2 })),
        ...createQualityPool('orange').map(e => ({ ...e, weight: e.weight * 3 }))
      ]
    });

    this.pools.set('multi_advanced', {
      id: 'multi_advanced',
      name: '高级十连',
      description: '高级十连，必出红将',
      cost: 2600,
      currency: 'diamond',
      pulls: 10,
      guaranteedQuality: 'red',
      guaranteedPull: 10,
      pool: [
        ...createQualityPool('orange').map(e => ({ ...e, weight: e.weight * 3 })),
        ...createQualityPool('red').map(e => ({ ...e, weight: e.weight * 5 }))
      ]
    });
  }

  getPool(poolId: string): GachaPool | undefined {
    return this.pools.get(poolId);
  }

  getAllPools(): GachaPool[] {
    return Array.from(this.pools.values());
  }

  draw(poolId: string, playerCurrency: number): GachaResult | null {
    const pool = this.pools.get(poolId);
    if (!pool) {
      console.error('卡池不存在');
      return null;
    }

    if (playerCurrency < pool.cost) {
      console.error('货币不足');
      return null;
    }

    const heroes: Hero[] = [];
    const heroMap = this.getHeroMap();
    let guaranteedThisPull = false;
    let guaranteedCount = 0;

    for (let i = 0; i < pool.pulls; i++) {
      const isGuaranteed = pool.guaranteedPull && (i + 1) % pool.guaranteedPull === 0;
      if (isGuaranteed && pool.guaranteedQuality) {
        guaranteedThisPull = true;
        guaranteedCount++;
      }

      const hero = this.drawHero(pool.pool, isGuaranteed ? pool.guaranteedQuality : undefined);
      if (hero && heroMap.has(hero.heroId)) {
        const newHero = { ...heroMap.get(hero.heroId)!, id: `${hero.heroId}_${Date.now()}_${i}` };
        heroes.push(newHero);
      }
    }

    const history: DrawHistory = {
      id: `history_${Date.now()}`,
      poolId,
      timestamp: Date.now(),
      heroes: heroes.map(h => h.id),
      cost: pool.cost
    };
    this.drawHistory.push(history);

    const totalValue = heroes.reduce((sum, h) => sum + this.calculateHeroValue(h), 0);

    return {
      heroes,
      totalValue,
      isGuaranteed: guaranteedThisPull,
      pullCount: pool.pulls
    };
  }

  private drawHero(pool: PoolEntry[], guaranteedQuality?: HeroQuality): PoolEntry | null {
    let filteredPool = pool;

    if (guaranteedQuality) {
      const qualityPool = pool.filter(p => p.quality === guaranteedQuality);
      if (qualityPool.length > 0) {
        filteredPool = qualityPool;
      }
    }

    const totalWeight = filteredPool.reduce((sum, p) => sum + p.weight, 0);
    let random = Math.random() * totalWeight;

    for (const entry of filteredPool) {
      random -= entry.weight;
      if (random <= 0) {
        return entry;
      }
    }

    return filteredPool[filteredPool.length - 1] || null;
  }

  private getHeroMap(): Map<string, Hero> {
    const allHeroes = [...humanHeroes, ...angelHeroes, ...demonHeroes];
    const map = new Map<string, Hero>();
    allHeroes.forEach(h => map.set(h.id, h));
    return map;
  }

  private calculateHeroValue(hero: Hero): number {
    const qualityValues: Record<HeroQuality, number> = {
      'purple': 100,
      'orange': 500,
      'red': 2000
    };
    
    return qualityValues[hero.quality] * hero.stars;
  }

  getDrawHistory(poolId?: string): DrawHistory[] {
    if (poolId) {
      return this.drawHistory.filter(h => h.poolId === poolId);
    }
    return [...this.drawHistory];
  }

  getPoolStatistics(poolId: string): {
    totalPulls: number;
    qualityBreakdown: Record<HeroQuality, number>;
    totalCost: number;
  } {
    const history = this.getDrawHistory(poolId);
    const qualityBreakdown: Record<HeroQuality, number> = {
      'purple': 0,
      'orange': 0,
      'red': 0
    };

    let totalCost = 0;
    const heroMap = this.getHeroMap();

    history.forEach(h => {
      const pool = this.pools.get(h.poolId);
      if (pool) {
        totalCost += pool.cost;
      }
      
      h.heroes.forEach(heroId => {
        const originalHero = heroMap.get(heroId.split('_')[0]);
        if (originalHero) {
          qualityBreakdown[originalHero.quality]++;
        }
      });
    });

    return {
      totalPulls: history.length,
      qualityBreakdown,
      totalCost
    };
  }

  getProbability(poolId: string): Record<HeroQuality, number> {
    const pool = this.pools.get(poolId);
    if (!pool) return { purple: 0, orange: 0, red: 0 };

    const totalWeight = pool.pool.reduce((sum, p) => sum + p.weight, 0);
    const qualityWeights: Record<HeroQuality, number> = { purple: 0, orange: 0, red: 0 };

    pool.pool.forEach(p => {
      qualityWeights[p.quality] += p.weight;
    });

    return {
      purple: Math.round((qualityWeights.purple / totalWeight) * 100),
      orange: Math.round((qualityWeights.orange / totalWeight) * 100),
      red: Math.round((qualityWeights.red / totalWeight) * 100)
    };
  }

  getEvolutionMaterials(currentQuality: HeroQuality, targetQuality: HeroQuality): {
    heroSoul: number;
    factionCore: number;
    duplicateCards: number;
  } {
    if (currentQuality === 'purple' && targetQuality === 'orange') {
      return { heroSoul: 800, factionCore: 0, duplicateCards: 0 };
    }
    if (currentQuality === 'orange' && targetQuality === 'red') {
      return { heroSoul: 2000, factionCore: 100, duplicateCards: 0 };
    }
    return { heroSoul: 0, factionCore: 0, duplicateCards: 0 };
  }

  getStarMaterials(stars: number): { duplicateCards: number } {
    const materials: Record<number, { duplicateCards: number }> = {
      1: { duplicateCards: 0 },
      2: { duplicateCards: 0 },
      3: { duplicateCards: 2 },
      4: { duplicateCards: 3 },
      5: { duplicateCards: 5 }
    };
    return materials[stars] || { duplicateCards: 0 };
  }
}

export const gachaSystem = GachaSystem.getInstance();
