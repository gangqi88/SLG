import { describe, it, expect, beforeEach } from 'vitest';
import { GachaManager } from '@/features/gacha/logic/GachaManager';
import { Quality } from '@/features/hero/types/Hero';

describe('GachaManager', () => {
  let gachaManager: GachaManager;

  beforeEach(() => {
    gachaManager = new GachaManager();
  });

  it('should initialize pools', () => {
    const pools = gachaManager.getPools();
    expect(pools.length).toBeGreaterThan(0);
    expect(pools.some((p) => p.id === 'standard_pool')).toBe(true);
  });

  it('should draw heroes from pool', () => {
    const results = gachaManager.draw('standard_pool', 1);
    expect(results.length).toBe(1);
    expect(results[0].hero).toBeDefined();
    expect(results[0].isNew).toBe(true);
  });

  it('should handle pity logic', () => {
    // Standard pool has pity limit 10
    // Force 10 draws, one should be Orange/Red

    // Note: Due to randomness, it's hard to test exact rates without mocking Math.random.
    // But pity guarantees a result.
    // Let's assume after 10 draws, at least one is high quality.

    const results = gachaManager.draw('standard_pool', 10);
    const hasHighQuality = results.some(
      (r) => r.hero.quality === Quality.ORANGE || r.hero.quality === Quality.RED,
    );
    expect(hasHighQuality).toBe(true);
  });

  it('should record history', () => {
    gachaManager.draw('standard_pool', 1);
    const history = gachaManager.getHistory();
    expect(history.length).toBe(1);
    expect(history[0].poolId).toBe('standard_pool');
  });
});
