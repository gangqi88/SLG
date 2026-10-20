import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  computeSiegeContribution,
  SIEGE_SCORE_CAP_RATIO,
  siegeScoreCap,
  takeSiegeScore,
  type PendingSiegeScoreRef,
} from '@/shared/logic/siegeScore';

/**
 * G1a · 小游戏得分接通（口径：形状 B「0 → cap 线性」）
 *
 * 断言分工：
 *   A  形状：score 0 vs 2500 的差值 **恰等于 cap**（不是"落在某区间"）
 *   A2 中段线性：score 750 → 差值 ≈ cap/2（±1）
 *   G  **0 处连续**：score 0 与 1 的贡献差 ≤ cap/1000 ⇒ 不许出现阶跃
 *   B  闸 ①：只打小游戏、不结算 → 城防完全不变
 *   C  硬顶：饱和后继续加分不再增加
 *   D  0 与"不传参数"完全等价
 *   E  跨城不泄漏 ｜ F 同城两场只第一场生效
 *
 * 为什么要 A2 和 G：
 *   原来的 A 只断言"差值落在 [3%,10%]" —— **阶跃形状和线性形状都能通过**，
 *   它验的是"有区分度"，不是"形状对"。G 专门拦"改回阶跃"。
 */

const STORAGE_KEY = 'slg_world_map_v1';
const FROZEN_NOW = new Date('2026-01-01T00:00:00.000Z');
const MAX_C3 = 760;
/** 伤害侧扣减：形状 B 与它无关，这里只要一个稳定值 */
const DAMAGE = 36_900;

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

const CAP_C3 = siegeScoreCap(MAX_C3); // 76

describe('G1a 小游戏得分接通（形状 B）', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FROZEN_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('A: score 0 与 2500 的城防差恰等于 cap（2500 已饱和）', async () => {
    const cur0 = await settleDefenderWin('c3', DAMAGE, 0);
    const cur2500 = await settleDefenderWin('c3', DAMAGE, 2500);

    expect(cur2500, '高分方必须扣得更多').toBeLessThan(cur0);
    expect(cur0 - cur2500, `差值应恰为 cap=${CAP_C3}`).toBe(CAP_C3);
    expect(CAP_C3).toBe(Math.floor(MAX_C3 * SIEGE_SCORE_CAP_RATIO));
  });

  it('A2: 中段线性 —— score 750 的差值 ≈ cap/2（±1）', async () => {
    const cur0 = await settleDefenderWin('c3', DAMAGE, 0);
    const cur750 = await settleDefenderWin('c3', DAMAGE, 750);

    const diff = cur0 - cur750;
    expect(
      Math.abs(diff - CAP_C3 / 2),
      `中段差值 ${diff} 偏离 cap/2=${CAP_C3 / 2} 超过 1`,
    ).toBeLessThanOrEqual(1);
  });

  it('G: 曲线在 0 处连续 —— score 0 与 1 的贡献差 ≤ cap/1000（不许阶跃）', () => {
    const c0 = computeSiegeContribution({ score: 0, max: MAX_C3 });
    const c1 = computeSiegeContribution({ score: 1, max: MAX_C3 });

    // 阶跃形状（旧实现）在这里会是 50~76，直接被拦住
    expect(
      Math.abs(c1 - c0),
      `score 0→1 的贡献跳变 ${Math.abs(c1 - c0)}：曲线在 0 处不连续（阶跃）`,
    ).toBeLessThanOrEqual(CAP_C3 / 1000);
  });

  it('C: 硬顶 —— 饱和后继续加分不再增加', () => {
    expect(computeSiegeContribution({ score: 1_000_000, max: MAX_C3 })).toBe(CAP_C3);
    expect(computeSiegeContribution({ score: 1e9, max: MAX_C3 }), '硬顶未生效').toBe(CAP_C3);
  });

  it('B: 只打小游戏、不发结算 → 城池状态完全不变（闸 ①）', async () => {
    const WorldMap = await freshStore();
    const before = WorldMap.getCityById('c3')?.defenseState.cur ?? 0;

    const ref = refWith({ cityId: 'c3', score: 2500 });

    const after = WorldMap.getCityById('c3')?.defenseState.cur ?? 0;
    expect(after, '未结算就改了城防：闸 ① 失效').toBe(before);
    expect(ref.current, '分数被提前消费').toEqual({ cityId: 'c3', score: 2500 });
  });

  it('D: 得分为 0 时与"没有这个参数"完全一致', async () => {
    const withoutParam = await settleDefenderWin('c3', DAMAGE, undefined);
    const withZero = await settleDefenderWin('c3', DAMAGE, 0);

    expect(withZero, '传 0 与不传必须等价').toBe(withoutParam);
    expect(computeSiegeContribution({ score: 0, max: MAX_C3 }), '不打必须是 0（无基线）').toBe(0);
    expect(
      computeSiegeContribution({ score: 2500, max: MAX_C3 }),
      '0 与 2500 没有区分度',
    ).toBeGreaterThan(0);
  });

  it('E: 跨城不泄漏 —— A 城的分数在 B 城结算时视为 0', async () => {
    const ref = refWith({ cityId: 'c3', score: 2500 });

    const takenForC5 = takeSiegeScore(ref, 'c5');
    expect(takenForC5, 'A 城的分数泄漏到了 B 城').toBe(0);
    expect(ref.current, '不匹配时也必须置空，否则会留到后面某场被误用').toBeNull();

    const withGuard = await settleDefenderWin('c5', DAMAGE, takenForC5);
    const withZeroScore = await settleDefenderWin('c5', DAMAGE, 0);

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
        attackerDamage: DAMAGE,
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
