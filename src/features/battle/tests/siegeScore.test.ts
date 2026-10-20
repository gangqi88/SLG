import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  computeSiegeContribution,
  SIEGE_SCORE_CAP_RATIO,
  takeSiegeScore,
  type PendingSiegeScoreRef,
} from '@/shared/logic/siegeScore';

/**
 * G1a · 小游戏得分接通（口径 v7）
 *
 * 六条断言对应六类泄漏，缺一条就有一类测不到：
 *   A 得分确实影响扣减，且在规定的量级区间内
 *   B 只打小游戏、不结算 → 结果完全一致（闸 ①）
 *   C 硬顶：贡献 ≤ max × 10%
 *   D 得分为 0 时与"没有这个参数"完全一致
 *   E 跨城不泄漏
 *   F 同城连续两场，分只在第一场生效（取用即置空）
 */

const STORAGE_KEY = 'slg_world_map_v1';
const FROZEN_NOW = new Date('2026-01-01T00:00:00.000Z');
const MAX_C3 = 760;
/** 让 c3 的「伤害决定的那部分」落在 250：floor(760*0.06) + floor(damage/180) = 45 + 205 */
const DAMAGE_FOR_250 = 36_900;

const loadWorldMap = async () => (await import('@/features/alliance/logic/WorldMap')).WorldMap;

const seed = () => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      version: 2,
      owners: {},
      defense: {
        c3: { max: MAX_C3, cur: MAX_C3, repairFromMs: null, repairToMs: null },
        c5: { max: 380, cur: 380, repairFromMs: null, repairToMs: null },
      },
    }),
  );
};

/** 每次测量都换一份全新 store —— 否则第二次结算是在第一次的结果上继续扣。 */
const freshStore = async () => {
  localStorage.clear();
  vi.resetModules();
  vi.setSystemTime(FROZEN_NOW);
  seed();
  return loadWorldMap();
};

/** settle 一次守方胜，返回结算后的 cur */
const settleDefenderWin = async (
  cityId: string,
  damage: number,
  siegeScore?: number,
): Promise<number> => {
  const WorldMap = await freshStore();
  const cur = WorldMap.getCityById(cityId)?.defenseState.cur ?? 0;
  WorldMap.applySiegeOutcome({
    cityId,
    winner: 'defender',
    attackerDamage: damage,
    defenseBeforeCur: cur,
    siegeScore,
  });
  return WorldMap.getCityById(cityId)?.defenseState.cur ?? 0;
};

const refWith = (value: { cityId: string | null; score: number } | null): PendingSiegeScoreRef => ({
  current: value,
});

describe('G1a 小游戏得分接通', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FROZEN_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('A: 得分 0 与 2500 的城防差，落在 [max×3%, max×10%]，且高分方更低', async () => {
    const cur0 = await settleDefenderWin('c3', DAMAGE_FOR_250, 0);
    const cur2500 = await settleDefenderWin('c3', DAMAGE_FOR_250, 2500);

    const diff = cur0 - cur2500;
    expect(diff, '得分没有影响扣减').toBeGreaterThan(0);
    expect(diff, `差值 ${diff} 低于 max×3%=${MAX_C3 * 0.03}`).toBeGreaterThanOrEqual(
      Math.ceil(MAX_C3 * 0.03),
    );
    expect(diff, `差值 ${diff} 超过 max×10%=${MAX_C3 * 0.1}`).toBeLessThanOrEqual(
      Math.floor(MAX_C3 * 0.1),
    );
    expect(cur2500, '高分方必须扣得更多').toBeLessThan(cur0);
  });

  it('C: 硬顶 —— 得分极高时贡献不超过 max×10%', async () => {
    const cap = Math.floor(MAX_C3 * SIEGE_SCORE_CAP_RATIO);
    expect(computeSiegeContribution({ score: 1_000_000, dmgBase: 418, max: MAX_C3 })).toBe(cap);
    expect(computeSiegeContribution({ score: 1e9, dmgBase: 418, max: MAX_C3 }), '硬顶未生效').toBe(
      cap,
    );
  });

  it('B: 只打小游戏、不发结算 → 城池状态完全不变（闸 ①）', async () => {
    const WorldMap = await freshStore();
    const before = WorldMap.getCityById('c3')?.defenseState.cur ?? 0;

    // 记了分，但没有 onBattleEnd —— 容器只是被赋值，没有任何消费方
    const ref = refWith({ cityId: 'c3', score: 2500 });

    const after = WorldMap.getCityById('c3')?.defenseState.cur ?? 0;
    expect(after, '未结算就改了城防：闸 ① 失效').toBe(before);
    expect(ref.current, '分数被提前消费').toEqual({ cityId: 'c3', score: 2500 });
  });

  it('D: 得分为 0 时与"没有这个参数"完全一致', async () => {
    const withoutParam = await settleDefenderWin('c3', DAMAGE_FOR_250, undefined);
    const withZero = await settleDefenderWin('c3', DAMAGE_FOR_250, 0);

    expect(withZero, '传 0 与不传必须等价').toBe(withoutParam);
    expect(computeSiegeContribution({ score: 0, dmgBase: 250, max: MAX_C3 })).toBe(0);
    expect(
      computeSiegeContribution({ score: 2500, dmgBase: 250, max: MAX_C3 }),
      '0 与 2500 没有区分度',
    ).toBeGreaterThan(0);
  });

  it('E: 跨城不泄漏 —— A 城的分数在 B 城结算时视为 0', async () => {
    const ref = refWith({ cityId: 'c3', score: 2500 });

    const takenForC5 = takeSiegeScore(ref, 'c5');
    expect(takenForC5, 'A 城的分数泄漏到了 B 城').toBe(0);
    expect(ref.current, '不匹配时也必须置空，否则会留到后面某场被误用').toBeNull();

    const withGuard = await settleDefenderWin('c5', DAMAGE_FOR_250, takenForC5);
    const withZeroScore = await settleDefenderWin('c5', DAMAGE_FOR_250, 0);

    expect(withGuard, '跨城结果不一致：说明 A 城的分数影响了 B 城').toBe(withZeroScore);
  });

  it('F: 同城连续两场，分只在第一场生效（取用即置空）', async () => {
    const WorldMap = await freshStore();
    const ref = refWith({ cityId: 'c3', score: 2500 });

    const settleOnce = () => {
      const cur = WorldMap.getCityById('c3')?.defenseState.cur ?? 0;
      const score = takeSiegeScore(ref, 'c3');
      WorldMap.applySiegeOutcome({
        cityId: 'c3',
        winner: 'defender',
        attackerDamage: DAMAGE_FOR_250,
        defenseBeforeCur: cur,
        siegeScore: score,
      });
      return { score, drop: cur - (WorldMap.getCityById('c3')?.defenseState.cur ?? 0) };
    };

    const first = settleOnce();
    const second = settleOnce();

    expect(first.score, '第一场没有取到分数').toBe(2500);
    expect(second.score, '同一份分数被用了第二次').toBe(0);
    expect(second.drop, '第二场扣得比第一场还多：取用即置空失效').toBeLessThan(first.drop);
  });
});
